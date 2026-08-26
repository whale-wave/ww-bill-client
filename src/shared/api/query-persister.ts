import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { CACHE_MAX_AGE, CACHE_VERSION } from './query-client';

const DATABASE_NAME = 'ww-bill-query-cache';
const DATABASE_VERSION = 1;
const STORE_NAME = 'clients';
const FILE_PREFIX = `query-cache/${CACHE_VERSION}`;
export type AccountQueryPersister = Persister & {
  flush: () => Promise<void>;
  terminate: (mode?: 'retain' | 'remove') => Promise<void>;
  lease: SessionLease;
};

export interface SessionLease {
  isValid: () => boolean;
  invalidate: () => void;
}

export function createSessionLease(): SessionLease {
  let valid = true;
  return {
    isValid: () => valid,
    invalidate: () => {
      valid = false;
    },
  };
}

interface QueryCacheRecord {
  key: string;
  client: PersistedClient;
}

function getStorageKey(userId: string) {
  return `${CACHE_VERSION}:${userId}`;
}

function getFilePath(userId: string) {
  const safeUserId = userId.replace(/[^\w-]/g, '_');
  return `${FILE_PREFIX}/${safeUserId}.json`;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error ?? new Error('Unable to open query cache'));
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME))
        request.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function readIndexedDb(userId: string): Promise<PersistedClient | undefined> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(getStorageKey(userId));
    request.onerror = () => reject(request.error ?? new Error('Unable to read query cache'));
    request.onsuccess = () => resolve((request.result as QueryCacheRecord | undefined)?.client);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
  });
}

async function writeIndexedDb(userId: string, client: PersistedClient) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({ key: getStorageKey(userId), client } satisfies QueryCacheRecord);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Unable to write query cache'));
    };
  });
}

async function removeIndexedDb(userId: string) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(getStorageKey(userId));
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Unable to remove query cache'));
    };
  });
}

async function readFilesystem(userId: string): Promise<PersistedClient | undefined> {
  try {
    const result = await Filesystem.readFile({
      path: getFilePath(userId),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    return JSON.parse(String(result.data)) as PersistedClient;
  }
  catch (error) {
    if ((error as { code?: string }).code !== 'OS-PLUG-FILE-0008')
      throw error;
    return undefined;
  }
}

async function writeFilesystem(userId: string, client: PersistedClient) {
  const path = getFilePath(userId);
  const temporaryPath = `${path}.tmp`;
  await Filesystem.writeFile({
    path: temporaryPath,
    directory: Directory.Data,
    data: JSON.stringify(client),
    encoding: Encoding.UTF8,
    recursive: true,
  });
  try {
    await Filesystem.rename({
      from: temporaryPath,
      to: path,
      directory: Directory.Data,
    });
  }
  catch {
    await Filesystem.writeFile({
      path,
      directory: Directory.Data,
      data: JSON.stringify(client),
      encoding: Encoding.UTF8,
      recursive: true,
    });
    await Filesystem.deleteFile({ path: temporaryPath, directory: Directory.Data }).catch(() => undefined);
  }
}

async function removeFilesystem(userId: string) {
  for (const path of [getFilePath(userId), `${getFilePath(userId)}.tmp`]) {
    try {
      await Filesystem.deleteFile({ path, directory: Directory.Data });
    }
    catch (error) {
      if ((error as { code?: string }).code !== 'OS-PLUG-FILE-0008')
        throw error;
    }
  }
}

type StorageOperation<T> = () => Promise<T>;
const coordinatorTails = new Map<string, Promise<void>>();
const coordinatorTombstones = new Set<string>();

function enqueue<T>(key: string, operation: StorageOperation<T>): Promise<T> {
  const previous = coordinatorTails.get(key) ?? Promise.resolve();
  const run = previous.catch(() => undefined).then(operation);
  const tail = run.then(() => undefined, () => undefined);
  coordinatorTails.set(key, tail);
  void tail.finally(() => {
    if (coordinatorTails.get(key) === tail)
      coordinatorTails.delete(key);
  });
  return run;
}

async function rawRead(userId: string) {
  return Capacitor.isNativePlatform() ? readFilesystem(userId) : readIndexedDb(userId);
}

async function rawWrite(userId: string, client: PersistedClient) {
  if (Capacitor.isNativePlatform())
    await writeFilesystem(userId, client);
  else
    await writeIndexedDb(userId, client);
}

async function rawRemove(userId: string) {
  if (Capacitor.isNativePlatform())
    await removeFilesystem(userId);
  else
    await removeIndexedDb(userId);
}

function sanitizePersistedClient(client: PersistedClient): PersistedClient {
  if (!client.clientState.mutations?.length)
    return client;
  return {
    ...client,
    clientState: { ...client.clientState, mutations: [] },
  };
}

export function createQueryCachePersister(userId: string): AccountQueryPersister {
  let pendingClient: PersistedClient | undefined;
  let persistTimer: ReturnType<typeof setTimeout> | undefined;
  const lease = createSessionLease();
  let terminalPromise: Promise<void> | undefined;
  let terminalMode: 'retain' | 'remove' | undefined;

  const queueWrite = (client: PersistedClient) => {
    return enqueue(getStorageKey(userId), async () => {
      if (!lease.isValid() || coordinatorTombstones.has(getStorageKey(userId)))
        return;
      await rawWrite(userId, client);
      coordinatorTombstones.delete(getStorageKey(userId));
    });
  };

  const scheduleFlush = () => {
    const client = pendingClient;
    pendingClient = undefined;
    persistTimer = undefined;
    if (!client || !lease.isValid())
      return Promise.resolve();
    return queueWrite(client).catch(() => undefined);
  };

  const persister: AccountQueryPersister = {
    persistClient: (client) => {
      if (terminalMode || !lease.isValid())
        return Promise.resolve();
      pendingClient = client;
      if (!persistTimer)
        persistTimer = setTimeout(scheduleFlush, 1000);
      return Promise.resolve();
    },
    flush: async () => {
      if (persistTimer) {
        clearTimeout(persistTimer);
        persistTimer = undefined;
      }
      await scheduleFlush();
    },
    restoreClient: async () => {
      if (terminalMode || !lease.isValid())
        return undefined;
      try {
        const client = await enqueue(getStorageKey(userId), async () => {
          if (!lease.isValid() || coordinatorTombstones.has(getStorageKey(userId)))
            return undefined;
          return rawRead(userId);
        });
        if (!lease.isValid() || terminalMode)
          return undefined;
        if (!client || Date.now() - client.timestamp > CACHE_MAX_AGE) {
          await enqueue(getStorageKey(userId), () => rawRemove(userId)).catch(() => undefined);
          return undefined;
        }
        const sanitized = sanitizePersistedClient(client);
        if (sanitized !== client)
          await enqueue(getStorageKey(userId), () => rawWrite(userId, sanitized)).catch(() => undefined);
        return sanitized;
      }
      catch {
        return undefined;
      }
    },
    removeClient: async () => persister.terminate('remove'),
    terminate: async (mode = 'remove') => {
      if (mode === 'retain') {
        terminalMode = 'retain';
        lease.invalidate();
        pendingClient = undefined;
        if (persistTimer) {
          clearTimeout(persistTimer);
          persistTimer = undefined;
        }
        return;
      }
      if (terminalPromise)
        return terminalPromise;
      terminalMode = 'remove';
      lease.invalidate();
      pendingClient = undefined;
      if (persistTimer) {
        clearTimeout(persistTimer);
        persistTimer = undefined;
      }
      coordinatorTombstones.add(getStorageKey(userId));
      terminalPromise = enqueue(getStorageKey(userId), async () => {
        await rawRemove(userId);
        coordinatorTombstones.delete(getStorageKey(userId));
      }).catch(() => undefined);
      return terminalPromise;
    },
    lease,
  };

  return persister;
}

export async function removeQueryCache(userId: string | undefined) {
  if (!userId)
    return;
  coordinatorTombstones.add(getStorageKey(userId));
  await enqueue(getStorageKey(userId), async () => {
    await rawRemove(userId);
    coordinatorTombstones.delete(getStorageKey(userId));
  }).catch(() => undefined);
}

export { CACHE_MAX_AGE, CACHE_VERSION };

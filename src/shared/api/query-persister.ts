import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

const CACHE_VERSION = 'v1';
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 30;
const DATABASE_NAME = 'ww-bill-query-cache';
const DATABASE_VERSION = 1;
const STORE_NAME = 'clients';
const FILE_PREFIX = `query-cache/${CACHE_VERSION}`;
export type AccountQueryPersister = Persister & { flush: () => Promise<void> };

const activePersisters = new Map<string, AccountQueryPersister>();

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
  catch {
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
  await Filesystem.deleteFile({ path: getFilePath(userId), directory: Directory.Data }).catch(() => undefined);
  await Filesystem.deleteFile({ path: `${getFilePath(userId)}.tmp`, directory: Directory.Data }).catch(() => undefined);
}

export function createQueryCachePersister(userId: string): AccountQueryPersister {
  let pendingClient: PersistedClient | undefined;
  let persistTimer: ReturnType<typeof setTimeout> | undefined;
  let writeChain = Promise.resolve();
  let generation = 0;

  const queueWrite = (client: PersistedClient, currentGeneration: number) => {
    writeChain = writeChain.then(async () => {
      if (currentGeneration !== generation)
        return;
      if (Capacitor.isNativePlatform())
        await writeFilesystem(userId, client);
      else
        await writeIndexedDb(userId, client);
    }).catch(() => undefined);
    return writeChain;
  };

  const scheduleFlush = () => {
    const client = pendingClient;
    pendingClient = undefined;
    persistTimer = undefined;
    if (!client)
      return writeChain;
    return queueWrite(client, generation);
  };

  const persister: AccountQueryPersister = {
    persistClient: (client) => {
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
      try {
        const client = Capacitor.isNativePlatform()
          ? await readFilesystem(userId)
          : await readIndexedDb(userId);
        if (!client || Date.now() - client.timestamp > CACHE_MAX_AGE) {
          await removeStoredQueryCache(userId);
          return undefined;
        }
        return client;
      }
      catch {
        await removeStoredQueryCache(userId);
        return undefined;
      }
    },
    removeClient: async () => {
      generation += 1;
      pendingClient = undefined;
      if (persistTimer) {
        clearTimeout(persistTimer);
        persistTimer = undefined;
      }
      await writeChain;
      await removeStoredQueryCache(userId);
    },
  };

  activePersisters.set(userId, persister);
  return persister;
}

export async function removeQueryCache(userId: string | undefined) {
  if (!userId)
    return;
  const activePersister = activePersisters.get(userId);
  if (activePersister) {
    activePersisters.delete(userId);
    await activePersister.removeClient();
    return;
  }
  await removeStoredQueryCache(userId);
}

async function removeStoredQueryCache(userId: string) {
  try {
    if (Capacitor.isNativePlatform())
      await removeFilesystem(userId);
    else
      await removeIndexedDb(userId);
  }
  catch {
    // A missing or unavailable cache must not prevent logout.
  }
}

export { CACHE_MAX_AGE, CACHE_VERSION };

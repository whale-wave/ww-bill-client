import type { AppLockCredential } from './types';
import { serializePattern } from './pattern';

export const APP_LOCK_PBKDF2_ITERATIONS = 120_000;

function toBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), char => char.charCodeAt(0));
}

function getCrypto() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues)
    throw new Error('APP_LOCK_CRYPTO_UNAVAILABLE');
  return globalThis.crypto;
}

async function deriveDigest(
  pattern: number[],
  salt: Uint8Array,
  iterations: number,
) {
  const crypto = getCrypto();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(serializePattern(pattern)),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { hash: 'SHA-256', iterations, name: 'PBKDF2', salt: salt as BufferSource },
    key,
    256,
  );
  return toBase64(new Uint8Array(bits));
}

export async function createAppLockCredential(
  pattern: number[],
): Promise<AppLockCredential> {
  const crypto = getCrypto();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    algorithm: 'PBKDF2-SHA256',
    digest: await deriveDigest(pattern, salt, APP_LOCK_PBKDF2_ITERATIONS),
    iterations: APP_LOCK_PBKDF2_ITERATIONS,
    salt: toBase64(salt),
  };
}

export async function verifyAppLockPattern(
  pattern: number[],
  credential: AppLockCredential,
) {
  const digest = await deriveDigest(
    pattern,
    fromBase64(credential.salt),
    credential.iterations,
  );
  if (digest.length !== credential.digest.length)
    return false;
  let result = 0;
  for (let index = 0; index < digest.length; index++)
    result |= digest.charCodeAt(index) ^ credential.digest.charCodeAt(index);
  return result === 0;
}

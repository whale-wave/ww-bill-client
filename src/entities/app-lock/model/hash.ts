import type { AppLockCredential } from './types';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
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

function getRandomCrypto() {
  if (!globalThis.crypto?.getRandomValues)
    throw new Error('APP_LOCK_CRYPTO_UNAVAILABLE');
  return globalThis.crypto;
}

async function deriveDigest(
  pattern: number[],
  salt: Uint8Array,
  iterations: number,
) {
  const digest = await pbkdf2Async(
    sha256,
    new TextEncoder().encode(serializePattern(pattern)),
    salt,
    { asyncTick: 10, c: iterations, dkLen: 32 },
  );
  return toBase64(digest);
}

export async function createAppLockCredential(
  pattern: number[],
): Promise<AppLockCredential> {
  const crypto = getRandomCrypto();
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

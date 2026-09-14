import { describe, expect, it } from 'vitest';
import { resolveAndroidReleaseBuildMetadata } from '../../scripts/build-android-release.mjs';

describe('android production release build metadata', () => {
  it('uses the clean tagged HEAD as the embedded version and build id', () => {
    expect(resolveAndroidReleaseBuildMetadata({
      androidVersionCode: 10,
      gitStatus: '',
      headCommit: '0123456789abcdef0123456789abcdef01234567',
      packageVersion: '1.0.10',
      tagCommit: '0123456789abcdef0123456789abcdef01234567',
    })).toEqual({
      androidVersionCode: 10,
      buildId: '0123456789abcdef0123456789abcdef01234567',
      tagName: 'v1.0.10',
      version: '1.0.10',
    });
  });

  it.each([
    ['dirty worktree', { gitStatus: ' M src/main.tsx' }, '工作区必须干净'],
    ['invalid semantic version', { packageVersion: 'release-10' }, 'version 必须是'],
    ['invalid Android version code', { androidVersionCode: 0 }, 'androidVersionCode'],
    ['missing version tag', { tagCommit: null }, '标签 v1.0.10 不存在'],
    ['tag points elsewhere', { tagCommit: 'fedcba9876543210fedcba9876543210fedcba98' }, '必须指向当前 HEAD'],
  ])('rejects %s', (_name, overrides, expectedMessage) => {
    expect(() => resolveAndroidReleaseBuildMetadata({
      androidVersionCode: 10,
      gitStatus: '',
      headCommit: '0123456789abcdef0123456789abcdef01234567',
      packageVersion: '1.0.10',
      tagCommit: '0123456789abcdef0123456789abcdef01234567',
      ...overrides,
    })).toThrow(expectedMessage);
  });
});

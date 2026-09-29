import { describe, expect, it } from 'vitest';
import {
  createAndroidReleaseBuildEnvironment,
  resolveAndroidGradleTask,
  resolveAndroidReleaseBuildMetadata,
} from '../../scripts/build-android-release.mjs';

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

  it('sets the same tagged commit and version for build metadata and client code', () => {
    expect(createAndroidReleaseBuildEnvironment({
      androidVersionCode: 10,
      buildId: '0123456789abcdef0123456789abcdef01234567',
      tagName: 'v1.0.10',
      version: '1.0.10',
    }, {
      PATH: '/usr/bin',
      VITE_APP_BUILD_ID: 'stale-build',
      VITE_APP_VERSION: '0.0.1',
    })).toMatchObject({
      APP_BUILD_ID: '0123456789abcdef0123456789abcdef01234567',
      APP_VERSION: '1.0.10',
      PATH: '/usr/bin',
      VITE_APP_BUILD_ID: '0123456789abcdef0123456789abcdef01234567',
      VITE_APP_VERSION: '1.0.10',
    });
  });

  it('builds a debug-signed APK from the same validated production metadata', () => {
    expect(resolveAndroidGradleTask(['--debug'])).toBe('assembleDebug');
    expect(resolveAndroidGradleTask([])).toBe('assembleRelease');
    expect(() => resolveAndroidGradleTask(['--unknown'])).toThrow('未知的 Android 构建参数');
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

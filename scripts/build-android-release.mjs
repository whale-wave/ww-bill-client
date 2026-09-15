import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function resolveAndroidReleaseBuildMetadata(input) {
  const version = String(input.packageVersion ?? '').trim();
  const tagName = `v${version}`;

  if (input.gitStatus.trim())
    throw new Error('生产安装包构建前 Git 工作区必须干净');
  if (!/^\d+\.\d+\.\d+$/.test(version))
    throw new Error('package.json version 必须是 x.y.z 格式');
  if (!Number.isSafeInteger(input.androidVersionCode) || input.androidVersionCode < 1)
    throw new Error('package.json appRelease.androidVersionCode 必须是正整数');
  if (!input.tagCommit)
    throw new Error(`标签 ${tagName} 不存在，请先提交版本变更并创建标签`);
  if (input.tagCommit !== input.headCommit)
    throw new Error(`标签 ${tagName} 必须指向当前 HEAD`);

  return {
    androidVersionCode: input.androidVersionCode,
    buildId: input.headCommit,
    tagName,
    version,
  };
}

export function createAndroidReleaseBuildEnvironment(metadata, baseEnvironment = process.env) {
  return {
    ...baseEnvironment,
    APP_BUILD_ID: metadata.buildId,
    APP_VERSION: metadata.version,
    VITE_APP_BUILD_ID: metadata.buildId,
    VITE_APP_VERSION: metadata.version,
  };
}

export function resolveAndroidGradleTask(args) {
  if (args.length === 0)
    return 'assembleRelease';
  if (args.length === 1 && args[0] === '--debug')
    return 'assembleDebug';
  throw new Error(`未知的 Android 构建参数：${args.join(' ')}`);
}

function git(args) {
  return execFileSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function resolveTagCommit(tagName) {
  try {
    return git(['rev-parse', `${tagName}^{commit}`]);
  }
  catch {
    return null;
  }
}

export function runAndroidReleaseBuild(args = process.argv.slice(2)) {
  const packageInfo = JSON.parse(readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8'));
  const version = String(packageInfo.version ?? '').trim();
  const gradleTask = resolveAndroidGradleTask(args);
  const metadata = resolveAndroidReleaseBuildMetadata({
    androidVersionCode: packageInfo.appRelease?.androidVersionCode,
    gitStatus: git(['status', '--porcelain', '--untracked-files=all']),
    headCommit: git(['rev-parse', 'HEAD']),
    packageVersion: version,
    tagCommit: resolveTagCommit(`v${version}`),
  });
  const environment = createAndroidReleaseBuildEnvironment(metadata);

  execFileSync('pnpm', ['app:sync:prod'], {
    cwd: repositoryRoot,
    env: environment,
    stdio: 'inherit',
  });
  execFileSync('./gradlew', [gradleTask], {
    cwd: resolve(repositoryRoot, 'android'),
    env: environment,
    stdio: 'inherit',
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  runAndroidReleaseBuild();

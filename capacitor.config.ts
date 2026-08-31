import type { CapacitorConfig } from '@capacitor/cli';
import process from 'node:process';

const isTestBuild = process.env.CAPACITOR_BUILD_ENV === 'test';
const defaultAppId = 'com.demo.www';

function appIdFromHost(host?: string): string {
  if (!host)
    return defaultAppId;

  const hostname = host
    .replace(/^[a-z]+:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .toLowerCase();

  if (!hostname || hostname === 'demo.com')
    return defaultAppId;

  const labels = hostname.split('.').filter(Boolean);
  if (labels.length < 2)
    return defaultAppId;

  const appId = labels.reverse().join('.');
  return /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+$/.test(appId)
    ? appId
    : defaultAppId;
}

const config: CapacitorConfig = {
  appId: appIdFromHost(process.env.VITE_HOST),
  appName: '鲸浪账本',
  webDir: 'dist',
  ...(isTestBuild
    ? {
        android: {
          allowMixedContent: true,
        },
        server: {
          cleartext: true,
        },
      }
    : {}),
};

export default config;

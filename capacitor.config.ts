import type { CapacitorConfig } from '@capacitor/cli';
import process from 'node:process';

const isTestBuild = process.env.CAPACITOR_BUILD_ENV === 'test';
const productionAppId = 'top.avan.bill';
const testAppId = `${productionAppId}.test`;

function assertProductionHost(host?: string) {
  if (!host)
    throw new Error('VITE_HOST is required for a production Capacitor build');
  const parsed = new URL(host);
  if (parsed.protocol !== 'https:' || parsed.hostname === 'www.demo.com' || parsed.hostname === 'demo.com')
    throw new Error('VITE_HOST must be a real HTTPS production host');
}

if (process.env.CAPACITOR_BUILD_ENV === 'production')
  assertProductionHost(process.env.VITE_HOST);

const config: CapacitorConfig = {
  appId: isTestBuild ? testAppId : productionAppId,
  appName: '鲸浪记账',
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

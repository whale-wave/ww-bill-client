const ICLOUD_SHORTCUT_ORIGIN = 'https://www.icloud.com';
const ICLOUD_SHORTCUT_PATH = /^\/shortcuts\/[A-Za-z0-9]+\/?$/;

export function getShortcutTokenRetryAt(data: unknown, now = Date.now()) {
  if (!data || typeof data !== 'object' || !('retryAt' in data))
    return undefined;
  const { retryAt } = data;
  if (typeof retryAt !== 'string')
    return undefined;
  const retryAtMs = Date.parse(retryAt);
  if (!Number.isFinite(retryAtMs) || retryAtMs <= now)
    return undefined;
  return new Date(Math.ceil(retryAtMs / 1000) * 1000);
}

export function getIosShortcutInstallUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim())
    return undefined;

  try {
    const url = new URL(value.trim());
    if (url.origin !== ICLOUD_SHORTCUT_ORIGIN || !ICLOUD_SHORTCUT_PATH.test(url.pathname))
      return undefined;
    return url.toString();
  }
  catch {
    return undefined;
  }
}

export function getConfiguredIosShortcutInstallUrl() {
  return getIosShortcutInstallUrl(import.meta.env.VITE_IOS_SHORTCUT_URL);
}

export function openIosShortcutInstallUrl(url: string) {
  window.location.assign(url);
}

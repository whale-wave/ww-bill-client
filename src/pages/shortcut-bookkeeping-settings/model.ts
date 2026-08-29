const ICLOUD_SHORTCUT_ORIGIN = 'https://www.icloud.com';
const ICLOUD_SHORTCUT_PATH = /^\/shortcuts\/[A-Za-z0-9]+\/?$/;

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

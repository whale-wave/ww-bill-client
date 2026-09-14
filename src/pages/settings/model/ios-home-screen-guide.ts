export interface BrowserPlatformInfo {
  displayModeStandalone: boolean;
  maxTouchPoints: number;
  nativePlatform: boolean;
  userAgent: string;
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export function isIosBrowser({
  displayModeStandalone,
  maxTouchPoints,
  nativePlatform,
  userAgent,
}: BrowserPlatformInfo) {
  if (nativePlatform || displayModeStandalone)
    return false;

  const isIphoneOrIpad = /iPad|iPhone|iPod/i.test(userAgent);
  // iPadOS desktop mode reports itself as Macintosh, but retains touch points.
  const isIpadDesktopMode = /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
  return isIphoneOrIpad || isIpadDesktopMode;
}

export function getBrowserPlatformInfo(nativePlatform: boolean): BrowserPlatformInfo {
  if (typeof window === 'undefined') {
    return {
      displayModeStandalone: false,
      maxTouchPoints: 0,
      nativePlatform,
      userAgent: '',
    };
  }

  const navigatorWithStandalone = navigator as NavigatorWithStandalone;
  return {
    displayModeStandalone: navigatorWithStandalone.standalone === true
      || window.matchMedia?.('(display-mode: standalone)').matches === true,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    nativePlatform,
    userAgent: navigator.userAgent,
  };
}

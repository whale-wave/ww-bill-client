import { Capacitor } from '@capacitor/core';

export function buildDeviceContext() {
  let timezone: string | undefined;
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  catch {
    // Device diagnostics must not prevent reporting on older WebViews.
  }
  return {
    platform: Capacitor.getPlatform(),
    user_agent: navigator.userAgent,
    language: navigator.language,
    timezone,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    pixel_ratio: window.devicePixelRatio,
    orientation: window.screen.orientation?.type,
    standalone: window.matchMedia?.('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true,
  };
}

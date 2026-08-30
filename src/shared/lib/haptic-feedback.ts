import { Capacitor } from '@capacitor/core';
import {
  Haptics,
  ImpactStyle,
  NotificationType,
} from '@capacitor/haptics';

type VibrationPattern = number | number[];

interface VibratingNavigator {
  vibrate?: (pattern: VibrationPattern) => boolean;
}

function vibrateWeb(pattern: VibrationPattern) {
  const navigatorWithVibration = globalThis.navigator as unknown as VibratingNavigator | undefined;
  navigatorWithVibration?.vibrate?.(pattern);
}

export class HapticFeedback {
  private isEnabled = false;

  close() {
    this.isEnabled = false;
  }

  open() {
    this.isEnabled = true;
  }

  impact() {
    if (!this.isEnabled)
      return;

    if (Capacitor.isNativePlatform()) {
      void Haptics.impact({ style: ImpactStyle.Light })
        .catch(() => vibrateWeb(15));
      return;
    }

    vibrateWeb(15);
  }

  success() {
    if (!this.isEnabled)
      return;

    if (Capacitor.isNativePlatform()) {
      void Haptics.notification({ type: NotificationType.Success })
        .catch(() => vibrateWeb([15, 35, 25]));
      return;
    }

    vibrateWeb([15, 35, 25]);
  }
}

export const hapticFeedback = new HapticFeedback();

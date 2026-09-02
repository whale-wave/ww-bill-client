import { createContext, useContext } from 'react';

export interface MotionPreference {
  isMotionEnabled: boolean;
  shouldReduceMotion: boolean;
}

export const MOTION_PRESETS = {
  contentSwap: {
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    initial: { opacity: 0, y: 8 },
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  press: {
    scale: 0.97,
    transition: { duration: 0.12, ease: 'easeOut' },
  },
  selection: {
    scale: [1, 0.96, 1.02, 1],
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  success: {
    animate: { opacity: 1, scale: 1, y: 0 },
    initial: { opacity: 0, scale: 0.92, y: 8 },
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

export const MotionPreferenceContext = createContext<MotionPreference>({
  isMotionEnabled: false,
  shouldReduceMotion: true,
});

export function resolveMotionPreference({
  enabled,
  isSeniorMode,
  prefersReducedMotion,
}: {
  enabled: boolean;
  isSeniorMode: boolean;
  prefersReducedMotion: boolean;
}): MotionPreference {
  const shouldReduceMotion = !enabled || isSeniorMode || prefersReducedMotion;
  return {
    isMotionEnabled: !shouldReduceMotion,
    shouldReduceMotion,
  };
}

export function useMotionPreference(): MotionPreference {
  return useContext(MotionPreferenceContext);
}

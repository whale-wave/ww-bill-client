import type { FC, ReactNode } from 'react';
import {
  domAnimation,
  LazyMotion,
  MotionConfig,
  useReducedMotion,
} from 'motion/react';
import { useMemo } from 'react';
import {
  MotionPreferenceContext,
  resolveMotionPreference,
} from './motion-preference';

export interface MotionProviderProps {
  children: ReactNode;
  enabled: boolean;
  isSeniorMode?: boolean;
}

export const MotionProvider: FC<MotionProviderProps> = ({ children, enabled, isSeniorMode = false }) => {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const preference = useMemo(() => resolveMotionPreference({
    enabled,
    isSeniorMode,
    prefersReducedMotion,
  }), [enabled, isSeniorMode, prefersReducedMotion]);

  return (
    <MotionPreferenceContext.Provider value={preference}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig
          reducedMotion={preference.shouldReduceMotion ? 'always' : 'user'}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </MotionConfig>
      </LazyMotion>
    </MotionPreferenceContext.Provider>
  );
};

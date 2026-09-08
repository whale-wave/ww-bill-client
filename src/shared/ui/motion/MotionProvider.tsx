import type { FC, ReactNode } from 'react';
import {
  LazyMotion,
  MotionConfig,
  useReducedMotion,
} from 'motion/react';
import { useMemo } from 'react';
import { loadMotionFeatures } from './load-motion-features';
import {
  MotionPreferenceContext,
  resolveMotionPreference,
} from './motion-preference';

export interface MotionProviderProps {
  children: ReactNode;
  isSeniorMode?: boolean;
}

export const MotionProvider: FC<MotionProviderProps> = ({ children, isSeniorMode = false }) => {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const preference = useMemo(() => resolveMotionPreference({
    isSeniorMode,
    prefersReducedMotion,
  }), [isSeniorMode, prefersReducedMotion]);

  return (
    <MotionPreferenceContext.Provider value={preference}>
      <LazyMotion features={loadMotionFeatures} strict>
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

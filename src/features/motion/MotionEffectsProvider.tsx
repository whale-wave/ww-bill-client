import type { FC, ReactNode } from 'react';
import { useSeniorMode } from '@/shared/lib/senior-mode';
import { MotionProvider } from '@/shared/ui';

export const MotionEffectsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { isSeniorMode } = useSeniorMode();

  return (
    <MotionProvider isSeniorMode={isSeniorMode}>
      {children}
    </MotionProvider>
  );
};

import type { FC, ReactNode } from 'react';
import { useGetUserAppConfigQuery } from '@/entities/user-app-config';
import { useAuthStore } from '@/features/auth';
import { useSeniorMode } from '@/shared/lib/senior-mode';
import { MotionProvider } from '@/shared/ui';

export const MotionEffectsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const token = useAuthStore(state => state.token);
  const { data: config } = useGetUserAppConfigQuery({
    options: { enabled: Boolean(token) },
  });
  const { isSeniorMode } = useSeniorMode();

  return (
    <MotionProvider enabled={config?.isOpenMotionEffect ?? true} isSeniorMode={isSeniorMode}>
      {children}
    </MotionProvider>
  );
};

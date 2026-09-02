import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useGetUserAppConfigQuery } from '@/entities/user-app-config';
import { useAuthStore } from '@/features/auth';
import { applyAppearancePreference, readAppearancePreference, resetAppearancePreference } from '../model/appearance';

export function AppearanceProvider({ children }: PropsWithChildren) {
  const token = useAuthStore(state => state.token);
  const appearanceQuery = useGetUserAppConfigQuery({
    queryOptions: { enabled: Boolean(token) },
  });

  useEffect(() => {
    if (!token) {
      resetAppearancePreference();
      return;
    }
    if (appearanceQuery.data)
      applyAppearancePreference(readAppearancePreference(appearanceQuery.data));
  }, [appearanceQuery.data, token]);

  return children;
}

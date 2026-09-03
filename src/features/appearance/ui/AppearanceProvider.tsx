import type { PropsWithChildren } from 'react';
import { useEffect, useLayoutEffect } from 'react';
import { useGetUserAppConfigQuery } from '@/entities/user-app-config';
import { useAuthStore } from '@/features/auth';
import { applyAppearancePreference, readAppearancePreference, resetAppearancePreference } from '../model/appearance';
import { readAppearancePreferenceMirror, writeAppearancePreferenceMirror } from '../model/appearance-mirror';

export function AppearanceProvider({ children }: PropsWithChildren) {
  const token = useAuthStore(state => state.token);
  const userId = useAuthStore(state => state.userId);
  const appearanceQuery = useGetUserAppConfigQuery({
    queryOptions: { enabled: Boolean(token) },
  });

  // Account transitions are synchronous visual boundaries. Resolve the
  // per-user mirror before the next authenticated frame can paint; the server
  // response below remains the authority and reconciles this preview later.
  useLayoutEffect(() => {
    if (!token || !userId) {
      resetAppearancePreference();
      return;
    }
    applyAppearancePreference(readAppearancePreferenceMirror(userId));
  }, [token, userId]);

  useEffect(() => {
    if (!token || !userId || !appearanceQuery.data)
      return;

    // Do not let a late response from another account overwrite the active
    // account's root token or local mirror.
    if (String(appearanceQuery.data.userId) !== userId)
      return;

    const preference = readAppearancePreference(appearanceQuery.data);
    writeAppearancePreferenceMirror(userId, preference);
    applyAppearancePreference(preference);
  }, [appearanceQuery.data, token, userId]);

  return children;
}

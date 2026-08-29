import type { RecordEditorSeed } from './types';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createRecordEditorSettingsNavigationState } from './types';

export function useRecordEditorSettingsNavigation(
  getDraftSnapshot: () => RecordEditorSeed,
) {
  const location = useLocation();
  const navigate = useNavigate();

  return useCallback((path: string) => {
    navigate(path, {
      replace: true,
      state: createRecordEditorSettingsNavigationState(
        getDraftSnapshot(),
        { pathname: location.pathname, search: location.search, state: location.state },
      ),
    });
  }, [getDraftSnapshot, location.pathname, location.search, location.state, navigate]);
}

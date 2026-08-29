import type { RecordEditorSeed } from './types';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createRecordEditorSettingsNavigationState } from './types';

interface OpenRecordEditorSettingsOptions {
  reopenTagPicker?: boolean;
}

export function useRecordEditorSettingsNavigation(
  getDraftSnapshot: () => RecordEditorSeed,
) {
  const location = useLocation();
  const navigate = useNavigate();

  return useCallback((path: string, options?: OpenRecordEditorSettingsOptions) => {
    const draft = getDraftSnapshot();
    navigate(path, {
      replace: true,
      state: createRecordEditorSettingsNavigationState(
        options?.reopenTagPicker === undefined
          ? draft
          : { ...draft, isTagPickerVisible: options.reopenTagPicker },
        { pathname: location.pathname, search: location.search, state: location.state },
      ),
    });
  }, [getDraftSnapshot, location.pathname, location.search, location.state, navigate]);
}

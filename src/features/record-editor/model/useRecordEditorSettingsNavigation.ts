import type { RecordEditorSeed } from './types';
import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createRecordEditorSettingsNavigationState } from './types';

interface OpenRecordEditorSettingsOptions {
  reopenTagPicker?: boolean;
  tagPickerDraftIds?: string[];
}

export function useRecordEditorSettingsNavigation(
  getDraftSnapshot: () => RecordEditorSeed,
  waitForImageUploads: () => Promise<void>,
) {
  const location = useLocation();
  const navigate = useNavigate();
  const snapshotRef = useRef(getDraftSnapshot);
  const isOpeningRef = useRef(false);
  snapshotRef.current = getDraftSnapshot;

  return useCallback(async (path: string, options?: OpenRecordEditorSettingsOptions) => {
    if (isOpeningRef.current)
      return;
    isOpeningRef.current = true;
    try {
      await waitForImageUploads();
      const draft = {
        ...snapshotRef.current(),
        ...(options?.tagPickerDraftIds ? { tagPickerDraftIds: options.tagPickerDraftIds } : {}),
      };
      navigate(path, {
        replace: true,
        state: createRecordEditorSettingsNavigationState(
          options?.reopenTagPicker === undefined
            ? draft
            : { ...draft, isTagPickerVisible: options.reopenTagPicker },
          { pathname: location.pathname, search: location.search, state: location.state },
        ),
      });
    }
    finally {
      isOpeningRef.current = false;
    }
  }, [location.pathname, location.search, location.state, navigate, waitForImageUploads]);
}

import type { WorkspaceScope } from './workspace-scope';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getWorkspaceHomePath, getWorkspaceScope } from './workspace-scope';

interface WorkspaceHistoryState {
  historyIndex?: number;
  locationKey: string;
}

export function shouldUseWorkspaceHistoryBack({
  historyIndex,
  locationKey,
}: WorkspaceHistoryState) {
  return (historyIndex ?? 0) > 0 || locationKey !== 'default';
}

export function useWorkspaceBack(scope: WorkspaceScope) {
  const location = useLocation();
  const navigate = useNavigate();

  return useCallback(() => {
    const historyIndex = typeof window.history.state?.idx === 'number'
      ? window.history.state.idx
      : undefined;
    if (shouldUseWorkspaceHistoryBack({
      historyIndex,
      locationKey: location.key,
    })) {
      navigate(-1);
      return;
    }
    navigate(getWorkspaceHomePath(scope), { replace: true });
  }, [location.key, navigate, scope]);
}

export function useCurrentWorkspaceBack() {
  const location = useLocation();
  return useWorkspaceBack(getWorkspaceScope(location.pathname));
}

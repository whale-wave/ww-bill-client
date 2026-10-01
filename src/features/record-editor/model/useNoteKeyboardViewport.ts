import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

// Android can dismiss the IME without blurring the HTML input.
export function useNoteKeyboardViewport({ inputRef, pageRef, isNoteFocused, setIsNoteFocused }: {
  inputRef: RefObject<HTMLInputElement>;
  pageRef: RefObject<HTMLDivElement>;
  isNoteFocused: boolean;
  setIsNoteFocused: (focused: boolean) => void;
}) {
  const baselineHeightRef = useRef(getViewportHeight());
  const hideTimerRef = useRef<number>();
  const clearHideTimer = useCallback(() => {
    window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = undefined;
  }, []);
  const handleExitNote = useCallback(() => {
    clearHideTimer();
    inputRef.current?.blur();
    setIsNoteFocused(false);
    pageRef.current?.style.removeProperty('height');
    pageRef.current?.style.removeProperty('top');
  }, [clearHideTimer, inputRef, pageRef, setIsNoteFocused]);
  const handleFocusNote = useCallback(() => {
    clearHideTimer();
    baselineHeightRef.current = Math.max(baselineHeightRef.current, getViewportHeight());
    setIsNoteFocused(true);
  }, [clearHideTimer, setIsNoteFocused]);

  useEffect(() => {
    const viewport = window.visualViewport;
    const page = pageRef.current;
    let hasKeyboardOpened = false;
    let restoredHeight: number | undefined;
    const updateViewport = () => {
      const height = getViewportHeight();
      if (!isNoteFocused) {
        baselineHeightRef.current = height;
        return;
      }
      if (page) {
        page.style.height = `${height}px`;
        page.style.top = `${viewport?.offsetTop ?? 0}px`;
      }
      const reduction = baselineHeightRef.current - height;
      if (reduction > 120)
        hasKeyboardOpened = true;
      if (!hasKeyboardOpened || Math.abs(reduction) > 48) {
        clearHideTimer();
        restoredHeight = undefined;
        return;
      }
      // Duplicate window/visualViewport events must not postpone recovery.
      if (hideTimerRef.current !== undefined && restoredHeight === height)
        return;
      clearHideTimer();
      restoredHeight = height;
      hideTimerRef.current = window.setTimeout(() => {
        hideTimerRef.current = undefined;
        if (getViewportHeight() === restoredHeight)
          handleExitNote();
        else
          updateViewport();
      }, 150);
    };
    const handleOrientationChange = () => {
      // The old height is no longer comparable. Leave note mode and let the
      // resized idle viewport establish a fresh baseline for the next focus.
      if (isNoteFocused)
        handleExitNote();
      baselineHeightRef.current = getViewportHeight();
    };
    if (!isNoteFocused) {
      page?.style.removeProperty('height');
      page?.style.removeProperty('top');
    }
    updateViewport();
    viewport?.addEventListener('resize', updateViewport);
    viewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = undefined;
      viewport?.removeEventListener('resize', updateViewport);
      viewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', handleOrientationChange);
      page?.style.removeProperty('height');
      page?.style.removeProperty('top');
    };
  }, [clearHideTimer, handleExitNote, isNoteFocused, pageRef]);

  return { handleExitNote, handleFocusNote };
}

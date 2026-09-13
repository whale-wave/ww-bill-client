import copyToClipboard from 'copy-to-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { showAppError } from '@/shared/ui/app-feedback';

const COPIED_STATE_DURATION_MS = 1500;

export interface CopyRequest {
  key: string;
  text: string;
  failureMessage: string;
}

export interface CopyActionResult {
  copiedKey: string | null;
  copyText: (request: CopyRequest) => Promise<boolean>;
}

export function useCopyAction(): CopyActionResult {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    if (timerRef.current !== undefined)
      window.clearTimeout(timerRef.current);
  }, []);

  const copyText = useCallback(async ({ key, text, failureMessage }: CopyRequest) => {
    let error: unknown;
    let copied = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
      catch (caught) {
        error = caught;
      }
    }

    if (!copied) {
      try {
        copied = copyToClipboard(text);
      }
      catch (caught) {
        error = caught;
      }
    }

    if (!copied) {
      showAppError(error, { message: failureMessage });
      return false;
    }

    if (timerRef.current !== undefined)
      window.clearTimeout(timerRef.current);
    setCopiedKey(key);
    timerRef.current = window.setTimeout(() => {
      setCopiedKey(current => current === key ? null : current);
      timerRef.current = undefined;
    }, COPIED_STATE_DURATION_MS);
    return true;
  }, []);

  return { copiedKey, copyText };
}

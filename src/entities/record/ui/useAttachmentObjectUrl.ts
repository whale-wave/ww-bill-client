import { useLayoutEffect, useState } from 'react';

/** Media stays authenticated and ephemeral; object URLs are revoked on change. */
export function useAttachmentObjectUrl(blob?: Blob) {
  const [url, setUrl] = useState<string>();

  useLayoutEffect(() => {
    if (!blob) {
      queueMicrotask(() => setUrl(undefined));
      return;
    }
    const nextUrl = URL.createObjectURL(blob);
    let active = true;
    queueMicrotask(() => {
      if (active)
        setUrl(nextUrl);
    });
    return () => {
      active = false;
      URL.revokeObjectURL(nextUrl);
    };
  }, [blob]);

  return url;
}

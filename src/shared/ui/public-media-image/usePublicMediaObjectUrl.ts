import { useEffect, useState } from 'react';
import { request } from '@/shared/api';

interface PublicMediaObjectUrlState {
  error: boolean;
  loading: boolean;
  url?: string;
}

const PUBLIC_MEDIA_URL_PATTERN = /\/api\/media\/public\//i;

/** Load public media through the API client so native WebViews do not render LAN image URLs directly. */
export function usePublicMediaObjectUrl(source?: string | null): PublicMediaObjectUrlState {
  const isPublicMediaUrl = Boolean(source && PUBLIC_MEDIA_URL_PATTERN.test(source));
  const [state, setState] = useState<PublicMediaObjectUrlState>({
    error: false,
    loading: isPublicMediaUrl,
    url: isPublicMediaUrl ? undefined : (source ?? undefined),
  });

  useEffect(() => {
    if (!source || !PUBLIC_MEDIA_URL_PATTERN.test(source)) {
      setState({ error: false, loading: false, url: source ?? undefined });
      return;
    }

    let active = true;
    let objectUrl: string | undefined;
    setState({ error: false, loading: true });

    request.get<Blob, Blob>(source, { responseType: 'blob', silent: true })
      .then((blob) => {
        if (!active)
          return;
        objectUrl = URL.createObjectURL(blob);
        setState({ error: false, loading: false, url: objectUrl });
      })
      .catch(() => {
        if (active)
          setState({ error: true, loading: false });
      });

    return () => {
      active = false;
      if (objectUrl)
        URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  return state;
}

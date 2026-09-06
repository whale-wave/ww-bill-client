import { captureRequestAuth, handleAuthFailure } from './auth-injection';

function apiBaseUrl() {
  const host = typeof import.meta.env.VITE_HOST === 'string' ? import.meta.env.VITE_HOST : '';
  return `${host}/api`;
}

/** Browser Axios adapters buffer responses, so authenticated SSE uses Fetch while sharing auth failure handling. */
export async function fetchAuthenticatedEventStream(
  path: string,
  init: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> },
) {
  const auth = captureRequestAuth();
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    if ([401, 402, 403].includes(response.status))
      handleAuthFailure(auth.identity, response.status);
    throw Object.assign(new Error('流式请求失败'), {
      data: null,
      statusCode: response.status,
    });
  }
  if (!response.body) {
    throw Object.assign(new Error('当前环境不支持流式回复'), {
      data: null,
      statusCode: 0,
    });
  }
  return response.body;
}

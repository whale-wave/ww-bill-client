import type { SuccessResponse } from './types';
import request from './http';

export async function uploadFile(body: FormData, loading = true) {
  return request.post<unknown, SuccessResponse<{ url: string }>>(
    '/upload',
    body,
    {
      headers: {
        contentType: 'multipart/form-data',
      },
      loading,
    },
  );
}

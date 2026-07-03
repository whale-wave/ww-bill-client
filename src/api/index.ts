import { request } from '@/shared/api';

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

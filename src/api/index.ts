import { request } from '@/utils';

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

export * from './auth';
export * from './topic';
export * from './user';
export * from './record';
export * from './category';
export * from './tools';
export * from './system';
export * from './follow';
export * from './user-email';
export * from './user-app-config';
export * from './invoice';

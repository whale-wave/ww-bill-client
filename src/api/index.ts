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

export * from './auth';
export * from './budget';
export * from './category';
export * from './chart';
export * from './follow';
export * from './system';
export * from './tools';
export * from './topic';
export * from './user';
export * from './user-app-config';
export * from './user-email';

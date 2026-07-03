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

export * from './asset';
export * from './auth';
export * from './budget';
export * from './category';
export * from './chart';
export * from './fixed-expense';
export * from './follow';
export * from './invoice';
export * from './record';
export * from './system';
export * from './tools';
export * from './topic';
export * from './user';
export * from './user-app-config';
export * from './user-email';

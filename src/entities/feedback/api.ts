import type { CreateFeedbackInput, CreateFeedbackResult } from './types';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export function postFeedbackApi(data: CreateFeedbackInput) {
  return request.post<unknown, SuccessResponse<CreateFeedbackResult>>('/feedback', data);
}

import { useMutation } from '@tanstack/react-query';
import { assertSuccessApi } from '@/shared/api';
import { postFeedbackApi } from './api';

export function usePostFeedbackMutation() {
  return useMutation({
    mutationFn: async (data: Parameters<typeof postFeedbackApi>[0]) => {
      const response = await postFeedbackApi(data);
      return assertSuccessApi(response).data;
    },
  });
}

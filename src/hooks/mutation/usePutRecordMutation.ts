import { useMutation } from '@tanstack/react-query';
import { putRecordApi } from '@/api';
import { queryClient } from '@/main';
import { useGetRecordQueryQueryKey } from '@/hooks/query/useGetRecordQuery';

export function usePutRecordMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (params: {
      id: string;
      data: Parameters<typeof putRecordApi>[1];
    }) => putRecordApi(params.id, params.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [useGetRecordQueryQueryKey],
      });
    },
  });

  return [
    mutateAsync,
    {
      ...rest,
    },
  ] as const;
}

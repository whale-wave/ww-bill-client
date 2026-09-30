import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chartKeys } from '../../entities/chart'
import { createRecord, recordKeys } from '../../entities/record'
import { userKeys } from '../../entities/user'

export function useCreateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRecord,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: recordKeys.all }),
        queryClient.invalidateQueries({ queryKey: chartKeys.all }),
        queryClient.invalidateQueries({ queryKey: userKeys.info }),
      ])
    },
  })
}

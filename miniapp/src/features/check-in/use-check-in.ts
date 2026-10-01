import { useMutation, useQueryClient } from '@tanstack/react-query'
import { achievementKeys } from '../../entities/achievement'
import { postCheckIn, userKeys } from '../../entities/user'

export function useCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postCheckIn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.info }),
        queryClient.invalidateQueries({ queryKey: achievementKeys.summary }),
      ])
    },
  })
}


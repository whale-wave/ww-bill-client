import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { ChartDashboard } from './api'
import { getChartDashboard } from './api'

export const chartKeys = {
  all: ['chart'] as const,
  month: (month: string) => ['chart', 'month', month] as const,
}

export function useMonthChart(options: {
  params: { month: string }
  queryOptions?: Omit<UseQueryOptions<ChartDashboard, Error>, 'queryKey' | 'queryFn'>
}) {
  return useQuery<ChartDashboard, Error>({
    queryKey: chartKeys.month(options.params.month),
    queryFn: ({ signal }) => getChartDashboard(`${options.params.month}-01`, signal),
    ...options.queryOptions,
  })
}

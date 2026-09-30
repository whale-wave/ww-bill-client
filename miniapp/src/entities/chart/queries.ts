import { useQuery } from '@tanstack/react-query'
import { getChartDashboard } from './api'

export const chartKeys = {
  all: ['chart'] as const,
  month: (month: string) => ['chart', 'month', month] as const,
}

export function useMonthChart(month: string, isEnabled: boolean) {
  return useQuery({
    queryKey: chartKeys.month(month),
    queryFn: ({ signal }) => getChartDashboard(`${month}-01`, signal),
    enabled: isEnabled,
  })
}

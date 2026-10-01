import { api } from '../../shared/api'

interface DashboardCategory {
  id?: number | null
  key?: string
  name: string
  amount: string
  percent?: number
  icon?: string | null
  iconType?: 'BUILTIN' | 'IMAGE' | null
  textIconEnabled?: boolean
  textIconIndex?: number
}

export interface ChartDashboard {
  period: 'month'
  startDate: string
  endDate: string
  summary: {
    income: string
    expense: string
    net: string
    averageDailyExpense: string
    dayCount: number
  }
  timeline: Array<{ key: string; label?: string; income: string; expense: string; net: string }>
  categories: DashboardCategory[]
  incomeCategories?: DashboardCategory[]
}

export function getChartDashboard(anchorDate: string, signal?: AbortSignal) {
  return api.get<ChartDashboard>('/chart/dashboard', {
    query: { period: 'month', anchorDate },
    signal,
  })
}

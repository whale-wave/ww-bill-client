import type { ChartDashboardScope } from './useChartDashboardUrlState';
import type { ChartDashboardParams, ChartDashboardResult, PersonalAssetDashboardResult } from '@/entities/chart';
import { useQuery } from '@tanstack/react-query';
import { getChartDashboardApi, getHouseholdChartDashboardApi, getLedgerChartDashboardApi, getPersonalAssetDashboardApi } from '@/entities/chart';
import { assertSuccessApi } from '@/shared/api';

export function useChartDashboardQueries(scope: ChartDashboardScope, queryParams: ChartDashboardParams, assetParams: ChartDashboardParams) {
  const dashboardQuery = useQuery({
    queryKey: ['chart-dashboard', scope, queryParams],
    queryFn: async () => {
      const response = scope.kind === 'personal'
        ? await getChartDashboardApi(queryParams)
        : scope.kind === 'ledger'
          ? await getLedgerChartDashboardApi(scope.ledgerId, queryParams)
          : await getHouseholdChartDashboardApi(scope.householdId, queryParams);
      return assertSuccessApi(response).data as ChartDashboardResult;
    },
    staleTime: 30_000,
  });
  const assetQuery = useQuery({
    queryKey: ['personal-asset-chart-dashboard', assetParams],
    queryFn: async () => assertSuccessApi(await getPersonalAssetDashboardApi(assetParams)).data as PersonalAssetDashboardResult,
    enabled: scope.kind === 'personal',
    staleTime: 30_000,
  });

  return { assetQuery, dashboardQuery };
}

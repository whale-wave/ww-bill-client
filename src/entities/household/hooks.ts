import type {
  QueryClient,
  UseInfiniteQueryOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import type {
  GetHouseholdBudgetsApiParams,
  GetHouseholdCalendarApiParams,
  GetHouseholdChartPeriodsApiParams,
  GetHouseholdChartsApiParams,
  GetHouseholdRecordsApiParams,
  HouseholdRecordFilterOptions,
  PatchHouseholdApiData,
  PatchMyHouseholdNicknameApiData,
  PostAcceptHouseholdInvitationApiData,
  PostDissolveHouseholdApiData,
  PostHouseholdApiData,
  PostHouseholdExportApiData,
  PostHouseholdInvitationApiData,
  PutFamilyRecordPolicyApiData,
  PutHouseholdBudgetApiData,
} from './api';
import type {
  FamilyRecord,
  FamilyRecordPolicyResult,
  Household,
  HouseholdBudgetOverview,
  HouseholdCalendarResult,
  HouseholdChartPeriodOption,
  HouseholdChartResult,
  HouseholdExportTask,
  HouseholdInvitation,
  HouseholdInvitationPreview,
  HouseholdMember,
  HouseholdRecordsPage,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { assertSuccessApi } from '@/shared/api';
import { captureSessionScope, isSessionScopeCurrent } from '@/shared/api/auth-injection';
import {
  deleteHouseholdBudgetApi,
  deleteHouseholdInvitationApi,
  downloadHouseholdExportApi,
  getFamilyRecordPolicyApi,
  getHouseholdBudgetsApi,
  getHouseholdCalendarApi,
  getHouseholdChartPeriodsApi,
  getHouseholdChartsApi,
  getHouseholdExportTaskApi,
  getHouseholdInvitationPreviewApi,
  getHouseholdMembersApi,
  getHouseholdRecordApi,
  getHouseholdRecordFilterOptionsApi,
  getHouseholdRecordsApi,
  getMyHouseholdApi,
  patchHouseholdApi,
  patchMyHouseholdNicknameApi,
  postAcceptHouseholdInvitationApi,
  postDissolveHouseholdApi,
  postHouseholdApi,
  postHouseholdExportApi,
  postHouseholdInvitationApi,
  putFamilyRecordPolicyApi,
  putHouseholdBudgetApi,
} from './api';
import { removeHouseholdInvitation, writeHouseholdInvitation } from './invitation-storage';
import { householdKeys } from './keys';

export async function getMyHouseholdQueryFn() {
  return assertSuccessApi(await getMyHouseholdApi());
}

export async function getHouseholdMembersQueryFn(householdId: string) {
  return assertSuccessApi(await getHouseholdMembersApi(householdId));
}

export async function getHouseholdRecordsQueryFn(
  householdId: string,
  params?: GetHouseholdRecordsApiParams,
) {
  return assertSuccessApi(await getHouseholdRecordsApi(householdId, params));
}

export async function getHouseholdRecordQueryFn(
  householdId: string,
  recordId: number,
) {
  return assertSuccessApi(await getHouseholdRecordApi(householdId, recordId));
}

export async function getFamilyRecordPolicyQueryFn(
  householdId: string,
  recordId: number,
) {
  return assertSuccessApi(await getFamilyRecordPolicyApi(householdId, recordId));
}

export async function getHouseholdInvitationPreviewQueryFn(code: string) {
  return assertSuccessApi(await getHouseholdInvitationPreviewApi(code));
}

export async function getHouseholdBudgetsQueryFn(
  householdId: string,
  params: GetHouseholdBudgetsApiParams,
) {
  return assertSuccessApi(await getHouseholdBudgetsApi(householdId, params));
}

export async function getHouseholdChartsQueryFn(
  householdId: string,
  params: GetHouseholdChartsApiParams,
) {
  return assertSuccessApi(await getHouseholdChartsApi(householdId, params));
}

export async function getHouseholdChartPeriodsQueryFn(
  householdId: string,
  params: GetHouseholdChartPeriodsApiParams,
) {
  return assertSuccessApi(await getHouseholdChartPeriodsApi(householdId, params));
}

export async function getHouseholdCalendarQueryFn(
  householdId: string,
  params: GetHouseholdCalendarApiParams,
) {
  return assertSuccessApi(await getHouseholdCalendarApi(householdId, params));
}

export async function getHouseholdExportTaskQueryFn(
  householdId: string,
  taskId: string,
) {
  return assertSuccessApi(await getHouseholdExportTaskApi(householdId, taskId));
}

export async function createHouseholdMutationFn(data: PostHouseholdApiData) {
  return assertSuccessApi(await postHouseholdApi(data));
}

export async function createHouseholdExportMutationFn(options: {
  householdId: string;
  data: PostHouseholdExportApiData;
}) {
  return assertSuccessApi(
    await postHouseholdExportApi(options.householdId, options.data),
  );
}

export async function createHouseholdInvitationMutationFn(options: {
  householdId: string;
  data: PostHouseholdInvitationApiData;
}) {
  return assertSuccessApi(
    await postHouseholdInvitationApi(options.householdId, options.data),
  );
}

export async function revokeHouseholdInvitationMutationFn(options: {
  householdId: string;
  invitationId: string;
}) {
  return assertSuccessApi(
    await deleteHouseholdInvitationApi(options.householdId, options.invitationId),
  );
}

export async function acceptHouseholdInvitationMutationFn(options: {
  code: string;
  data: PostAcceptHouseholdInvitationApiData;
}) {
  return assertSuccessApi(
    await postAcceptHouseholdInvitationApi(options.code, options.data),
  );
}

export async function updateHouseholdMutationFn(options: {
  householdId: string;
  data: PatchHouseholdApiData;
}) {
  return assertSuccessApi(await patchHouseholdApi(options.householdId, options.data));
}

export async function updateMyHouseholdNicknameMutationFn(options: {
  householdId: string;
  data: PatchMyHouseholdNicknameApiData;
}) {
  return assertSuccessApi(
    await patchMyHouseholdNicknameApi(options.householdId, options.data),
  );
}

export async function dissolveHouseholdMutationFn(options: {
  householdId: string;
  data: PostDissolveHouseholdApiData;
}) {
  return assertSuccessApi(
    await postDissolveHouseholdApi(options.householdId, options.data),
  );
}

export async function setFamilyRecordPolicyMutationFn(options: {
  householdId: string;
  recordId: number;
  data: PutFamilyRecordPolicyApiData;
}) {
  return assertSuccessApi(
    await putFamilyRecordPolicyApi(options.householdId, options.recordId, options.data),
  );
}

export async function upsertHouseholdBudgetMutationFn(options: {
  householdId: string;
  data: PutHouseholdBudgetApiData;
}) {
  return assertSuccessApi(
    await putHouseholdBudgetApi(options.householdId, options.data),
  );
}

export async function deleteHouseholdBudgetMutationFn(options: {
  householdId: string;
  budgetId: string;
  version: number;
}) {
  return assertSuccessApi(
    await deleteHouseholdBudgetApi(
      options.householdId,
      options.budgetId,
      options.version,
    ),
  );
}

async function cacheHousehold(
  queryClient: QueryClient,
  response: SuccessResponse<Household>,
) {
  queryClient.setQueryData(householdKeys.mine(), response);
  queryClient.setQueryData(householdKeys.detail(response.data.id), response);
}

export function useMyHouseholdQuery(options: {
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<Household | null>,
      unknown,
      SuccessResponse<Household | null>,
      ReturnType<typeof householdKeys.mine>
    >,
    'queryFn' | 'queryKey'
  >;
} = {}) {
  const { data: response, ...rest } = useQuery({
    queryFn: getMyHouseholdQueryFn,
    queryKey: householdKeys.mine(),
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

export function useHouseholdMembersQuery(options: {
  params: { householdId: string };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<HouseholdMember[]>,
      unknown,
      SuccessResponse<HouseholdMember[]>,
      ReturnType<typeof householdKeys.members>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getHouseholdMembersQueryFn(options.params.householdId),
    queryKey: householdKeys.members(options.params.householdId),
    ...options.queryOptions,
  });
  return { response, data: response?.data ?? [], ...rest };
}

export function useHouseholdRecordsQuery(options: {
  params: { householdId: string; filters?: GetHouseholdRecordsApiParams };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<HouseholdRecordsPage>,
      unknown,
      SuccessResponse<HouseholdRecordsPage>,
      ReturnType<typeof householdKeys.records>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { householdId, filters } = options.params;
  const { data: response, ...rest } = useQuery({
    queryFn: () => getHouseholdRecordsQueryFn(householdId, filters),
    queryKey: householdKeys.records(householdId, filters),
    ...options.queryOptions,
  });
  return { response, data: response?.data, records: response?.data.data ?? [], ...rest };
}

export function useHouseholdRecordFilterOptionsQuery(options: {
  params: { householdId: string };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<HouseholdRecordFilterOptions>,
      unknown,
      SuccessResponse<HouseholdRecordFilterOptions>,
      ReturnType<typeof householdKeys.recordFilterOptions>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { householdId } = options.params;
  const { data: response, ...rest } = useQuery({
    queryFn: async () => assertSuccessApi(
      await getHouseholdRecordFilterOptionsApi(householdId),
    ),
    queryKey: householdKeys.recordFilterOptions(householdId),
    ...options.queryOptions,
  });
  return {
    response,
    data: response?.data ?? {
      capabilities: { category: false, member: false, tag: false },
      categories: [],
      members: [],
      tags: [],
    },
    ...rest,
  };
}

type HouseholdRecordsResponse = SuccessResponse<HouseholdRecordsPage>;

export function getNextHouseholdRecordsOffset(
  page: Pick<HouseholdRecordsPage, 'data' | 'offset' | 'total'>,
) {
  const nextOffset = page.offset + page.data.length;
  return nextOffset < page.total ? nextOffset : undefined;
}

export function flattenHouseholdRecordPages(
  pages: HouseholdRecordsResponse[] = [],
) {
  const records = new Map<number, FamilyRecord>();
  pages.forEach(page => page.data.data.forEach(record => records.set(record.id, record)));
  return [...records.values()];
}

export function useInfiniteHouseholdRecordsQuery(options: {
  params: { householdId: string; filters?: GetHouseholdRecordsApiParams };
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      HouseholdRecordsResponse,
      unknown,
      HouseholdRecordsResponse,
      HouseholdRecordsResponse,
      ReturnType<typeof householdKeys.recordPages>
    >,
    'getNextPageParam' | 'queryFn' | 'queryKey'
  >;
}) {
  const { householdId, filters = {} } = options.params;
  const { offset: initialOffset = 0, ...baseFilters } = filters;
  const query = useInfiniteQuery({
    queryKey: householdKeys.recordPages(householdId, baseFilters),
    queryFn: ({ pageParam = initialOffset }) => getHouseholdRecordsQueryFn(
      householdId,
      { ...baseFilters, offset: pageParam as number },
    ),
    getNextPageParam: lastPage => getNextHouseholdRecordsOffset(lastPage.data),
    keepPreviousData: true,
    ...options.queryOptions,
  });
  const firstPage = query.data?.pages[0]?.data;
  const records = flattenHouseholdRecordPages(query.data?.pages);
  return {
    ...query,
    data: firstPage
      ? { ...firstPage, data: records }
      : undefined,
    records,
  };
}

export function useHouseholdRecordQuery(options: {
  params: { householdId: string; recordId: number };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<FamilyRecord>,
      unknown,
      SuccessResponse<FamilyRecord>,
      ReturnType<typeof householdKeys.record>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { householdId, recordId } = options.params;
  const { data: response, ...rest } = useQuery({
    queryFn: () => getHouseholdRecordQueryFn(householdId, recordId),
    queryKey: householdKeys.record(householdId, recordId),
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

export function useFamilyRecordPolicyQuery(options: {
  params: { householdId: string; recordId: number };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<FamilyRecordPolicyResult>,
      unknown,
      SuccessResponse<FamilyRecordPolicyResult>,
      ReturnType<typeof householdKeys.recordPolicy>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { householdId, recordId } = options.params;
  const { data: response, ...rest } = useQuery({
    queryFn: () => getFamilyRecordPolicyQueryFn(householdId, recordId),
    queryKey: householdKeys.recordPolicy(householdId, recordId),
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

export function useHouseholdInvitationPreviewQuery(options: {
  params: { code: string };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<HouseholdInvitationPreview>,
      unknown,
      SuccessResponse<HouseholdInvitationPreview>,
      ReturnType<typeof householdKeys.invitationPreview>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getHouseholdInvitationPreviewQueryFn(options.params.code),
    queryKey: householdKeys.invitationPreview(options.params.code),
    meta: { persist: false },
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

export function useHouseholdBudgetsQuery(options: {
  params: { householdId: string; filters: GetHouseholdBudgetsApiParams };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<HouseholdBudgetOverview>,
      unknown,
      SuccessResponse<HouseholdBudgetOverview>,
      ReturnType<typeof householdKeys.budgets>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { householdId, filters } = options.params;
  const { data: response, ...rest } = useQuery({
    queryFn: () => getHouseholdBudgetsQueryFn(householdId, filters),
    queryKey: householdKeys.budgets(householdId, filters),
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

export function useHouseholdChartsQuery(options: {
  params: { householdId: string; filters: GetHouseholdChartsApiParams };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<HouseholdChartResult>,
      unknown,
      SuccessResponse<HouseholdChartResult>,
      ReturnType<typeof householdKeys.charts>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { householdId, filters } = options.params;
  const { data: response, ...rest } = useQuery({
    queryFn: () => getHouseholdChartsQueryFn(householdId, filters),
    queryKey: householdKeys.charts(householdId, filters),
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

export function useHouseholdChartPeriodsQuery(options: {
  params: { householdId: string; filters: GetHouseholdChartPeriodsApiParams };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<HouseholdChartPeriodOption[]>,
      unknown,
      SuccessResponse<HouseholdChartPeriodOption[]>,
      ReturnType<typeof householdKeys.chartPeriods>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { householdId, filters } = options.params;
  const { data: response, ...rest } = useQuery({
    queryFn: () => getHouseholdChartPeriodsQueryFn(householdId, filters),
    queryKey: householdKeys.chartPeriods(householdId, filters),
    ...options.queryOptions,
  });
  return { response, data: response?.data ?? [], ...rest };
}

export function useHouseholdCalendarQuery(options: {
  params: { householdId: string; month: string };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<HouseholdCalendarResult>,
      unknown,
      SuccessResponse<HouseholdCalendarResult>,
      ReturnType<typeof householdKeys.calendar>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { householdId, month } = options.params;
  const { data: response, ...rest } = useQuery({
    queryFn: () => getHouseholdCalendarQueryFn(householdId, { month }),
    queryKey: householdKeys.calendar(householdId, month),
    keepPreviousData: true,
    ...options.queryOptions,
  });
  return { response, data: response?.data, days: response?.data.days ?? [], ...rest };
}

export function useHouseholdExportTaskQuery(options: {
  params: { householdId: string; taskId: string };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<HouseholdExportTask>,
      unknown,
      SuccessResponse<HouseholdExportTask>,
      ReturnType<typeof householdKeys.exportTask>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { householdId, taskId } = options.params;
  const { data: response, ...rest } = useQuery({
    queryFn: () => getHouseholdExportTaskQueryFn(householdId, taskId),
    queryKey: householdKeys.exportTask(householdId, taskId),
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

export function useCreateHouseholdMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: createHouseholdMutationFn,
    onMutate: () => captureSessionScope(),
    onSuccess: async (response, _variables, scope) => {
      await cacheHousehold(queryClient, {
        ...response,
        data: response.data.household,
      });
      queryClient.setQueryData(
        householdKeys.invitation(response.data.household.id),
        response.data.invitation,
      );
      if (scope && isSessionScopeCurrent(scope))
        writeHouseholdInvitation(response.data.household.id, response.data.invitation);
    },
  });
  return [mutateAsync, rest] as const;
}

export function useCreateHouseholdExportMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: createHouseholdExportMutationFn,
    onSuccess: (response, variables) => {
      queryClient.setQueryData(
        householdKeys.exportTask(variables.householdId, response.data.id),
        response,
      );
    },
  });
  return [mutateAsync, rest] as const;
}

export function useDownloadHouseholdExportMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (options: { householdId: string; taskId: string }) =>
      downloadHouseholdExportApi(options.householdId, options.taskId),
  });
  return [mutateAsync, rest] as const;
}

export function useCreateHouseholdInvitationMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: createHouseholdInvitationMutationFn,
    onMutate: () => captureSessionScope(),
    onSuccess: (response, variables, scope) => {
      queryClient.setQueryData(
        householdKeys.invitation(variables.householdId),
        response.data,
      );
      if (scope && isSessionScopeCurrent(scope))
        writeHouseholdInvitation(variables.householdId, response.data);
    },
  });
  return [mutateAsync, rest] as const;
}

export function useRevokeHouseholdInvitationMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: revokeHouseholdInvitationMutationFn,
    onMutate: () => captureSessionScope(),
    onSuccess: (_response, variables, scope) => {
      queryClient.removeQueries({
        exact: true,
        queryKey: householdKeys.invitation(variables.householdId),
      });
      if (scope && isSessionScopeCurrent(scope))
        removeHouseholdInvitation(variables.householdId);
    },
  });
  return [mutateAsync, rest] as const;
}

export function useCachedHouseholdInvitation(householdId: string) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<HouseholdInvitation>(
    householdKeys.invitation(householdId),
  );
}

export function useAcceptHouseholdInvitationMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: acceptHouseholdInvitationMutationFn,
    onSuccess: async response => cacheHousehold(queryClient, response),
  });
  return [mutateAsync, rest] as const;
}

export function useUpdateHouseholdMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: updateHouseholdMutationFn,
    onSuccess: async response => cacheHousehold(queryClient, response),
  });
  return [mutateAsync, rest] as const;
}

export function useUpdateMyHouseholdNicknameMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: updateMyHouseholdNicknameMutationFn,
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: householdKeys.mine() }),
        queryClient.invalidateQueries({
          queryKey: householdKeys.members(variables.householdId),
        }),
      ]);
    },
  });
  return [mutateAsync, rest] as const;
}

export function useDissolveHouseholdMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: dissolveHouseholdMutationFn,
    onSuccess: async (_response, variables) => {
      queryClient.setQueryData(householdKeys.mine(), previous => (
        previous ? { ...previous, data: null } : previous
      ));
      queryClient.removeQueries({
        queryKey: householdKeys.all,
        predicate: query => query.queryKey[1] !== 'mine',
      });
      removeHouseholdInvitation(variables.householdId);
    },
  });
  return [mutateAsync, rest] as const;
}

export function useSetFamilyRecordPolicyMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: setFamilyRecordPolicyMutationFn,
    onSuccess: async (response, variables) => {
      queryClient.setQueryData(
        householdKeys.recordPolicy(variables.householdId, variables.recordId),
        response,
      );
      await queryClient.invalidateQueries({
        queryKey: householdKeys.recordsRoot(variables.householdId),
      });
    },
  });
  return [mutateAsync, rest] as const;
}

export function useUpsertHouseholdBudgetMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: upsertHouseholdBudgetMutationFn,
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: householdKeys.budgetsRoot(variables.householdId),
      });
    },
  });
  return [mutateAsync, rest] as const;
}

export function useDeleteHouseholdBudgetMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteHouseholdBudgetMutationFn,
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: householdKeys.budgetsRoot(variables.householdId),
      });
    },
  });
  return [mutateAsync, rest] as const;
}

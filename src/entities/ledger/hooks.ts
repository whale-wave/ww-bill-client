import type { QueryClient, UseQueryOptions } from '@tanstack/react-query';
import type {
  GetLedgerMembersApiParams,
  GetLedgersApiParams,
  PatchLedgerApiData,
  PatchLedgerJoinRequestApiData,
  PatchLedgerMemberApiData,
  PatchLedgerPreferencesApiData,
  PostArchiveLedgerApiData,
  PostLeaveLedgerApiData,
  PostLedgerApiData,
  PostLedgerInvitationApiData,
  PostLedgerJoinRequestApiData,
  PostLedgerOwnershipTransferApiData,
} from './api';
import type {
  Ledger,
  LedgerInvitationPreview,
  LedgerJoinRequest,
  LedgerMember,
  LedgerPreference,
  LedgerTemplate,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assertSuccessApi } from '@/shared/api';
import {
  deleteLedgerInvitationApi,
  deleteLedgerMemberApi,
  getLedgerApi,
  getLedgerInvitationPreviewApi,
  getLedgerJoinRequestsApi,
  getLedgerMembersApi,
  getLedgerPreferencesApi,
  getLedgersApi,
  getLedgerTemplatesApi,
  getMyLedgerJoinRequestsApi,
  patchLedgerApi,
  patchLedgerJoinRequestApi,
  patchLedgerMemberApi,
  patchLedgerPreferencesApi,
  postArchiveLedgerApi,
  postLeaveLedgerApi,
  postLedgerApi,
  postLedgerInvitationApi,
  postLedgerJoinRequestApi,
  postLedgerOwnershipTransferApi,
} from './api';
import { ledgerKeys } from './keys';

export async function getLedgersQueryFn(params?: GetLedgersApiParams) {
  return assertSuccessApi(await getLedgersApi(params));
}

export async function getLedgerTemplatesQueryFn() {
  return assertSuccessApi(await getLedgerTemplatesApi());
}

export async function getLedgerQueryFn(ledgerId: string) {
  return assertSuccessApi(await getLedgerApi(ledgerId));
}

export async function getLedgerPreferencesQueryFn(ledgerId: string) {
  return assertSuccessApi(await getLedgerPreferencesApi(ledgerId));
}

export async function createLedgerMutationFn(data: PostLedgerApiData) {
  return assertSuccessApi(await postLedgerApi(data));
}

export async function updateLedgerMutationFn(options: {
  ledgerId: string;
  data: PatchLedgerApiData;
}) {
  return assertSuccessApi(await patchLedgerApi(options.ledgerId, options.data));
}

export async function updateLedgerPreferencesMutationFn(options: {
  ledgerId: string;
  data: PatchLedgerPreferencesApiData;
}) {
  return assertSuccessApi(
    await patchLedgerPreferencesApi(options.ledgerId, options.data),
  );
}

export async function archiveLedgerMutationFn(options: {
  ledgerId: string;
  data: PostArchiveLedgerApiData;
}) {
  return assertSuccessApi(await postArchiveLedgerApi(options.ledgerId, options.data));
}

export async function getLedgerInvitationPreviewQueryFn(code: string) {
  return assertSuccessApi(await getLedgerInvitationPreviewApi(code));
}

export async function getMyLedgerJoinRequestsQueryFn() {
  return assertSuccessApi(await getMyLedgerJoinRequestsApi());
}

export async function getLedgerJoinRequestsQueryFn(ledgerId: string) {
  return assertSuccessApi(await getLedgerJoinRequestsApi(ledgerId));
}

export async function getLedgerMembersQueryFn(
  ledgerId: string,
  params?: GetLedgerMembersApiParams,
) {
  return assertSuccessApi(await getLedgerMembersApi(ledgerId, params));
}

export async function createLedgerInvitationMutationFn(options: {
  ledgerId: string;
  data: PostLedgerInvitationApiData;
}) {
  return assertSuccessApi(await postLedgerInvitationApi(options.ledgerId, options.data));
}

export async function revokeLedgerInvitationMutationFn(options: {
  ledgerId: string;
  invitationId: string;
}) {
  return assertSuccessApi(
    await deleteLedgerInvitationApi(options.ledgerId, options.invitationId),
  );
}

export async function submitLedgerJoinRequestMutationFn(options: {
  code: string;
  data: PostLedgerJoinRequestApiData;
}) {
  return assertSuccessApi(await postLedgerJoinRequestApi(options.code, options.data));
}

export async function decideLedgerJoinRequestMutationFn(options: {
  ledgerId: string;
  requestId: string;
  data: PatchLedgerJoinRequestApiData;
}) {
  return assertSuccessApi(
    await patchLedgerJoinRequestApi(options.ledgerId, options.requestId, options.data),
  );
}

export async function updateLedgerMemberMutationFn(options: {
  ledgerId: string;
  memberId: string;
  data: PatchLedgerMemberApiData;
}) {
  return assertSuccessApi(
    await patchLedgerMemberApi(options.ledgerId, options.memberId, options.data),
  );
}

export async function removeLedgerMemberMutationFn(options: {
  ledgerId: string;
  memberId: string;
  version: number;
}) {
  return assertSuccessApi(
    await deleteLedgerMemberApi(options.ledgerId, options.memberId, options.version),
  );
}

export async function leaveLedgerMutationFn(options: {
  ledgerId: string;
  version: PostLeaveLedgerApiData['version'];
}) {
  return assertSuccessApi(
    await postLeaveLedgerApi(options.ledgerId, { version: options.version }),
  );
}

export async function transferLedgerOwnershipMutationFn(options: {
  ledgerId: string;
  data: PostLedgerOwnershipTransferApiData;
}) {
  return assertSuccessApi(
    await postLedgerOwnershipTransferApi(options.ledgerId, options.data),
  );
}

export async function cacheCreatedLedgerResponse<TLedger extends { id: string }>(
  queryClient: QueryClient,
  response: SuccessResponse<TLedger>,
) {
  queryClient.setQueryData(ledgerKeys.detail(response.data.id), response);
  await queryClient.invalidateQueries({ queryKey: ledgerKeys.lists() });
}

interface UseGetLedgersQueryOptions {
  params?: GetLedgersApiParams;
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<Ledger[]>,
      unknown,
      SuccessResponse<Ledger[]>,
      ReturnType<typeof ledgerKeys.list>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useGetLedgersQuery(options: UseGetLedgersQueryOptions = {}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getLedgersQueryFn(options.params),
    queryKey: ledgerKeys.list(options.params),
    ...options.queryOptions,
  });

  return {
    response,
    data: response?.data ?? [],
    ...rest,
  };
}

interface UseGetLedgerTemplatesQueryOptions {
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<LedgerTemplate[]>,
      unknown,
      SuccessResponse<LedgerTemplate[]>,
      ReturnType<typeof ledgerKeys.templates>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useGetLedgerTemplatesQuery(
  options: UseGetLedgerTemplatesQueryOptions = {},
) {
  const { data: response, ...rest } = useQuery({
    queryFn: getLedgerTemplatesQueryFn,
    queryKey: ledgerKeys.templates(),
    ...options.queryOptions,
  });

  return {
    response,
    data: response?.data ?? [],
    ...rest,
  };
}

interface UseGetLedgerQueryOptions {
  params: { ledgerId: string };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<Ledger>,
      unknown,
      SuccessResponse<Ledger>,
      ReturnType<typeof ledgerKeys.detail>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useGetLedgerQuery(options: UseGetLedgerQueryOptions) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getLedgerQueryFn(options.params.ledgerId),
    queryKey: ledgerKeys.detail(options.params.ledgerId),
    ...options.queryOptions,
  });

  return {
    response,
    data: response?.data,
    ...rest,
  };
}

export function useLedgerPreferencesQuery(options: {
  params: { ledgerId: string };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<LedgerPreference>,
      unknown,
      SuccessResponse<LedgerPreference>,
      ReturnType<typeof ledgerKeys.preferences>
    >,
    'queryFn' | 'queryKey'
  >;
}) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getLedgerPreferencesQueryFn(options.params.ledgerId),
    queryKey: ledgerKeys.preferences(options.params.ledgerId),
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

export function usePostLedgerMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: createLedgerMutationFn,
    onSuccess: async (response) => {
      await cacheCreatedLedgerResponse(queryClient, response);
    },
  });

  return [mutateAsync, rest] as const;
}

export function usePatchLedgerMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: updateLedgerMutationFn,
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ledgerKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ledgerKeys.detail(variables.ledgerId) }),
      ]);
    },
    onError: async (error, variables) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409)
        await queryClient.invalidateQueries({ queryKey: ledgerKeys.detail(variables.ledgerId) });
    },
  });

  return [mutateAsync, rest] as const;
}

export function usePatchLedgerPreferencesMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: updateLedgerPreferencesMutationFn,
    onSuccess: (response, variables) => {
      queryClient.setQueryData(
        ledgerKeys.preferences(variables.ledgerId),
        response,
      );
    },
    onError: async (error, variables) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409)
        await queryClient.invalidateQueries({ queryKey: ledgerKeys.preferences(variables.ledgerId) });
    },
  });
  return [mutateAsync, rest] as const;
}

export function useArchiveLedgerMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: archiveLedgerMutationFn,
    onSuccess: async (response, variables) => {
      queryClient.setQueryData(ledgerKeys.detail(variables.ledgerId), response);
      await queryClient.invalidateQueries({ queryKey: ledgerKeys.lists() });
    },
    onError: async (error, variables) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409)
        await queryClient.invalidateQueries({ queryKey: ledgerKeys.detail(variables.ledgerId) });
    },
  });
  return [mutateAsync, rest] as const;
}

interface UseInvitationPreviewQueryOptions {
  params: { code: string };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<LedgerInvitationPreview>,
      unknown,
      SuccessResponse<LedgerInvitationPreview>,
      ReturnType<typeof ledgerKeys.invitationPreview>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useInvitationPreviewQuery(options: UseInvitationPreviewQueryOptions) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getLedgerInvitationPreviewQueryFn(options.params.code),
    queryKey: ledgerKeys.invitationPreview(options.params.code),
    ...options.queryOptions,
  });

  return { response, data: response?.data, ...rest };
}

interface UseMyJoinRequestsQueryOptions {
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<LedgerJoinRequest[]>,
      unknown,
      SuccessResponse<LedgerJoinRequest[]>,
      ReturnType<typeof ledgerKeys.myJoinRequests>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useMyJoinRequestsQuery(options: UseMyJoinRequestsQueryOptions = {}) {
  const { data: response, ...rest } = useQuery({
    queryFn: getMyLedgerJoinRequestsQueryFn,
    queryKey: ledgerKeys.myJoinRequests(),
    ...options.queryOptions,
  });

  return { response, data: response?.data ?? [], ...rest };
}

interface UseLedgerJoinRequestsQueryOptions {
  params: { ledgerId: string };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<LedgerJoinRequest[]>,
      unknown,
      SuccessResponse<LedgerJoinRequest[]>,
      ReturnType<typeof ledgerKeys.joinRequests>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useLedgerJoinRequestsQuery(
  options: UseLedgerJoinRequestsQueryOptions,
) {
  const { data: response, ...rest } = useQuery({
    queryFn: () => getLedgerJoinRequestsQueryFn(options.params.ledgerId),
    queryKey: ledgerKeys.joinRequests(options.params.ledgerId),
    ...options.queryOptions,
  });

  return { response, data: response?.data ?? [], ...rest };
}

interface UseLedgerMembersQueryOptions {
  params: { ledgerId: string; status?: GetLedgerMembersApiParams['status'] };
  queryOptions?: Omit<
    UseQueryOptions<
      SuccessResponse<LedgerMember[]>,
      unknown,
      SuccessResponse<LedgerMember[]>,
      ReturnType<typeof ledgerKeys.members>
    >,
    'queryFn' | 'queryKey'
  >;
}

export function useLedgerMembersQuery(options: UseLedgerMembersQueryOptions) {
  const params = options.params.status
    ? { status: options.params.status }
    : undefined;
  const { data: response, ...rest } = useQuery({
    queryFn: () => getLedgerMembersQueryFn(options.params.ledgerId, params),
    queryKey: ledgerKeys.members(options.params.ledgerId, params),
    ...options.queryOptions,
  });

  return { response, data: response?.data ?? [], ...rest };
}

export function useCreateInvitationMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: createLedgerInvitationMutationFn,
  });
  return [mutateAsync, rest] as const;
}

export function useRevokeInvitationMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: revokeLedgerInvitationMutationFn,
  });
  return [mutateAsync, rest] as const;
}

export function useSubmitJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: submitLedgerJoinRequestMutationFn,
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ledgerKeys.myJoinRequests() }),
        queryClient.invalidateQueries({
          queryKey: ledgerKeys.joinRequests(response.data.ledger.id),
        }),
      ]);
    },
  });
  return [mutateAsync, rest] as const;
}

export function useDecideJoinRequestMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: decideLedgerJoinRequestMutationFn,
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ledgerKeys.joinRequests(variables.ledgerId),
        }),
        queryClient.invalidateQueries({
          queryKey: ledgerKeys.membersRoot(variables.ledgerId),
        }),
      ]);
    },
  });
  return [mutateAsync, rest] as const;
}

export function useUpdateLedgerMemberMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: updateLedgerMemberMutationFn,
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ledgerKeys.membersRoot(variables.ledgerId),
      });
    },
  });
  return [mutateAsync, rest] as const;
}

export function useRemoveLedgerMemberMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: removeLedgerMemberMutationFn,
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ledgerKeys.membersRoot(variables.ledgerId),
      });
    },
    onError: async (error, variables) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409)
        await queryClient.invalidateQueries({ queryKey: ledgerKeys.membersRoot(variables.ledgerId) });
    },
  });
  return [mutateAsync, rest] as const;
}

export function useLeaveLedgerMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: leaveLedgerMutationFn,
    onSuccess: async (_response, variables) => {
      queryClient.removeQueries({ queryKey: ledgerKeys.detail(variables.ledgerId), exact: true });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ledgerKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ledgerKeys.membersRoot(variables.ledgerId) }),
      ]);
    },
  });
  return [mutateAsync, rest] as const;
}

export function useTransferLedgerOwnershipMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: transferLedgerOwnershipMutationFn,
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ledgerKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ledgerKeys.detail(variables.ledgerId) }),
        queryClient.invalidateQueries({ queryKey: ledgerKeys.membersRoot(variables.ledgerId) }),
      ]);
    },
    onError: async (error, variables) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ledgerKeys.detail(variables.ledgerId) }),
          queryClient.invalidateQueries({ queryKey: ledgerKeys.membersRoot(variables.ledgerId) }),
        ]);
      }
    },
  });
  return [mutateAsync, rest] as const;
}

export const useLedgersQuery = useGetLedgersQuery;
export const useLedgerTemplatesQuery = useGetLedgerTemplatesQuery;
export const useLedgerQuery = useGetLedgerQuery;
export const useCreateLedgerMutation = usePostLedgerMutation;

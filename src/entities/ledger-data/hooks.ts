import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  GetLedgerRecoveryRecordsApiParams,
  GetLedgerTagsApiParams,
  PatchLedgerTagApiData,
  PostLedgerExportApiData,
  PostLedgerRestoreRecordApiData,
  PostLedgerTagApiData,
} from './api';
import type {
  LedgerExportTask,
  LedgerTag,
  LedgerTransferPreview,
  LedgerTransferRequest,
  LedgerTransferResult,
  RecoverableLedgerRecord,
} from './types';
import type { SuccessResponse } from '@/shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assertSuccessApi } from '@/shared/api';
import {
  deleteLedgerTagApi,
  downloadLedgerExportApi,
  getLedgerExportTaskApi,
  getLedgerRecoveryRecordsApi,
  getLedgerTagsApi,
  patchLedgerTagApi,
  postLedgerExportApi,
  postLedgerRestoreRecordApi,
  postLedgerTagApi,
  postLedgerTransferExecuteApi,
  postLedgerTransferPreviewApi,
} from './api';
import { ledgerDataKeys } from './keys';

export async function getLedgerTagsQueryFn(ledgerId: string, params?: GetLedgerTagsApiParams) {
  return assertSuccessApi(await getLedgerTagsApi(ledgerId, params));
}

export async function getLedgerRecoveryRecordsQueryFn(
  ledgerId: string,
  params?: GetLedgerRecoveryRecordsApiParams,
) {
  return assertSuccessApi(await getLedgerRecoveryRecordsApi(ledgerId, params));
}

export async function getLedgerExportTaskQueryFn(ledgerId: string, taskId: string) {
  return assertSuccessApi(await getLedgerExportTaskApi(ledgerId, taskId));
}

export async function createLedgerTagMutationFn(options: {
  ledgerId: string;
  data: PostLedgerTagApiData;
}) {
  return assertSuccessApi(await postLedgerTagApi(options.ledgerId, options.data));
}

export async function updateLedgerTagMutationFn(options: {
  ledgerId: string;
  tagId: string;
  data: PatchLedgerTagApiData;
}) {
  return assertSuccessApi(
    await patchLedgerTagApi(options.ledgerId, options.tagId, options.data),
  );
}

export async function archiveLedgerTagMutationFn(options: {
  ledgerId: string;
  tagId: string;
  version: number;
}) {
  return assertSuccessApi(
    await deleteLedgerTagApi(options.ledgerId, options.tagId, { version: options.version }),
  );
}

export async function restoreLedgerRecordMutationFn(options: {
  ledgerId: string;
  recordId: number;
  data: PostLedgerRestoreRecordApiData;
}) {
  return assertSuccessApi(
    await postLedgerRestoreRecordApi(options.ledgerId, options.recordId, options.data),
  );
}

export async function previewLedgerTransferMutationFn(data: LedgerTransferRequest) {
  return assertSuccessApi(await postLedgerTransferPreviewApi(data));
}

export async function executeLedgerTransferMutationFn(data: LedgerTransferRequest) {
  return assertSuccessApi(await postLedgerTransferExecuteApi(data));
}

export async function createLedgerExportMutationFn(options: {
  ledgerId: string;
  data: PostLedgerExportApiData;
}) {
  return assertSuccessApi(await postLedgerExportApi(options.ledgerId, options.data));
}

export function useLedgerTagsQuery(options: {
  params: { ledgerId: string; status?: GetLedgerTagsApiParams['status'] };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<LedgerTag[]>>, 'queryFn' | 'queryKey'>;
}) {
  const status = options.params.status ?? 'ACTIVE';
  const { data: response, ...rest } = useQuery<SuccessResponse<LedgerTag[]>>({
    queryFn: () => getLedgerTagsQueryFn(options.params.ledgerId, { status }),
    queryKey: ledgerDataKeys.tags(options.params.ledgerId, status),
    ...options.queryOptions,
  });
  return { response, data: response?.data ?? [], ...rest };
}

export function useLedgerRecoveryRecordsQuery(options: {
  params: { ledgerId: string; days?: number };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<RecoverableLedgerRecord[]>>, 'queryFn' | 'queryKey'>;
}) {
  const days = options.params.days ?? 30;
  const { data: response, ...rest } = useQuery<SuccessResponse<RecoverableLedgerRecord[]>>({
    queryFn: () => getLedgerRecoveryRecordsQueryFn(options.params.ledgerId, { days }),
    queryKey: ledgerDataKeys.recovery(options.params.ledgerId, days),
    ...options.queryOptions,
  });
  return { response, data: response?.data ?? [], ...rest };
}

export function useLedgerExportTaskQuery(options: {
  params: { ledgerId: string; taskId: string };
  queryOptions?: Omit<UseQueryOptions<SuccessResponse<LedgerExportTask>>, 'queryFn' | 'queryKey'>;
}) {
  const { ledgerId, taskId } = options.params;
  const { data: response, ...rest } = useQuery<SuccessResponse<LedgerExportTask>>({
    queryFn: () => getLedgerExportTaskQueryFn(ledgerId, taskId),
    queryKey: ledgerDataKeys.exportTask(ledgerId, taskId),
    ...options.queryOptions,
  });
  return { response, data: response?.data, ...rest };
}

function useTagMutation<TVariables extends { ledgerId: string }>(
  mutationFn: (variables: TVariables) => Promise<SuccessResponse<LedgerTag>>,
) {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn,
    onSuccess: async (_response, variables) => queryClient.invalidateQueries({
      queryKey: ledgerDataKeys.tagsRoot(variables.ledgerId),
    }),
    onError: async (error, variables) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409)
        await queryClient.invalidateQueries({ queryKey: ledgerDataKeys.tagsRoot(variables.ledgerId) });
    },
  });
  return [mutateAsync, rest] as const;
}

export function useCreateLedgerTagMutation() {
  return useTagMutation(createLedgerTagMutationFn);
}

export function useUpdateLedgerTagMutation() {
  return useTagMutation(updateLedgerTagMutationFn);
}

export function useArchiveLedgerTagMutation() {
  return useTagMutation(archiveLedgerTagMutationFn);
}

export function useRestoreLedgerRecordMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: restoreLedgerRecordMutationFn,
    onSuccess: async (_response, variables) => Promise.all([
      queryClient.invalidateQueries({ queryKey: ledgerDataKeys.recovery(variables.ledgerId) }),
      queryClient.invalidateQueries({ queryKey: ['record', 'ledger', variables.ledgerId] }),
    ]),
    onError: async (error, variables) => {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409)
        await queryClient.invalidateQueries({ queryKey: ledgerDataKeys.recovery(variables.ledgerId) });
    },
  });
  return [mutateAsync, rest] as const;
}

export function usePreviewLedgerTransferMutation() {
  const { mutateAsync, ...rest } = useMutation<
    SuccessResponse<LedgerTransferPreview>,
    unknown,
    LedgerTransferRequest
  >({ mutationFn: previewLedgerTransferMutationFn });
  return [mutateAsync, rest] as const;
}

export function useExecuteLedgerTransferMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation<
    SuccessResponse<LedgerTransferResult>,
    unknown,
    LedgerTransferRequest
  >({
    mutationFn: executeLedgerTransferMutationFn,
    onSuccess: async (_response, variables) => Promise.all([
      queryClient.invalidateQueries({ queryKey: ['record', 'ledger', variables.sourceLedgerId] }),
      queryClient.invalidateQueries({ queryKey: ['record', 'ledger', variables.targetLedgerId] }),
    ]),
  });
  return [mutateAsync, rest] as const;
}

export function useCreateLedgerExportMutation() {
  const queryClient = useQueryClient();
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: createLedgerExportMutationFn,
    onSuccess: (response, variables) => {
      queryClient.setQueryData(
        ledgerDataKeys.exportTask(variables.ledgerId, response.data.id),
        response,
      );
    },
  });
  return [mutateAsync, rest] as const;
}

export function useDownloadLedgerExportMutation() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: (options: { ledgerId: string; taskId: string }) =>
      downloadLedgerExportApi(options.ledgerId, options.taskId),
  });
  return [mutateAsync, rest] as const;
}

import type { LedgerTransferPreview } from '@/entities/ledger-data';
import type { RecordEntry } from '@/entities/record';
import { Button, Checkbox, NavBar, Toast } from 'antd-mobile';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLedgerCategoriesQuery } from '@/entities/category';
import { LedgerCapability, useLedgersQuery } from '@/entities/ledger';
import {
  useExecuteLedgerTransferMutation,
  useLedgerTagsQuery,
  usePreviewLedgerTransferMutation,
} from '@/entities/ledger-data';
import { useLedgerRecordsQuery } from '@/entities/record';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { buildLedgerTransferRequest, groupLedgerTransferConflicts } from './model';

function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `transfer-${Date.now()}`;
}

interface SourceCategory {
  id: number;
  name: string;
  type: 'add' | 'sub';
}

function TransferRecordSelector({
  records,
  selectedIds,
  onChange,
}: {
  records: RecordEntry[];
  selectedIds: number[];
  onChange: (recordId: number, selected: boolean) => void;
}) {
  const { t } = useTranslation('ledger');
  return (
    <section className="mt-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <strong className="text-font-black">{t('transfer.chooseRecords')}</strong>
        <span className="text-font-gray">
          {t('transfer.selectedCount', { count: selectedIds.length })}
        </span>
      </div>
      <div className="max-h-[320px] overflow-auto rounded-xl border border-solid border-[#EBEBEB]">
        {records.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-font-gray">
            {t('transfer.noRecords')}
          </p>
        )}
        {records.map(record => (
          <label
            className="flex items-center gap-3 border-0 border-b border-solid border-[#EBEBEB] px-3 py-3 last:border-b-0"
            key={record.id}
          >
            <Checkbox
              checked={selectedIds.includes(record.id)}
              disabled={!selectedIds.includes(record.id) && selectedIds.length >= 100}
              onChange={checked => onChange(record.id, checked)}
            />
            <span className="min-w-0 flex-grow">
              <strong className="block truncate text-sm text-font-black">
                {record.remark || record.category.name}
              </strong>
              <span className="mt-1 block text-xs text-font-gray">
                {record.category.name}
                {' · '}
                {record.time.slice(0, 10)}
              </span>
            </span>
            <span className="shrink-0 text-sm text-font-black">
              {record.type === 'sub' ? '-' : '+'}
              {record.amount}
            </span>
          </label>
        ))}
      </div>
      {selectedIds.length >= 100 && (
        <p className="mt-2 text-xs text-font-gray">{t('transfer.maximumRecords')}</p>
      )}
    </section>
  );
}

function TransferContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const ledgers = useLedgersQuery();
  const recordsQuery = useLedgerRecordsQuery({ params: { ledgerId } });
  const [targetLedgerId, setTargetLedgerId] = useState('');
  const targetCategories = useLedgerCategoriesQuery({
    params: { ledgerId: targetLedgerId },
    queryOptions: { enabled: Boolean(targetLedgerId) },
  });
  const targetTags = useLedgerTagsQuery({
    params: { ledgerId: targetLedgerId, status: 'ACTIVE' },
    queryOptions: { enabled: Boolean(targetLedgerId) },
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [categoryMappings, setCategoryMappings] = useState<Record<string, number>>({});
  const [tagMappings, setTagMappings] = useState<Record<string, string>>({});
  const [tagStrategy, setTagStrategy] = useState<'drop' | 'map'>('drop');
  const [preview, setPreview] = useState<LedgerTransferPreview>();
  const [requestKey, setRequestKey] = useState(createIdempotencyKey);
  const [previewTransfer, previewState] = usePreviewLedgerTransferMutation();
  const [executeTransfer, executeState] = useExecuteLedgerTransferMutation();
  const submittingRef = useRef(false);
  const selectedRecords = useMemo(
    () => recordsQuery.data.data.filter(record => selectedIds.includes(record.id)),
    [recordsQuery.data.data, selectedIds],
  );
  const sourceCategories = useMemo(() => {
    const values = new Map<number, SourceCategory>();
    selectedRecords.forEach((record) => {
      values.set(record.category.id, {
        id: record.category.id,
        name: record.category.name,
        type: record.type,
      });
    });
    return [...values.values()];
  }, [selectedRecords]);
  const sourceTags = useMemo(() => {
    const values = new Map<string, string>();
    selectedRecords.forEach(record => record.tags?.forEach(tag => values.set(tag.id, tag.name)));
    return [...values].map(([id, name]) => ({ id, name }));
  }, [selectedRecords]);
  const mappingComplete = sourceCategories.every(category => Boolean(categoryMappings[category.id]))
    && (tagStrategy === 'drop' || sourceTags.every(tag => Boolean(tagMappings[tag.id])));
  const canPreview = Boolean(targetLedgerId)
    && selectedIds.length > 0
    && selectedIds.length <= 100
    && mappingComplete;

  const invalidatePreview = () => setPreview(undefined);
  const buildRequest = () => buildLedgerTransferRequest({
    categoryMappings,
    idempotencyKey: requestKey,
    recordIds: selectedIds,
    sourceLedgerId: ledgerId,
    ...(tagStrategy === 'map' ? { tagMappings } : {}),
    tagStrategy,
    targetLedgerId,
  });

  return (
    <section className="bg-white px-4 py-4">
      <label className="mb-3 block text-sm text-font-gray">
        {t('transfer.target')}
        <select
          className="mt-1 min-h-[44px] w-full rounded-xl border border-solid border-[#EBEBEB] bg-white px-3 text-font-black"
          onChange={(event) => {
            setTargetLedgerId(event.target.value);
            setCategoryMappings({});
            setTagMappings({});
            invalidatePreview();
          }}
          value={targetLedgerId}
        >
          <option value="">{t('transfer.chooseTarget')}</option>
          {ledgers.data
            .filter(ledger => ledger.id !== ledgerId
              && ledger.capabilities.includes(LedgerCapability.RECORD_CREATE))
            .map(ledger => <option key={ledger.id} value={ledger.id}>{ledger.name}</option>)}
        </select>
      </label>

      <TransferRecordSelector
        onChange={(recordId, selected) => {
          setSelectedIds(current => selected
            ? [...current, recordId]
            : current.filter(id => id !== recordId));
          invalidatePreview();
        }}
        records={recordsQuery.data.data}
        selectedIds={selectedIds}
      />

      {targetLedgerId && sourceCategories.length > 0 && (
        <section className="mt-4 space-y-3">
          <h2 className="text-sm font-medium text-font-black">{t('transfer.categoryMappings')}</h2>
          {sourceCategories.map(source => (
            <label className="block text-sm text-font-gray" key={source.id}>
              {t('transfer.categoryMappingLabel', { name: source.name })}
              <select
                className="mt-1 min-h-[44px] w-full rounded-xl border border-solid border-[#EBEBEB] bg-white px-3 text-font-black"
                onChange={(event) => {
                  setCategoryMappings(current => ({
                    ...current,
                    [source.id]: Number(event.target.value),
                  }));
                  invalidatePreview();
                }}
                value={categoryMappings[source.id] ?? ''}
              >
                <option value="">{t('transfer.chooseCategory')}</option>
                {targetCategories.data
                  .filter(category => category.type === source.type)
                  .map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
              </select>
            </label>
          ))}
        </section>
      )}

      {sourceTags.length > 0 && (
        <section className="mt-4">
          <h2 className="text-sm font-medium text-font-black">{t('transfer.tagHandling')}</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['drop', 'map'] as const).map(strategy => (
              <button
                className={`h-10 rounded-xl border border-solid border-[#EBEBEB] ${tagStrategy === strategy ? 'bg-primary text-font-black' : 'bg-white text-font-gray'}`}
                key={strategy}
                onClick={() => {
                  setTagStrategy(strategy);
                  invalidatePreview();
                }}
                type="button"
              >
                {t(`transfer.tagStrategy.${strategy}`)}
              </button>
            ))}
          </div>
          {tagStrategy === 'map' && (
            <div className="mt-3 space-y-3">
              {sourceTags.map(source => (
                <label className="block text-sm text-font-gray" key={source.id}>
                  {t('transfer.tagMappingLabel', { name: source.name })}
                  <select
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-solid border-[#EBEBEB] bg-white px-3 text-font-black"
                    onChange={(event) => {
                      setTagMappings(current => ({ ...current, [source.id]: event.target.value }));
                      invalidatePreview();
                    }}
                    value={tagMappings[source.id] ?? ''}
                  >
                    <option value="">{t('transfer.chooseTag')}</option>
                    {targetTags.data.map(tag => (
                      <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
        </section>
      )}

      <Button
        block
        className="mt-5"
        disabled={!canPreview}
        loading={previewState.isLoading}
        onClick={async () => {
          if (submittingRef.current || !canPreview)
            return;
          submittingRef.current = true;
          try {
            const response = await previewTransfer(buildRequest());
            setPreview(response.data);
          }
          catch {
            Toast.show({ icon: 'fail', content: t('transfer.previewFailed') });
          }
          finally {
            submittingRef.current = false;
          }
        }}
      >
        {t('transfer.preview')}
      </Button>

      {preview && (
        <div className="my-3 rounded-xl bg-bg-gray px-3 py-3">
          <p>{t('transfer.previewSummary', { conflicts: preview.conflictCount, ready: preview.readyCount })}</p>
          {groupLedgerTransferConflicts(preview.conflicts).map(group => (
            <p className="mt-2 text-sm text-font-gray" key={group.recordId}>
              #
              {group.recordId}
              :
              {group.conflicts.map(conflict => conflict.message).join(' / ')}
            </p>
          ))}
        </div>
      )}

      <Button
        block
        color="primary"
        disabled={!preview || preview.conflictCount > 0 || preview.readyCount !== selectedIds.length}
        loading={executeState.isLoading}
        onClick={async () => {
          if (submittingRef.current || !preview)
            return;
          submittingRef.current = true;
          try {
            await executeTransfer(buildRequest());
            setRequestKey(createIdempotencyKey());
            setPreview(undefined);
            setSelectedIds([]);
            setCategoryMappings({});
            setTagMappings({});
            Toast.show({ icon: 'success', content: t('transfer.done') });
          }
          catch {
            Toast.show({ icon: 'fail', content: t('transfer.failed') });
          }
          finally {
            submittingRef.current = false;
          }
        }}
      >
        {t('transfer.execute')}
      </Button>
    </section>
  );
}

export default function LedgerTransferPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('transfer.title')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.DATA_TRANSFER}>
        {({ ledgerId }) => <TransferContent ledgerId={ledgerId} />}
      </LedgerScopeBoundary>
    </div>
  );
}

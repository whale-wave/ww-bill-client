import type { LedgerTransferPreview } from '@/entities/ledger-data';
import type { RecordEntry } from '@/entities/record';
import { Toast } from 'antd-mobile';
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
import {
  ContentStack,
  GradientPanel,
  PageHeader,
  SectionStack,
  SelectField,
} from '@/shared/ui';
import {
  buildLedgerTransferRequest,
  buildSourceLedgerOptions,
  groupLedgerTransferConflicts,
} from './model';

function createIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.()
    ?? `transfer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    <ContentStack>
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-ww-ink">{t('transfer.chooseRecords')}</h2>
        <span className="text-[11px] font-semibold text-ww-mid">
          {t('transfer.selectedCount', { count: selectedIds.length })}
        </span>
      </div>
      <div className="max-h-[320px] overflow-auto rounded-[16px] border border-solid border-border-primary bg-white/70">
        {records.length === 0 && (
          <p className="px-3 py-8 text-center text-[13px] font-semibold text-ww-mid">
            {t('transfer.noRecords')}
          </p>
        )}
        {records.map(record => (
          <label
            className="flex items-center gap-3 border-0 border-b border-solid border-border-primary px-3 py-3 last:border-b-0"
            key={record.id}
          >
            <input
              checked={selectedIds.includes(record.id)}
              className="h-4 w-4 shrink-0 accent-[var(--adm-color-primary)]"
              disabled={!selectedIds.includes(record.id) && selectedIds.length >= 100}
              onChange={event => onChange(record.id, event.target.checked)}
              type="checkbox"
            />
            <span className="min-w-0 flex-grow">
              <strong className="block truncate text-[14px] font-semibold text-ww-ink">
                {record.remark || record.category.name}
              </strong>
              <span className="mt-1 block text-[12px] font-semibold text-ww-mid">
                {record.category.name}
                {' · '}
                {record.time.slice(0, 10)}
              </span>
            </span>
            <span className="shrink-0 font-number text-[14px] font-bold text-ww-ink">
              {record.type === 'sub' ? '-' : '+'}
              {record.amount}
            </span>
          </label>
        ))}
      </div>
      {selectedIds.length >= 100 && (
        <p className="text-[11px] font-semibold text-ww-mid">{t('transfer.maximumRecords')}</p>
      )}
    </ContentStack>
  );
}

function TransferContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const ledgers = useLedgersQuery();
  const [sourceLedgerId, setSourceLedgerId] = useState('');
  const recordsQuery = useLedgerRecordsQuery({
    params: { ledgerId: sourceLedgerId },
    queryOptions: { enabled: Boolean(sourceLedgerId) },
  });
  const targetCategories = useLedgerCategoriesQuery({
    params: { ledgerId },
  });
  const targetTags = useLedgerTagsQuery({
    params: { ledgerId, status: 'ACTIVE' },
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
  const canPreview = Boolean(sourceLedgerId)
    && selectedIds.length > 0
    && selectedIds.length <= 100
    && mappingComplete;

  const handleRequestChange = () => {
    setRequestKey(createIdempotencyKey());
    setPreview(undefined);
  };
  const handleSourceChange = (value: string) => {
    setSourceLedgerId(value);
    setSelectedIds([]);
    setCategoryMappings({});
    setTagMappings({});
    handleRequestChange();
  };
  const buildRequest = () => buildLedgerTransferRequest({
    categoryMappings,
    idempotencyKey: requestKey,
    recordIds: selectedIds,
    sourceLedgerId,
    ...(tagStrategy === 'map' ? { tagMappings } : {}),
    tagStrategy,
    targetLedgerId: ledgerId,
  });

  return (
    <SectionStack className="pt-2">
      <GradientPanel className="px-4 py-4" elevation="low" surface="ice">
        <ContentStack>
          <SelectField
            label={t('transfer.source')}
            onChange={handleSourceChange}
            options={buildSourceLedgerOptions(ledgers.data, ledgerId)
              .map(ledger => ({ label: ledger.name, value: ledger.id }))}
            placeholder={t('transfer.chooseSource')}
            value={sourceLedgerId}
          />

          {sourceLedgerId
            ? (
                <TransferRecordSelector
                  onChange={(recordId, selected) => {
                    setSelectedIds(current => selected
                      ? [...current, recordId]
                      : current.filter(id => id !== recordId));
                    handleRequestChange();
                  }}
                  records={recordsQuery.data.data}
                  selectedIds={selectedIds}
                />
              )
            : <p className="text-[12px] font-semibold leading-5 text-ww-mid">{t('transfer.chooseSourceHint')}</p>}
        </ContentStack>
      </GradientPanel>

      {sourceLedgerId && sourceCategories.length > 0 && (
        <GradientPanel className="px-4 py-4" elevation="low" surface="glass">
          <ContentStack>
            <h2 className="text-[13px] font-bold text-ww-ink">{t('transfer.categoryMappings')}</h2>
            <ContentStack>
              {sourceCategories.map(source => (
                <SelectField
                  key={source.id}
                  label={t('transfer.categoryMappingLabel', { name: source.name })}
                  onChange={(value) => {
                    setCategoryMappings(current => ({
                      ...current,
                      [source.id]: Number(value),
                    }));
                    handleRequestChange();
                  }}
                  options={targetCategories.data
                    .filter(category => category.type === source.type)
                    .map(category => ({ label: category.name, value: String(category.id) }))}
                  placeholder={t('transfer.chooseCategory')}
                  value={categoryMappings[source.id] ? String(categoryMappings[source.id]) : ''}
                />
              ))}
            </ContentStack>
          </ContentStack>
        </GradientPanel>
      )}

      {sourceTags.length > 0 && (
        <GradientPanel className="px-4 py-4" elevation="low" surface="glass">
          <ContentStack>
            <h2 className="text-[13px] font-bold text-ww-ink">{t('transfer.tagHandling')}</h2>
            <div className="grid grid-cols-2 gap-1.5 rounded-[16px] border border-solid border-border-primary bg-white/70 p-1.5 shadow-ww-xs">
              {(['drop', 'map'] as const).map(strategy => (
                <button
                  className={`min-h-10 rounded-[13px] px-2 text-[12px] font-bold transition ${tagStrategy === strategy ? 'bg-primary text-white shadow-ww-xs' : 'bg-white/40 text-ww-mid'}`}
                  key={strategy}
                  onClick={() => {
                    setTagStrategy(strategy);
                    handleRequestChange();
                  }}
                  type="button"
                >
                  {t(`transfer.tagStrategy.${strategy}`)}
                </button>
              ))}
            </div>
            {tagStrategy === 'map' && (
              <ContentStack>
                {sourceTags.map(source => (
                  <SelectField
                    key={source.id}
                    label={t('transfer.tagMappingLabel', { name: source.name })}
                    onChange={(value) => {
                      setTagMappings(current => ({ ...current, [source.id]: value }));
                      handleRequestChange();
                    }}
                    options={targetTags.data.map(tag => ({ label: tag.name, value: tag.id }))}
                    placeholder={t('transfer.chooseTag')}
                    value={tagMappings[source.id] ?? ''}
                  />
                ))}
              </ContentStack>
            )}
          </ContentStack>
        </GradientPanel>
      )}

      <button
        className="h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
        disabled={!canPreview || previewState.isLoading}
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
        type="button"
      >
        {previewState.isLoading ? t('transfer.previewing') : t('transfer.preview')}
      </button>

      {preview && (
        <GradientPanel className="px-4 py-4" elevation="low" surface="ice">
          <ContentStack>
            <p className="text-[13px] font-bold text-ww-ink">
              {t('transfer.previewSummary', { conflicts: preview.conflictCount, ready: preview.readyCount })}
            </p>
            {groupLedgerTransferConflicts(preview.conflicts).map(group => (
              <p className="text-[12px] font-semibold leading-5 text-ww-mid" key={group.recordId}>
                #
                {group.recordId}
                :
                {group.conflicts.map(conflict => conflict.message).join(' / ')}
              </p>
            ))}
          </ContentStack>
        </GradientPanel>
      )}

      <button
        className="h-[52px] w-full rounded-[18px] border border-solid border-border-primary bg-white/85 text-[14px] font-extrabold text-primary-deep shadow-ww disabled:opacity-45"
        disabled={!preview || preview.conflictCount > 0 || preview.readyCount !== selectedIds.length || executeState.isLoading}
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
        type="button"
      >
        {executeState.isLoading ? t('transfer.executing') : t('transfer.execute')}
      </button>
    </SectionStack>
  );
}

export default function LedgerTransferPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('transfer.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px]">
          <LedgerScopeBoundary capability={LedgerCapability.DATA_TRANSFER}>
            {({ ledgerId }) => <TransferContent ledgerId={ledgerId} />}
          </LedgerScopeBoundary>
        </div>
      </main>
    </div>
  );
}

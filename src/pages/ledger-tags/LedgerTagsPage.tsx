import { Toast } from 'antd-mobile';
import { Tag } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { useArchiveLedgerTagMutation, useCreateLedgerTagMutation, useLedgerTagsQuery, useUpdateLedgerTagMutation } from '@/entities/ledger-data';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, IllustratedEmptyState, PageHeader } from '@/shared/ui';

function TagsContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const query = useLedgerTagsQuery({ params: { ledgerId }, queryOptions: { enabled: Boolean(ledgerId) } });
  const [createTag, createState] = useCreateLedgerTagMutation();
  const [updateTag, updateState] = useUpdateLedgerTagMutation();
  const [archiveTag, archiveState] = useArchiveLedgerTagMutation();
  const [newName, setNewName] = useState('');
  const creatingRef = useRef(false);

  return (
    <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto w-full max-w-[520px]">
        <GradientPanel className="px-4 py-4" elevation="standard" surface="ice">
          <div className="flex gap-2">
            <input
              className="h-11 min-w-0 flex-1 rounded-[14px] border border-solid border-border-primary bg-white/85 px-3 text-[14px] font-semibold text-ww-ink outline-none shadow-ww-xs transition placeholder:text-ww-soft focus:border-primary-mid"
              data-testid="ledger-tag-create-input"
              onChange={event => setNewName(event.target.value)}
              placeholder={t('tags.name')}
              value={newName}
            />
            <button
              className="h-11 shrink-0 rounded-[14px] border-0 bg-primary px-4 text-[13px] font-extrabold text-white shadow-ww-xs disabled:opacity-45"
              data-testid="ledger-tag-create"
              disabled={!newName.trim() || createState.isLoading}
              onClick={async () => {
                if (creatingRef.current)
                  return;
                creatingRef.current = true;
                try {
                  await createTag({ data: { name: newName.trim() }, ledgerId });
                  setNewName('');
                }
                finally {
                  creatingRef.current = false;
                }
              }}
              type="button"
            >
              {createState.isLoading ? t('tags.creating') : t('tags.create')}
            </button>
          </div>
        </GradientPanel>

        {query.data.length === 0 && (
          <GradientPanel className="mt-3 overflow-hidden" elevation="low" surface="glass">
            <IllustratedEmptyState
              description={t('tags.emptyDescription')}
              icon={<Tag className="text-primary-deep" size={38} strokeWidth={1.8} />}
              title={t('tags.empty')}
            />
          </GradientPanel>
        )}

        {query.data.map(tag => (
          <GradientPanel className="mt-3 flex items-center gap-2 px-3 py-3" elevation="low" key={tag.id} surface="glass">
            <input
              aria-label={t('tags.name')}
              className="h-11 min-w-0 flex-1 rounded-[13px] border border-solid border-border-primary bg-white/75 px-3 text-[14px] font-semibold text-ww-ink outline-none transition focus:border-primary-mid"
              defaultValue={tag.name}
              id={`ledger-tag-${tag.id}`}
            />
            <button
              className="h-9 shrink-0 rounded-[12px] border border-solid border-primary-light bg-white/70 px-3 text-[12px] font-extrabold text-primary-deep shadow-ww-xs disabled:opacity-45"
              data-testid={`ledger-tag-save-${tag.id}`}
              disabled={updateState.isLoading}
              onClick={async () => {
                const name = (document.getElementById(`ledger-tag-${tag.id}`) as HTMLInputElement | null)?.value ?? tag.name;
                try {
                  await updateTag({ data: { name: name.trim(), version: tag.version }, ledgerId, tagId: tag.id });
                }
                catch {
                  await query.refetch();
                  Toast.show({ icon: 'fail', content: t('tags.saveFailed') });
                }
              }}
              type="button"
            >
              {t('common.save')}
            </button>
            <button
              className="h-9 shrink-0 rounded-[12px] border border-solid border-[#f2c5d5] bg-[#fff1f6]/90 px-3 text-[12px] font-extrabold text-[#ad496b] shadow-ww-xs disabled:opacity-45"
              data-testid={`ledger-tag-archive-${tag.id}`}
              disabled={archiveState.isLoading}
              onClick={async () => {
                try {
                  await archiveTag({ ledgerId, tagId: tag.id, version: tag.version });
                }
                catch {
                  await query.refetch();
                }
              }}
              type="button"
            >
              {t('tags.archive')}
            </button>
          </GradientPanel>
        ))}
      </div>
    </main>
  );
}

export default function LedgerTagsPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('tags.title')} />
      <LedgerScopeBoundary capability={LedgerCapability.TAG_MANAGE}>
        {({ ledgerId }) => <TagsContent ledgerId={ledgerId} />}
      </LedgerScopeBoundary>
    </div>
  );
}

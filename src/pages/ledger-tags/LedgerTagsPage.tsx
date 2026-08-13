import { Button, Input, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { useArchiveLedgerTagMutation, useCreateLedgerTagMutation, useLedgerTagsQuery, useUpdateLedgerTagMutation } from '@/entities/ledger-data';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, PageHeader } from '@/shared/ui';

function TagsContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const query = useLedgerTagsQuery({ params: { ledgerId }, queryOptions: { enabled: Boolean(ledgerId) } });
  const [createTag, createState] = useCreateLedgerTagMutation();
  const [updateTag, updateState] = useUpdateLedgerTagMutation();
  const [archiveTag, archiveState] = useArchiveLedgerTagMutation();
  const [newName, setNewName] = useState('');
  const creatingRef = useRef(false);

  return (
    <main className="min-h-0 flex-grow overflow-auto px-[18px] pb-6 pt-2">
      <div className="mx-auto w-full max-w-[520px] space-y-3">
        <GradientPanel className="flex gap-2 px-3 py-3" elevation="standard" surface="ice">
          <div className="min-w-0 flex-1 rounded-[14px] border border-solid border-border-primary bg-white/80 px-3"><Input onChange={setNewName} placeholder={t('tags.name')} value={newName} /></div>
          <Button
            className="!rounded-[13px] !border-0 !bg-primary !font-extrabold !text-white"
            disabled={!newName.trim()}
            loading={createState.isLoading}
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
          >
            {t('tags.create')}
          </Button>
        </GradientPanel>
        {query.data.map(tag => (
          <GradientPanel className="flex items-center gap-2 px-3 py-3" elevation="low" key={tag.id} surface="glass">
            <div className="min-w-0 flex-1 rounded-[13px] border border-solid border-border-primary bg-white/70 px-2"><Input aria-label={t('tags.name')} defaultValue={tag.name} id={`ledger-tag-${tag.id}`} /></div>
            <Button
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
              className="!rounded-[12px] !border-primary-light !text-primary-deep"
              size="mini"
            >
              {t('common.save')}
            </Button>
            <Button
              color="danger"
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
              className="!rounded-[12px]"
              size="mini"
            >
              {t('tags.archive')}
            </Button>
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

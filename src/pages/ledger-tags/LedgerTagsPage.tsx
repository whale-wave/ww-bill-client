import { Button, Input, NavBar, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { useArchiveLedgerTagMutation, useCreateLedgerTagMutation, useLedgerTagsQuery, useUpdateLedgerTagMutation } from '@/entities/ledger-data';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';

function TagsContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const query = useLedgerTagsQuery({ params: { ledgerId }, queryOptions: { enabled: Boolean(ledgerId) } });
  const [createTag, createState] = useCreateLedgerTagMutation();
  const [updateTag, updateState] = useUpdateLedgerTagMutation();
  const [archiveTag, archiveState] = useArchiveLedgerTagMutation();
  const [newName, setNewName] = useState('');
  const creatingRef = useRef(false);

  return (
    <main className="min-h-0 flex-grow overflow-auto">
      <section className="mt-2 flex gap-2 bg-white px-4 py-3">
        <Input onChange={setNewName} placeholder={t('tags.name')} value={newName} />
        <Button
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
      </section>
      {query.data.map(tag => (
        <div className="mt-2 flex items-center gap-2 bg-white px-4 py-3" key={tag.id}>
          <Input aria-label={t('tags.name')} defaultValue={tag.name} id={`ledger-tag-${tag.id}`} />
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
            size="small"
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
            size="small"
          >
            {t('tags.archive')}
          </Button>
        </div>
      ))}
    </main>
  );
}

export default function LedgerTagsPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('tags.title')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.TAG_MANAGE}>
        {({ ledgerId }) => <TagsContent ledgerId={ledgerId} />}
      </LedgerScopeBoundary>
    </div>
  );
}

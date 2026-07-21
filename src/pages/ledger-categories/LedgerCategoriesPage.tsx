import { Button, Input, NavBar, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateLedgerCategoryMutation, useDeleteLedgerCategoryMutation, useLedgerCategoriesQuery, useUpdateLedgerCategoryMutation } from '@/entities/category';
import { LedgerCapability } from '@/entities/ledger';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';

function CategoriesContent({ ledgerId }: { ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const query = useLedgerCategoriesQuery({ params: { ledgerId }, queryOptions: { enabled: Boolean(ledgerId) } });
  const [createCategory, createState] = useCreateLedgerCategoryMutation();
  const [updateCategory, updateState] = useUpdateLedgerCategoryMutation();
  const [deleteCategory, deleteState] = useDeleteLedgerCategoryMutation();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'add' | 'sub'>('sub');
  const [file, setFile] = useState<File>();
  const creatingRef = useRef(false);

  return (
    <main className="min-h-0 flex-grow overflow-auto">
      <section className="mt-2 bg-white px-4 py-3">
        <Input onChange={setNewName} placeholder={t('categories.name')} value={newName} />
        <div className="mt-2 flex items-center gap-2">
          <select className="min-h-[38px] border border-solid border-[#EBEBEB] bg-white" onChange={event => setNewType(event.target.value as 'add' | 'sub')} value={newType}>
            <option value="sub">{t('records.type.sub')}</option>
            <option value="add">{t('records.type.add')}</option>
          </select>
          <input accept="image/*" onChange={event => setFile(event.target.files?.[0])} type="file" />
          <Button
            disabled={!newName.trim() || !file}
            loading={createState.isLoading}
            onClick={async () => {
              if (creatingRef.current || !file)
                return;
              creatingRef.current = true;
              try {
                await createCategory({ data: { file, name: newName.trim(), type: newType }, ledgerId });
                setNewName('');
                setFile(undefined);
              }
              finally {
                creatingRef.current = false;
              }
            }}
            size="small"
          >
            {t('categories.create')}
          </Button>
        </div>
      </section>
      {query.data.map(category => (
        <div className="mt-2 flex items-center gap-2 bg-white px-4 py-3" key={category.id}>
          <Input aria-label={t('categories.name')} defaultValue={category.name} id={`ledger-category-${category.id}`} />
          <Button
            data-testid={`ledger-category-save-${category.id}`}
            disabled={updateState.isLoading}
            onClick={async () => {
              const name = (document.getElementById(`ledger-category-${category.id}`) as HTMLInputElement | null)?.value ?? category.name;
              try {
                await updateCategory({ categoryId: category.id, data: { name: name.trim() }, ledgerId });
              }
              catch {
                await query.refetch();
                Toast.show({ icon: 'fail', content: t('categories.saveFailed') });
              }
            }}
            size="small"
          >
            {t('common.save')}
          </Button>
          <Button color="danger" disabled={deleteState.isLoading} onClick={async () => { await deleteCategory({ categoryId: category.id, ledgerId }); }} size="small">{t('categories.delete')}</Button>
        </div>
      ))}
    </main>
  );
}

export default function LedgerCategoriesPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar onBack={() => navigate(-1)}>{t('categories.title')}</NavBar>
      <LedgerScopeBoundary capability={LedgerCapability.CATEGORY_MANAGE}>
        {({ ledgerId }) => <CategoriesContent ledgerId={ledgerId} />}
      </LedgerScopeBoundary>
    </div>
  );
}

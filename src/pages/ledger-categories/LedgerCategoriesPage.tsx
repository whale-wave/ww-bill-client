import { Button, Input, Toast } from 'antd-mobile';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateLedgerCategoryMutation, useDeleteLedgerCategoryMutation, useLedgerCategoriesQuery, useUpdateLedgerCategoryMutation } from '@/entities/category';
import { LedgerCapability } from '@/entities/ledger';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, PageHeader } from '@/shared/ui';

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
    <main className="min-h-0 flex-grow overflow-auto px-[18px] pb-6 pt-2">
      <div className="mx-auto w-full max-w-[520px] space-y-3">
        <GradientPanel className="px-4 py-4" elevation="standard" surface="ice">
          <div className="rounded-[15px] border border-solid border-border-primary bg-white/80 px-3 py-1"><Input onChange={setNewName} placeholder={t('categories.name')} value={newName} /></div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select className="h-11 rounded-[14px] border border-solid border-border-primary bg-white/80 px-3 text-[12px] font-bold text-ww-ink" onChange={event => setNewType(event.target.value as 'add' | 'sub')} value={newType}>
              <option value="sub">{t('records.type.sub')}</option>
              <option value="add">{t('records.type.add')}</option>
            </select>
            <label className="flex h-11 cursor-pointer items-center justify-center rounded-[14px] border border-dashed border-primary bg-white/70 px-3 text-center text-[11px] font-bold text-primary-deep">
              <span className="truncate">{file?.name ?? t('categories.chooseIcon')}</span>
              <input accept="image/*" className="sr-only" onChange={event => setFile(event.target.files?.[0])} type="file" />
            </label>
          </div>
          <Button
            block
            className="mt-3 !h-11 !rounded-[14px] !border-0 !bg-primary !text-[13px] !font-extrabold !text-white"
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
          >
            {t('categories.create')}
          </Button>
        </GradientPanel>
        {query.data.map(category => (
          <GradientPanel className="flex items-center gap-2 px-3 py-3" elevation="low" key={category.id} surface="glass">
            <div className="min-w-0 flex-1 rounded-[13px] border border-solid border-border-primary bg-white/70 px-2"><Input aria-label={t('categories.name')} defaultValue={category.name} id={`ledger-category-${category.id}`} /></div>
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
              className="!rounded-[12px] !border-primary-light !text-primary-deep"
              size="mini"
            >
              {t('common.save')}
            </Button>
            <Button className="!rounded-[12px]" color="danger" disabled={deleteState.isLoading} onClick={async () => { await deleteCategory({ categoryId: category.id, ledgerId }); }} size="mini">{t('categories.delete')}</Button>
          </GradientPanel>
        ))}
      </div>
    </main>
  );
}

export default function LedgerCategoriesPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('categories.title')} />
      <LedgerScopeBoundary capability={LedgerCapability.CATEGORY_MANAGE}>
        {({ ledgerId }) => <CategoriesContent ledgerId={ledgerId} />}
      </LedgerScopeBoundary>
    </div>
  );
}

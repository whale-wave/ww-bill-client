import { Toast } from 'antd-mobile';
import { ChevronDown, PencilLine, Plus, Tag, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CategoryIcon, useLedgerCategoriesQuery } from '@/entities/category';
import { LedgerCapability } from '@/entities/ledger';
import { useArchiveLedgerTagMutation, useCreateLedgerTagMutation, useLedgerTagsQuery, useUpdateLedgerTagMutation } from '@/entities/ledger-data';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { omitRecordEditorSettingsNavigationState, readRecordEditorSettingsNavigationState } from '@/features/record-editor';
import { useTranslation } from '@/shared/i18n';
import { confirmDangerousAction, GradientPanel, IllustratedEmptyState, PageHeader } from '@/shared/ui';

function TagsContent({ initialCategoryId, ledgerId }: { initialCategoryId?: number; ledgerId: string }) {
  const { t } = useTranslation('ledger');
  const categoriesQuery = useLedgerCategoriesQuery({ params: { ledgerId } });
  const [categoryId, setCategoryId] = useState<number | undefined>(initialCategoryId);
  const selectedCategory = categoriesQuery.data.find(category => category.id === categoryId);
  const effectiveCategoryId = selectedCategory?.id ?? categoriesQuery.data[0]?.id;
  const effectiveCategory = categoriesQuery.data.find(category => category.id === effectiveCategoryId);
  const query = useLedgerTagsQuery({ params: { ledgerId, categoryId: effectiveCategoryId }, queryOptions: { enabled: Boolean(ledgerId && effectiveCategoryId) } });
  const [createTag, createState] = useCreateLedgerTagMutation();
  const [updateTag, updateState] = useUpdateLedgerTagMutation();
  const [archiveTag, archiveState] = useArchiveLedgerTagMutation();
  const [newName, setNewName] = useState('');
  const creatingRef = useRef(false);

  return (
    <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto w-full max-w-[520px]">
        <GradientPanel className="px-4 py-4" elevation="standard" surface="ice">
          <p className="mb-2 text-[12px] font-bold text-ww-mid">{t('tags.category')}</p>
          <label className="relative mb-4 flex h-12 items-center gap-3 rounded-[16px] border border-solid border-border-primary bg-white/80 px-3 shadow-ww-xs">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-primary-light/50 text-primary-deep">
              {effectiveCategory && <CategoryIcon categoryName={effectiveCategory.name} iconKey={effectiveCategory.icon} size={18} />}
            </span>
            <select aria-label={t('tags.category')} className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent pr-6 text-[14px] font-extrabold text-ww-ink outline-none" onChange={event => setCategoryId(Number(event.target.value))} value={effectiveCategoryId}>
              {categoriesQuery.data.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 text-primary-deep" size={16} strokeWidth={2.2} />
          </label>
          <p className="mb-2 text-[12px] font-bold text-ww-mid">{t('tags.create')}</p>
          <div className="flex gap-2">
            <input
              className="h-12 min-w-0 flex-1 rounded-[16px] border border-solid border-border-primary bg-white/85 px-3 text-[14px] font-semibold text-ww-ink outline-none shadow-ww-xs transition placeholder:text-ww-soft focus:border-primary-mid"
              data-testid="ledger-tag-create-input"
              onChange={event => setNewName(event.target.value)}
              placeholder={t('tags.name')}
              value={newName}
            />
            <button
              className="flex h-12 shrink-0 items-center gap-1.5 rounded-[16px] border-0 bg-primary px-4 text-[13px] font-extrabold text-white shadow-ww-xs disabled:opacity-45"
              data-testid="ledger-tag-create"
              disabled={!newName.trim() || createState.isLoading}
              onClick={async () => {
                if (creatingRef.current)
                  return;
                creatingRef.current = true;
                try {
                  if (!effectiveCategoryId)
                    return;
                  await createTag({ data: { categoryId: effectiveCategoryId, name: newName.trim() }, ledgerId });
                  setNewName('');
                }
                finally {
                  creatingRef.current = false;
                }
              }}
              type="button"
            >
              <Plus aria-hidden="true" size={15} strokeWidth={2.3} />
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

        {query.data.length > 0 && <p className="mb-2 mt-5 text-[14px] font-extrabold text-ww-ink">{t('tags.title')}</p>}

        {query.data.map(tag => (
          <GradientPanel className="mt-2 flex items-center gap-2 px-3 py-3" elevation="low" key={tag.id} surface="glass">
            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-primary-light/45 text-primary-deep"><Tag size={16} strokeWidth={2} /></span>
            <input
              aria-label={t('tags.name')}
              className="h-10 min-w-0 flex-1 rounded-[13px] border border-solid border-border-primary bg-white/75 px-3 text-[14px] font-semibold text-ww-ink outline-none transition focus:border-primary-mid"
              defaultValue={tag.name}
              id={`ledger-tag-${tag.id}`}
            />
            <button
              aria-label={t('common.save')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-solid border-primary-light bg-white/70 text-primary-deep shadow-ww-xs disabled:opacity-45"
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
              title={t('common.save')}
              type="button"
            >
              <PencilLine aria-hidden="true" size={16} strokeWidth={2} />
            </button>
            <button
              aria-label={t('tags.delete')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-solid border-[#f2c5d5] bg-[#fff1f6]/90 text-[#ad496b] shadow-ww-xs disabled:opacity-45"
              data-testid={`ledger-tag-archive-${tag.id}`}
              disabled={archiveState.isLoading}
              onClick={async () => {
                const confirmed = await confirmDangerousAction({
                  cancelText: t('common:nav.cancel'),
                  confirmText: t('tags.delete'),
                  description: t('tags.deleteDescription', { name: tag.name }),
                  title: t('tags.deleteTitle'),
                });
                if (!confirmed)
                  return;
                try {
                  await archiveTag({ ledgerId, tagId: tag.id, version: tag.version });
                }
                catch {
                  await query.refetch();
                }
              }}
              title={t('tags.delete')}
              type="button"
            >
              <Trash2 aria-hidden="true" size={16} strokeWidth={1.9} />
            </button>
          </GradientPanel>
        ))}
      </div>
    </main>
  );
}

export default function LedgerTagsPage() {
  const { t } = useTranslation('ledger');
  const location = useLocation();
  const navigate = useNavigate();
  const settingsNavigation = readRecordEditorSettingsNavigationState(location.state);
  const handleBack = () => {
    if (!settingsNavigation) {
      navigate(-1);
      return;
    }
    const sourceState = omitRecordEditorSettingsNavigationState(settingsNavigation.returnTo.state) ?? {};
    navigate(`${settingsNavigation.returnTo.pathname}${settingsNavigation.returnTo.search}`, {
      replace: true,
      state: {
        ...sourceState,
        recordEditorSettingsNavigation: { draft: settingsNavigation.draft },
      },
    });
  };
  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={handleBack} title={t('tags.title')} />
      <LedgerScopeBoundary capability={LedgerCapability.TAG_MANAGE}>
        {({ ledgerId }) => <TagsContent initialCategoryId={settingsNavigation?.draft.category?.id} ledgerId={ledgerId} />}
      </LedgerScopeBoundary>
    </div>
  );
}

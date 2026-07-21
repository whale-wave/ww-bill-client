import type { FC, FormEvent } from 'react';
import type { Household, HouseholdBudget } from '@/entities/household';
import { Button, Dialog, ErrorBlock, Toast } from 'antd-mobile';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HouseholdBudgetPeriodType,
  useDeleteHouseholdBudgetMutation,
  useHouseholdBudgetsQuery,
  useUpsertHouseholdBudgetMutation,
} from '@/entities/household';
import {
  formatMonthStart,
  getApiErrorMessage,
  getApiErrorStatus,
  HouseholdPageState,
  HouseholdScopeBoundary,
  toMoney,
} from '@/features/household';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const BudgetProgress: FC<{ percent: number | null }> = ({ percent }) => {
  const normalized = Math.min(1, Math.max(0, percent ?? 0));
  return (
    <div
      className="flex h-[92px] w-[92px] items-center justify-center rounded-full"
      style={{ background: `conic-gradient(var(--adm-color-primary) ${normalized * 360}deg, #EEF0F2 0)` }}
    >
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-lg font-medium text-font-black">
        {Math.round(normalized * 100)}
        %
      </div>
    </div>
  );
};

const BudgetContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const [periodType, setPeriodType] = useState(HouseholdBudgetPeriodType.MONTH);
  const [periodStart, setPeriodStart] = useState(() => formatMonthStart(new Date()));
  const [editingCategory, setEditingCategory] = useState<HouseholdBudget>();
  const query = useHouseholdBudgetsQuery({
    params: { filters: { periodStart, periodType }, householdId: household.id },
    queryOptions: { enabled: true },
  });
  const [upsert, upsertState] = useUpsertHouseholdBudgetMutation();
  const [remove, removeState] = useDeleteHouseholdBudgetMutation();
  const availableCategories = (() => {
    const categories = new Map<string, string>();
    query.data?.availableCategories.forEach(category => (
      categories.set(category.categoryKey, category.categoryName)
    ));
    query.data?.categories.forEach(({ budget }) => {
      if (budget.categoryKey && budget.categoryName)
        categories.set(budget.categoryKey, budget.categoryName);
    });
    return [...categories].map(([key, name]) => ({ key, name }));
  })();

  const handleError = async (error: unknown) => {
    if (getApiErrorStatus(error) === 409) {
      await query.refetch();
      void Toast.show({ content: t('common.conflict'), icon: 'fail' });
      return;
    }
    void Toast.show({ content: getApiErrorMessage(error, t('common.failed')), icon: 'fail' });
  };

  const handleTotal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = String(new FormData(event.currentTarget).get('totalAmount') ?? '').trim();
    if (!(Number(amount) > 0)) {
      void Toast.show({ content: t('budget.invalidAmount') });
      return;
    }
    try {
      await upsert({
        data: {
          amount,
          periodStart,
          periodType,
          ...(query.data?.summary.budget ? { version: query.data.summary.budget.version } : {}),
        },
        householdId: household.id,
      });
      void Toast.show({ content: t('budget.saved'), icon: 'success' });
    }
    catch (error) {
      await handleError(error);
    }
  };

  const handleCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = String(data.get('categoryAmount') ?? '').trim();
    const categoryKey = String(data.get('categoryKey') ?? '').trim();
    const categoryNameSnapshot = String(data.get('categoryName') ?? '').trim();
    if (!(Number(amount) > 0) || !categoryKey || !categoryNameSnapshot) {
      void Toast.show({ content: t('budget.invalidAmount') });
      return;
    }
    try {
      await upsert({
        data: {
          amount,
          categoryKey,
          categoryNameSnapshot,
          periodStart,
          periodType,
          ...(editingCategory ? { version: editingCategory.version } : {}),
        },
        householdId: household.id,
      });
      setEditingCategory(undefined);
      event.currentTarget.reset();
      void Toast.show({ content: t('budget.saved'), icon: 'success' });
    }
    catch (error) {
      await handleError(error);
    }
  };

  const handleDelete = async (budget: HouseholdBudget) => {
    if (!await Dialog.confirm({ content: t('budget.confirmDelete') }))
      return;
    try {
      await remove({ budgetId: budget.id, householdId: household.id, version: budget.version });
      void Toast.show({ content: t('budget.deleted'), icon: 'success' });
    }
    catch (error) {
      await handleError(error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-white p-1">
        {[HouseholdBudgetPeriodType.MONTH, HouseholdBudgetPeriodType.YEAR].map(type => (
          <button
            className={`h-10 rounded-lg border-0 text-sm ${periodType === type ? 'bg-primary text-font-black' : 'bg-white text-font-gray'}`}
            data-period-type={type}
            key={type}
            onClick={() => {
              setPeriodType(type);
              if (type === HouseholdBudgetPeriodType.YEAR)
                setPeriodStart(`${periodStart.slice(0, 4)}-01-01`);
            }}
            type="button"
          >
            {type === HouseholdBudgetPeriodType.MONTH ? t('budget.month') : t('budget.year')}
          </button>
        ))}
      </div>
      <input
        aria-label="budget-period"
        className="h-11 w-full rounded-xl border-0 bg-white px-3 text-center text-sm text-font-black"
        onChange={(event) => {
          const year = event.target.value.slice(0, 4);
          setPeriodStart(periodType === HouseholdBudgetPeriodType.YEAR
            ? `${year}-01-01`
            : `${event.target.value}-01`);
        }}
        type="month"
        value={periodStart.slice(0, 7)}
      />
      <HouseholdPageState
        errorDescription={t('common.loadErrorDescription')}
        errorTitle={t('common.loadError')}
        isError={query.isError}
        isLoading={query.isLoading}
        loadingLabel={t('common.loading')}
        onRetry={() => void query.refetch()}
        retryLabel={t('common.retry')}
      >
        {query.data
          ? (
              <div className="space-y-3">
                <section className="card-rounded bg-white px-4 py-4">
                  <div className="flex items-center gap-5">
                    <BudgetProgress percent={query.data.summary.remainingPercent} />
                    <div className="min-w-0 flex-grow space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-font-gray">{t('budget.remaining')}</span>
                        <strong>{toMoney(query.data.summary.remaining)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-font-gray">{t('budget.total')}</span>
                        <span>{toMoney(query.data.summary.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-font-gray">{t('budget.spent')}</span>
                        <span>{toMoney(query.data.summary.spent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-font-gray">{t('budget.remainingDaily')}</span>
                        <span>{toMoney(query.data.summary.remainingDaily)}</span>
                      </div>
                    </div>
                  </div>
                  <form className="mt-5 flex gap-2" data-testid="household-total-budget-form" onSubmit={handleTotal}>
                    <input
                      className="h-11 min-w-0 flex-grow rounded-xl border-0 bg-bg-gray px-3 text-sm outline-none"
                      defaultValue={query.data.summary.budget?.amount ?? ''}
                      key={`${query.data.summary.budget?.id ?? 'new'}-${query.data.summary.budget?.version ?? 0}`}
                      name="totalAmount"
                      placeholder={t('budget.amountPlaceholder')}
                      type="number"
                    />
                    <Button color="primary" loading={upsertState.isLoading} type="submit">{t('budget.saveTotal')}</Button>
                  </form>
                </section>

                <section className="card-rounded bg-white px-4 py-4">
                  <h2 className="text-base font-medium text-font-black">{t('budget.categories')}</h2>
                  {query.data.categories.length === 0
                    ? <ErrorBlock status="empty" title={t('budget.emptyCategories')} />
                    : (
                        <div className="mt-3">
                          {query.data.categories.map(category => (
                            <div className="flex items-center border-0 border-t border-solid border-[#EBEBEB] py-3" data-budget-id={category.budget.id} key={category.budget.id}>
                              <span className="min-w-0 flex-grow">
                                <strong className="block text-sm text-font-black">{category.budget.categoryName}</strong>
                                <span className="mt-1 block text-xs text-font-gray">
                                  {t('budget.remaining')}
                                  {' '}
                                  {toMoney(category.remaining)}
                                  {' '}
                                  ·
                                  {' '}
                                  {t('budget.spent')}
                                  {' '}
                                  {toMoney(category.spent)}
                                </span>
                              </span>
                              <Button fill="none" onClick={() => setEditingCategory(category.budget)} size="mini">{t('budget.edit')}</Button>
                              <Button color="danger" fill="none" loading={removeState.isLoading} onClick={() => void handleDelete(category.budget)} size="mini">{t('budget.delete')}</Button>
                            </div>
                          ))}
                        </div>
                      )}
                  <form className="mt-4 grid grid-cols-2 gap-2" key={editingCategory?.id ?? 'new'} onSubmit={handleCategory}>
                    <select
                      className="h-11 rounded-xl border-0 bg-bg-gray px-3 text-sm outline-none"
                      defaultValue={editingCategory?.categoryKey ?? ''}
                      name="categoryKey"
                      onChange={(event) => {
                        const nameInput = event.currentTarget.form?.elements.namedItem('categoryName');
                        if (nameInput instanceof HTMLInputElement) {
                          nameInput.value = availableCategories.find(category => (
                            category.key === event.currentTarget.value
                          ))?.name ?? '';
                        }
                      }}
                    >
                      <option value="">{t('budget.chooseCategory')}</option>
                      {availableCategories.map(category => (
                        <option key={category.key} value={category.key}>{category.name}</option>
                      ))}
                    </select>
                    <input defaultValue={editingCategory?.categoryName ?? ''} name="categoryName" type="hidden" />
                    <input className="h-11 rounded-xl border-0 bg-bg-gray px-3 text-sm outline-none" defaultValue={editingCategory?.amount ?? ''} name="categoryAmount" placeholder={t('budget.amountPlaceholder')} type="number" />
                    <Button color="primary" disabled={availableCategories.length === 0} loading={upsertState.isLoading} type="submit">{editingCategory ? t('budget.saveCategory') : t('budget.addCategory')}</Button>
                  </form>
                  {availableCategories.length === 0 && (
                    <p className="mt-2 text-xs text-font-gray">{t('budget.noAvailableCategories')}</p>
                  )}
                </section>
              </div>
            )
          : null}
      </HouseholdPageState>
    </div>
  );
};

const HouseholdBudgetsPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>{t('budget.title')}</NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <HouseholdScopeBoundary householdId={householdId}>
          {household => <BudgetContent household={household} />}
        </HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdBudgetsPage;

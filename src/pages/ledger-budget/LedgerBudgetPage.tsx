import type { Ledger } from '@/entities/ledger';
import { Button, ErrorBlock, Input, ProgressBar, SpinLoading, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { BudgetEntityType, useCreateLedgerBudgetSummaryMutation, useLedgerBudgetInfoQuery } from '@/entities/budget';
import { LedgerCapability } from '@/entities/ledger';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { LedgerSwitcherHeader } from '@/features/ledger-switcher';
import { useTranslation } from '@/shared/i18n';

function BudgetContent({ ledgerId, canManage }: { ledgerId: string; canManage: boolean }) {
  const { t } = useTranslation('ledger');
  const periodStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const filters = { periodStart, type: BudgetEntityType.MONTH };
  const query = useLedgerBudgetInfoQuery({ params: { filters, ledgerId } });
  const [amount, setAmount] = useState('');
  const [saveBudget, saveState] = useCreateLedgerBudgetSummaryMutation();
  const savingRef = useRef(false);
  if (query.isLoading)
    return <SpinLoading />;
  if (query.isError)
    return <ErrorBlock />;
  const summary = query.data.summaryBudget;
  return (
    <>
      <section className="bg-primary px-4 py-4">
        <p className="text-sm">{t('budget.remaining')}</p>
        <strong className="text-3xl">{summary?.remaining ?? 0}</strong>
        {summary && <ProgressBar percent={Math.min(100, Number(summary.remainingPercentage) || 0)} />}
      </section>
      {canManage && (
        <section className="mt-3 flex gap-2 bg-white px-4 py-3">
          <Input inputMode="decimal" onChange={setAmount} placeholder={t('budget.amount')} value={amount} />
          <Button
            loading={saveState.isLoading}
            onClick={async () => {
              if (savingRef.current || !amount)
                return;
              savingRef.current = true;
              try {
                await saveBudget({ data: { amount, ...filters }, ledgerId });
                setAmount('');
              }
              catch {
                Toast.show({ icon: 'fail', content: t('budget.saveFailed') });
              }
              finally {
                savingRef.current = false;
              }
            }}
          >
            {t('common.save')}
          </Button>
        </section>
      )}
      <section className="mt-3 bg-white">
        {query.data.categoryBudgets?.map(item => (
          <div className="flex min-h-[59px] items-center justify-between border-0 border-b border-solid border-[#EBEBEB] px-4" key={item.id}>
            <span>{item.category?.name}</span>
            <span>
              {item.amount}
              {' '}
              /
              {' '}
              {item.budgetAmount}
            </span>
          </div>
        ))}
      </section>
    </>
  );
}

function LedgerBudgetWorkspace({ ledger, ledgerId }: { ledger: Ledger; ledgerId: string }) {
  const { t } = useTranslation('ledger');
  return (
    <>
      <LedgerSwitcherHeader titleContent={<span>{t('budget.title')}</span>} />
      <main className="min-h-0 flex-grow overflow-auto">
        <BudgetContent
          canManage={ledger.capabilities.includes(LedgerCapability.BUDGET_MANAGE)}
          ledgerId={ledgerId}
        />
      </main>
    </>
  );
}

export default function LedgerBudgetPage() {
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <LedgerScopeBoundary capability={LedgerCapability.BUDGET_READ}>
        {scope => <LedgerBudgetWorkspace {...scope} />}
      </LedgerScopeBoundary>
    </div>
  );
}

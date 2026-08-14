import { useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { CategoryManagement } from '@/features/category-management';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { useTranslation } from '@/shared/i18n';
import { PageHeader } from '@/shared/ui';

export default function LedgerCategoriesPage() {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  return (
    <div className="page-new relative flex overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-24 h-64 w-64 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('categories.title')} />
      <LedgerScopeBoundary capability={LedgerCapability.CATEGORY_READ}>
        {({ ledger, ledgerId }) => (
          <CategoryManagement
            canManage={ledger.capabilities.includes(LedgerCapability.CATEGORY_MANAGE)}
            ledgerId={ledgerId}
          />
        )}
      </LedgerScopeBoundary>
    </div>
  );
}

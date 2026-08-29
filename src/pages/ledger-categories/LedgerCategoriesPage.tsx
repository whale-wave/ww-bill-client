import { useLocation, useNavigate } from 'react-router-dom';
import { LedgerCapability } from '@/entities/ledger';
import { CategoryManagement } from '@/features/category-management';
import { LedgerScopeBoundary } from '@/features/ledger-scope';
import { omitRecordEditorSettingsNavigationState, readRecordEditorSettingsNavigationState } from '@/features/record-editor';
import { useTranslation } from '@/shared/i18n';
import { PageHeader } from '@/shared/ui';

export default function LedgerCategoriesPage() {
  const { t } = useTranslation('ledger');
  const location = useLocation();
  const navigate = useNavigate();
  const editorNavigation = readRecordEditorSettingsNavigationState(location.state);
  const handleBack = () => {
    if (!editorNavigation) {
      navigate(-1);
      return;
    }
    const sourceState = omitRecordEditorSettingsNavigationState(editorNavigation.returnTo.state) ?? {};
    navigate(`${editorNavigation.returnTo.pathname}${editorNavigation.returnTo.search}`, {
      replace: true,
      state: {
        ...sourceState,
        recordEditorSettingsNavigation: { draft: editorNavigation.draft },
      },
    });
  };
  return (
    <div className="page-new relative flex overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-24 h-64 w-64 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={handleBack} title={t('categories.title')} />
      <LedgerScopeBoundary capability={LedgerCapability.CATEGORY_READ}>
        {({ ledger, ledgerId }) => (
          <CategoryManagement
            canManage={ledger.capabilities.includes(LedgerCapability.CATEGORY_MANAGE)}
            initialType={editorNavigation?.draft.recordType}
            ledgerId={ledgerId}
          />
        )}
      </LedgerScopeBoundary>
    </div>
  );
}

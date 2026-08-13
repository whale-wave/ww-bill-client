import type { ReactNode } from 'react';
import { useTranslation } from '@/shared/i18n';
import { PageHeader } from '@/shared/ui/page-header';

interface WorkspaceNavHeaderProps {
  backLabel?: string;
  children?: ReactNode;
  onBack: () => void;
  title: ReactNode;
}

export function WorkspaceNavHeader({
  backLabel,
  children,
  onBack,
  title,
}: WorkspaceNavHeaderProps) {
  const { t } = useTranslation('common');
  return (
    <header className="relative z-20 shrink-0" data-workspace-nav-header>
      <PageHeader backLabel={backLabel ?? t('nav.back')} onBack={onBack} title={title} />
      {children}
    </header>
  );
}

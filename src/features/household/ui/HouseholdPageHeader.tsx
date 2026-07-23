import type { FC, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import './household-shell.scss';

interface HouseholdPageHeaderProps {
  backLabel: string;
  children?: ReactNode;
  onBack: () => void;
  title: string;
  tone?: 'plain' | 'primary';
}

export const HouseholdPageHeader: FC<HouseholdPageHeaderProps> = ({
  backLabel,
  children,
  onBack,
  title,
  tone = 'plain',
}) => (
  <header className={`household-page-header household-page-header--${tone}`}>
    <button
      aria-label={backLabel}
      className="household-page-header__back"
      onClick={onBack}
      type="button"
    >
      <ArrowLeft aria-hidden="true" size={19} strokeWidth={2.2} />
      <span>{backLabel}</span>
    </button>
    <h1>{title}</h1>
    <div className="household-page-header__action">{children}</div>
  </header>
);

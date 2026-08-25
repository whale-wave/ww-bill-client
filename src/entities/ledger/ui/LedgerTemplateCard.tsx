import type { FC } from 'react';
import type { LedgerTemplate } from '../types';
import { ArrowRight } from 'lucide-react';
import { LedgerTemplateIcon } from './LedgerTemplateIcon';

interface LedgerTemplateCardProps {
  description: string;
  name: string;
  template: LedgerTemplate;
  themeLabel: string;
  onClick: () => void;
}

export const LedgerTemplateCard: FC<LedgerTemplateCardProps> = ({
  description,
  name,
  onClick,
  template,
  themeLabel,
}) => {
  return (
    <button
      className="group relative flex min-h-[118px] w-full items-center overflow-hidden rounded-[22px] border border-solid border-border-primary bg-white/80 p-4 text-left shadow-ww-xs backdrop-blur-xl transition active:scale-[0.985]"
      data-template-key={template.key}
      onClick={onClick}
      type="button"
    >
      <span aria-hidden="true" className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-light/35" />
      <span className="relative mr-3 flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[17px] bg-[linear-gradient(145deg,#c8eaf6,#e9e1ff)] text-[22px] text-primary-deep shadow-ww-xs">
        <LedgerTemplateIcon templateKey={template.key} />
      </span>
      <span className="relative min-w-0 flex-grow">
        <span className="block text-[15px] font-extrabold leading-6 text-ww-ink">{name}</span>
        <span className="mt-0.5 line-clamp-2 block text-[12px] leading-[18px] text-ww-mid">{description}</span>
        <span className="mt-2 inline-flex rounded-full bg-primary-light/50 px-2 py-1 text-[10px] font-bold text-primary-deep">{themeLabel}</span>
      </span>
      <ArrowRight className="relative ml-2 flex-shrink-0 text-ww-soft" size={16} />
    </button>
  );
};

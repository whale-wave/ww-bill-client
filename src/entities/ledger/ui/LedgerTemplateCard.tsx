import type { FC } from 'react';
import type { LedgerTemplate } from '../types';
import { RightOutline } from 'antd-mobile-icons';
import { LedgerVisualIcon } from './LedgerVisualIcon';

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
      className="card-rounded flex w-full items-center border border-solid border-[#EBEBEB] bg-white p-3 text-left active:bg-slate-50"
      data-template-key={template.key}
      onClick={onClick}
      type="button"
    >
      <span className="mr-3 flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl text-font-black">
        <LedgerVisualIcon templateKey={template.key} />
      </span>
      <span className="min-w-0 flex-grow">
        <span className="block text-base font-medium text-font-black">{name}</span>
        <span className="mt-1 block text-xs leading-5 text-font-gray">{description}</span>
        <span className="mt-1 block text-xs text-font-gray">{themeLabel}</span>
      </span>
      <RightOutline className="ml-2 flex-shrink-0 text-font-gray" />
    </button>
  );
};

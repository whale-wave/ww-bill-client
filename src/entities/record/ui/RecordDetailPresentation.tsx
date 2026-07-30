import type { FC, ReactNode } from 'react';
import { Fragment } from 'react';
import { FixedPin, Icon, NavBar } from '@/shared/ui';

export interface RecordDetailRow {
  label: string;
  onClick?: () => void;
  testId?: string;
  value: string;
}

export interface RecordDetailAction {
  disabled?: boolean;
  label: string;
  onClick: () => void;
  testId?: string;
}

export interface RecordDetailPresentationProps {
  backLabel: string;
  category: {
    icon: string;
    name: string;
  };
  footerActions?: readonly RecordDetailAction[];
  onBack: () => void;
  pinnedAction?: RecordDetailAction;
  rows: readonly RecordDetailRow[];
  showNavigation?: boolean;
  supplementaryContent?: ReactNode;
  supplementaryRows?: readonly RecordDetailRow[];
}

export const RecordDetailPresentation: FC<RecordDetailPresentationProps> = ({
  backLabel,
  category,
  footerActions = [],
  onBack,
  pinnedAction,
  rows,
  showNavigation = true,
  supplementaryContent,
  supplementaryRows = [],
}) => {
  const detailRows = [...rows, ...supplementaryRows];

  return (
    <div className="page" data-record-detail-presentation>
      {showNavigation && <NavBar back={backLabel} backArrow={false} onBack={onBack} />}
      <div className="relative h-[96px] w-full shrink-0 bg-primary" data-record-detail-header>
        <div
          className="absolute left-1/2 top-[8px] z-10 -translate-x-1/2 text-center"
          data-record-detail-category
        >
          <div className="mx-auto flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white" data-category-icon={category.icon}>
            <Icon className="text-[36px]" name={category.icon} />
          </div>
          <span className="mt-[9px] block text-base text-[#333233]">{category.name}</span>
        </div>
      </div>
      <div className="flex flex-col">
        {detailRows.map(item => (
          item.onClick
            ? (
                <button
                  className="flex w-full items-center border-0 border-b border-solid border-[#ebebeb] bg-white px-[15px] py-[20px] text-left text-base font-normal text-[#aeaeae]"
                  data-record-detail-row
                  data-testid={item.testId}
                  key={item.label}
                  onClick={item.onClick}
                  type="button"
                >
                  <span className="flex-shrink-0">{item.label}</span>
                  <span className="ml-[12px] text-base font-normal text-[#605f60]">
                    {item.value}
                  </span>
                </button>
              )
            : (
                <div
                  className="flex w-full items-center border-0 border-b border-solid border-[#ebebeb] px-[15px] py-[20px] text-base font-normal text-[#aeaeae]"
                  data-record-detail-row
                  data-testid={item.testId}
                  key={item.label}
                >
                  <span className="flex-shrink-0">{item.label}</span>
                  <span className="ml-[12px] text-base font-normal text-[#605f60]">
                    {item.value}
                  </span>
                </div>
              )
        ))}
        {supplementaryContent}
        {pinnedAction && (
          <FixedPin onClick={pinnedAction.onClick}>{pinnedAction.label}</FixedPin>
        )}
      </div>
      {footerActions.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full" data-record-detail-footer>
          <div className="flex h-[50px] items-center border-0 border-t border-solid border-[#c8c8c8] bg-white">
            {footerActions.map((action, index) => (
              <Fragment key={action.label}>
                <button
                  className="flex w-[33px] flex-1 items-center justify-center border-0 bg-transparent text-base font-normal text-[#333233]"
                  data-testid={action.testId}
                  disabled={action.disabled}
                  type="button"
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
                {index < footerActions.length - 1 && <span className="h-5 w-px bg-[#c8c8c8]" />}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

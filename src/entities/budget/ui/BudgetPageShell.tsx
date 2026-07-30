import type { FC, ReactNode, RefObject } from 'react';

interface BudgetPageShellProps {
  children: ReactNode;
  header: ReactNode;
  wrapperRef: RefObject<HTMLDivElement>;
}

export const BudgetPageShell: FC<BudgetPageShellProps> = ({
  children,
  header,
  wrapperRef,
}) => (
  <div
    ref={wrapperRef}
    className="page-new fixed left-0 top-0 h-screen w-full bg-[#f6f6f6] [&_.adm-dropdown-item-highlight]:text-black333 [&_.adm-dropdown-item-title-arrow]:translate-y-0 [&_.adm-dropdown-item-title-arrow]:rotate-0 [&_.adm-dropdown-item-title-arrow]:[font-size:unset] [&_.adm-dropdown-item-title-text]:text-lg [&_.adm-dropdown]:bg-transparent [&_.adm-list-item-content-main]:text-start [&_.adm-popup.adm-dropdown-popup]:!top-[45px]"
    data-budget-page-shell
  >
    {header}
    <div className="flex min-h-0 flex-grow flex-col overflow-auto">
      {children}
    </div>
  </div>
);

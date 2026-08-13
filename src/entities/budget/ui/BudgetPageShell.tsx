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
    className="page-new fixed inset-0 h-screen min-h-0 w-full overflow-hidden h-[100dvh]"
    data-budget-page-shell
  >
    <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/30 blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-20 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
    {header}
    <div className="relative z-[1] flex min-h-0 flex-grow flex-col overflow-hidden">
      {children}
    </div>
  </div>
);

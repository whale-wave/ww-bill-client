import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface WorkspaceNavHeaderProps {
  children?: ReactNode;
  onBack: () => void;
  title: ReactNode;
}

export function WorkspaceNavHeader({
  children,
  onBack,
  title,
}: WorkspaceNavHeaderProps) {
  return (
    <header className="relative z-20 shrink-0 bg-primary" data-workspace-nav-header>
      <div className="relative flex h-[52px] items-center justify-center px-24">
        <button
          aria-label="返回"
          className="absolute left-2 top-1/2 flex h-10 -translate-y-1/2 items-center border-0 bg-transparent px-1 text-base text-font-black"
          onClick={onBack}
          type="button"
        >
          <ChevronLeft size={24} />
          <span>返回</span>
        </button>
        <h1 className="max-w-full truncate text-lg font-medium text-font-black">{title}</h1>
      </div>
      {children}
    </header>
  );
}

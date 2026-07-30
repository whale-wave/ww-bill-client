import type { WorkspaceScope } from '../model/workspace-scope';
import { Circle, Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib';
import {
  getWorkspaceHomePath,
  getWorkspaceScope,
  isWorkspaceHomePath,
} from '../model/workspace-scope';
import { WorkspaceSwitcherPanel } from './WorkspaceSwitcherPanel';

interface WorkspaceCapsuleProps {
  className?: string;
  scope?: WorkspaceScope;
}

export function WorkspaceCapsule({ className, scope }: WorkspaceCapsuleProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false);
  const currentScope = scope ?? getWorkspaceScope(location.pathname);

  const handleHome = () => {
    if (isWorkspaceHomePath(location.pathname, currentScope))
      return;
    navigate(getWorkspaceHomePath(currentScope), { replace: true });
  };

  return (
    <>
      <div
        aria-label="账本快捷操作"
        className={cn(
          'flex h-8 w-[84px] items-center rounded-full border border-solid border-white/60 bg-white/55 text-font-black',
          className,
        )}
        data-workspace-capsule
        role="group"
      >
        <button
          aria-label="切换账本"
          className="flex h-full min-w-0 flex-1 items-center justify-center border-0 bg-transparent"
          onClick={() => setIsSwitcherVisible(true)}
          type="button"
        >
          <Ellipsis size={22} strokeWidth={2.4} />
        </button>
        <span aria-hidden="true" className="h-4 w-px bg-black/15" />
        <button
          aria-label="返回账本首页"
          className="flex h-full min-w-0 flex-1 items-center justify-center border-0 bg-transparent disabled:opacity-45"
          disabled={isWorkspaceHomePath(location.pathname, currentScope)}
          onClick={handleHome}
          type="button"
        >
          <Circle size={18} strokeWidth={2.4} />
        </button>
      </div>
      {isSwitcherVisible && (
        <WorkspaceSwitcherPanel
          currentScope={currentScope}
          onClose={() => setIsSwitcherVisible(false)}
          visible
        />
      )}
    </>
  );
}

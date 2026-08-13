import type { WorkspaceScope } from '../model/workspace-scope';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { getWorkspaceScope } from '../model/workspace-scope';
import { WorkspaceSwitcherPanel } from './WorkspaceSwitcherPanel';

interface WorkspaceCapsuleProps {
  className?: string;
  scope?: WorkspaceScope;
}

export function WorkspaceCapsule({ className, scope }: WorkspaceCapsuleProps) {
  const { t } = useTranslation('ledger');
  const location = useLocation();
  const navigate = useNavigate();
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false);
  const currentScope = scope ?? getWorkspaceScope(location.pathname);

  const handleReturnPersonal = () => {
    navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true });
  };

  return (
    <>
      <div
        aria-label={t('workspace.quickActions')}
        className={cn(
          'flex h-8 w-[84px] items-center rounded-full border border-solid border-white/60 bg-white/55 text-font-black',
          className,
        )}
        data-workspace-capsule
        role="group"
      >
        <button
          aria-label={t('switcher.switch')}
          className="flex h-full min-w-0 flex-1 items-center justify-center border-0 bg-transparent"
          onClick={() => setIsSwitcherVisible(true)}
          type="button"
        >
          <Ellipsis size={22} strokeWidth={2.4} />
        </button>
        <span aria-hidden="true" className="h-4 w-px bg-black/15" />
        <button
          aria-label={t('switcher.returnPersonal')}
          className="flex h-full min-w-0 flex-1 items-center justify-center border-0 bg-transparent"
          onClick={handleReturnPersonal}
          type="button"
        >
          <span
            aria-hidden="true"
            className="h-[9px] w-[9px] rounded-full bg-current"
            data-workspace-home-icon
          />
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

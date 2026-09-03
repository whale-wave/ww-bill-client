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
  onReturnPersonal?: () => void;
  onSwitch?: () => void;
  returnLabel?: string;
  returnTestId?: string;
  scope?: WorkspaceScope;
  switchLabel?: string;
  switchTestId?: string;
}

export function WorkspaceCapsule({ className, onReturnPersonal, onSwitch, returnLabel, returnTestId, scope, switchLabel, switchTestId }: WorkspaceCapsuleProps) {
  const { t } = useTranslation('ledger');
  const location = useLocation();
  const navigate = useNavigate();
  const [isSwitcherVisible, setIsSwitcherVisible] = useState(false);
  const currentScope = scope ?? getWorkspaceScope(location.pathname);

  const handleReturnPersonal = () => {
    if (onReturnPersonal) {
      onReturnPersonal();
      return;
    }
    navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true });
  };

  const handleSwitch = () => {
    if (onSwitch) {
      onSwitch();
      return;
    }
    setIsSwitcherVisible(true);
  };

  return (
    <>
      <div
        aria-label={t('workspace.quickActions')}
        className={cn(
          'flex h-11 w-[84px] items-center rounded-full border border-solid border-border-primary bg-white/[0.85] text-primary-deep shadow-ww-xs',
          className,
        )}
        data-workspace-capsule
        role="group"
      >
        <button
          aria-label={switchLabel ?? t('switcher.switch')}
          className="flex h-full min-w-0 flex-1 items-center justify-center rounded-full border-0 bg-transparent p-0"
          data-testid={switchTestId}
          onClick={handleSwitch}
          type="button"
        >
          <Ellipsis size={22} strokeWidth={2.4} />
        </button>
        <span aria-hidden="true" className="h-4 w-px shrink-0 bg-black/15" />
        <button
          aria-label={returnLabel ?? t('switcher.returnPersonal')}
          className="flex h-full min-w-0 flex-1 items-center justify-center rounded-full border-0 bg-transparent p-0"
          data-testid={returnTestId}
          onClick={handleReturnPersonal}
          type="button"
        >
          <span
            aria-hidden="true"
            className="flex h-4 w-4 items-center justify-center rounded-full border-[2.5px] border-current"
            data-workspace-home-icon
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          </span>
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

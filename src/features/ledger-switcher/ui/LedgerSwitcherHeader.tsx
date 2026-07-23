import type { ComponentProps, ReactNode } from 'react';
import { ActionSheet, NavBar, SafeArea } from 'antd-mobile';
import { DownFill } from 'antd-mobile-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LedgerCapability, useLedgerNavigationQuery } from '@/entities/ledger';
import { useGetUserAppConfigQuery } from '@/entities/user-app-config';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { getLedgerWorkspaceScope } from '../model/ledger-navigation';
import { toLedgerSwitcherItems } from '../model/ledger-switcher-view-model';
import { LedgerSwitcherPanel } from './LedgerSwitcherPanel';
import { MiniProgramCapsule } from './MiniProgramCapsule';
import './ledger-switcher.scss';

export interface LedgerSwitcherHeaderAction {
  key: string;
  text: ReactNode;
  path?: string;
  onClick?: () => void;
}

export interface LedgerSwitcherHeaderProps {
  ledgerName?: string;
  leadingActions?: LedgerSwitcherHeaderAction[];
  /**
   * Business surfaces such as bills, budgets, and charts keep their own
   * period/metric control in the centre while reusing the workspace capsule.
   */
  titleContent?: ReactNode;
}

type ActionSheetAction = ComponentProps<typeof ActionSheet>['actions'][number];

export function LedgerSwitcherHeader({
  ledgerName,
  leadingActions = [],
  titleContent,
}: LedgerSwitcherHeaderProps) {
  const { t } = useTranslation('ledger');
  const location = useLocation();
  const navigate = useNavigate();
  const ledgerQuery = useLedgerNavigationQuery();
  const appConfigQuery = useGetUserAppConfigQuery();
  const [panelVisible, setPanelVisible] = useState(false);
  const [moreVisible, setMoreVisible] = useState(false);
  const moreOpenerRef = useRef<HTMLButtonElement | null>(null);
  const scope = getLedgerWorkspaceScope(location.pathname);
  const quickSwitchEnabled = appConfigQuery.data?.isLedgerQuickSwitchEnabled === true;
  const items = useMemo(
    () => toLedgerSwitcherItems(ledgerQuery.data),
    [ledgerQuery.data],
  );
  const currentCustom = scope.type === 'custom'
    ? items.find(item => item.type === 'custom' && item.ledgerId === scope.ledgerId)
    : undefined;
  const title = scope.type === 'personal'
    ? t('switcher.personal')
    : currentCustom?.label ?? ledgerName ?? t('switcher.currentCustom');

  useEffect(() => {
    if (!moreVisible)
      return;

    const getActions = () => Array.from(
      document.querySelectorAll<HTMLElement>(
        '.ledger-switcher-more-sheet .adm-action-sheet-button-item',
      ),
    );
    const configureActions = () => {
      const sheet = document.querySelector<HTMLElement>(
        '.ledger-switcher-more-sheet .adm-action-sheet',
      );
      sheet?.setAttribute('role', 'dialog');
      sheet?.setAttribute('aria-modal', 'true');
      const menu = sheet?.querySelector<HTMLElement>('.adm-action-sheet-button-list');
      menu?.setAttribute('role', 'menu');
      menu?.querySelectorAll<HTMLElement>('.adm-action-sheet-button-item')
        .forEach(action => action.setAttribute('role', 'menuitem'));
      sheet?.querySelector<HTMLElement>('.adm-action-sheet-cancel .adm-action-sheet-button-item')
        ?.setAttribute('role', 'button');
      const actions = getActions();
      actions.forEach(action => action.setAttribute('tabindex', '0'));
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement) || !actions.includes(activeElement))
        actions[0]?.focus();
    };
    configureActions();
    const observer = new MutationObserver(configureActions);
    observer.observe(document.body, { childList: true, subtree: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const actions = getActions();
      if (event.key === 'Escape') {
        event.preventDefault();
        setMoreVisible(false);
        return;
      }
      if (!(target instanceof HTMLElement) || !actions.includes(target))
        return;
      const currentIndex = actions.indexOf(target);
      if (event.key === 'Tab') {
        const boundaryIndex = event.shiftKey ? 0 : actions.length - 1;
        if (currentIndex === boundaryIndex) {
          event.preventDefault();
          actions[event.shiftKey ? actions.length - 1 : 0]?.focus();
        }
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        actions[(currentIndex + direction + actions.length) % actions.length]?.focus();
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        target.click();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
      if (moreOpenerRef.current?.isConnected)
        moreOpenerRef.current.focus();
    };
  }, [moreVisible]);

  const closeAndNavigate = useCallback((path: string) => {
    setMoreVisible(false);
    navigate(path);
  }, [navigate]);

  const actions = useMemo<ActionSheetAction[]>(() => {
    const pageActions: ActionSheetAction[] = leadingActions.map(action => ({
      key: action.key,
      onClick: () => {
        setMoreVisible(false);
        action.onClick?.();
        if (action.path)
          navigate(action.path);
      },
      text: action.text,
    }));
    const ordinaryActions: ActionSheetAction[] = [
      ...(quickSwitchEnabled
        ? [{
            key: 'switch-ledger',
            onClick: () => {
              setMoreVisible(false);
              setPanelVisible(true);
            },
            text: t('switcher.switch'),
          }]
        : []),
      {
        key: 'create-ledger',
        onClick: () => closeAndNavigate(ROUTES_PATH.LEDGER_TEMPLATES.getPath()),
        text: t('switcher.create'),
      },
      {
        key: 'manage-ledgers',
        onClick: () => closeAndNavigate(ROUTES_PATH.LEDGERS.getPath()),
        text: t('switcher.manage'),
      },
      {
        key: 'quick-switch-preferences',
        onClick: () => closeAndNavigate(ROUTES_PATH.LEDGER_PREFERENCES.getPath()),
        text: t('switcher.preferences'),
      },
    ];

    if (
      currentCustom?.type === 'custom'
      && currentCustom.capabilities.includes(LedgerCapability.LEDGER_READ)
    ) {
      ordinaryActions.push({
        key: 'current-ledger-settings',
        onClick: () => closeAndNavigate(
          ROUTES_PATH.LEDGER_SETTINGS.getPath(currentCustom.ledgerId),
        ),
        text: t('switcher.currentSettings'),
      });
    }

    return [...pageActions, ...ordinaryActions];
  }, [closeAndNavigate, currentCustom, leadingActions, navigate, quickSwitchEnabled, t]);

  return (
    <>
      <div className="ledger-switcher-header-shell">
        <SafeArea position="top" />
        <NavBar
          back={null}
          backArrow={false}
          className="ledger-switcher-header"
          right={(
            <MiniProgramCapsule
              isPersonal={scope.type === 'personal'}
              moreExpanded={moreVisible}
              onMore={(event) => {
                moreOpenerRef.current = event.currentTarget;
                setPanelVisible(false);
                setMoreVisible(true);
              }}
              onPersonal={() => navigate(ROUTES_PATH.DETAIL.getPath(), { replace: true })}
            />
          )}
        >
          {titleContent
            ? (
                <div
                  className="ledger-switcher-header__business-title"
                  data-testid="ledger-business-title"
                >
                  {titleContent}
                </div>
              )
            : quickSwitchEnabled
              ? (
                  <button
                    aria-expanded={panelVisible}
                    aria-haspopup="dialog"
                    className="ledger-switcher-header__title"
                    data-testid="ledger-switcher-title"
                    onClick={() => setPanelVisible(current => !current)}
                    type="button"
                  >
                    <span>{title}</span>
                    <DownFill aria-hidden="true" />
                  </button>
                )
              : (
                  <span
                    aria-disabled="true"
                    className="ledger-switcher-header__title ledger-switcher-header__title--static"
                    data-testid="ledger-switcher-title"
                  >
                    {title}
                  </span>
                )}
        </NavBar>
      </div>

      <LedgerSwitcherPanel
        onClose={() => setPanelVisible(false)}
        visible={panelVisible}
      />
      <ActionSheet
        aria-label={t('switcher.more')}
        actions={actions}
        cancelText={t('switcher.cancel')}
        closeOnAction
        onClose={() => setMoreVisible(false)}
        popupClassName="ledger-switcher-more-sheet"
        safeArea
        visible={moreVisible}
      />
    </>
  );
}

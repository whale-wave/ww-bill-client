import { Button, ErrorBlock, List, Popup, SafeArea, SpinLoading } from 'antd-mobile';
import { CheckOutline, PayCircleOutline } from 'antd-mobile-icons';
import { useEffect, useId, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLedgerNavigationQuery } from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import {
  getLedgerSurface,
  getLedgerWorkspaceScope,
  resolveLedgerSwitchTarget,
} from '../model/ledger-navigation';
import { toLedgerSwitcherItems } from '../model/ledger-switcher-view-model';

export interface LedgerSwitcherPanelProps {
  onClose: () => void;
  visible: boolean;
}

export function LedgerSwitcherPanel({ onClose, visible }: LedgerSwitcherPanelProps) {
  const { t } = useTranslation('ledger');
  const location = useLocation();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  onCloseRef.current = onClose;
  const ledgerQuery = useLedgerNavigationQuery();
  const scope = getLedgerWorkspaceScope(location.pathname);
  const surface = getLedgerSurface(location.pathname);
  const items = useMemo(
    () => toLedgerSwitcherItems(ledgerQuery.data),
    [ledgerQuery.data],
  );
  const hasCustomLedger = items.some(item => item.type === 'custom');

  useEffect(() => {
    if (!visible)
      return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusDialog = () => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.contains(document.activeElement))
        return;
      const focusTarget = dialog.querySelector<HTMLElement>(
        '[data-ledger-switcher-option], button',
      );
      (focusTarget ?? dialog).focus();
    };
    focusDialog();
    const observer = new MutationObserver(focusDialog);
    if (!dialogRef.current)
      observer.observe(document.body, { childList: true, subtree: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const dialog = dialogRef.current;
        const focusable = Array.from(
          dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]') ?? [],
        );
        if (!focusable.length)
          return;
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
        return;
      }
      if (event.key !== 'Escape')
        return;
      event.preventDefault();
      onCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
      const previousFocus = previousFocusRef.current;
      if (previousFocus?.isConnected)
        previousFocus.focus();
    };
  }, [visible]);

  const handleSelect = (item: (typeof items)[number]) => {
    navigate(resolveLedgerSwitchTarget(item, surface), { replace: true });
    onClose();
  };

  return (
    <Popup
      bodyClassName="ledger-switcher-panel"
      closeOnMaskClick
      destroyOnClose
      maskClassName="ledger-switcher-panel__mask"
      onClose={onClose}
      position="top"
      visible={visible}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="ledger-switcher-panel__dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <h2 className="ledger-switcher-visually-hidden" id={titleId}>
          {t('switcher.switch')}
        </h2>
        <div className="ledger-switcher-panel__content">
          {ledgerQuery.isLoading && (
            <div className="ledger-switcher-panel__state" data-testid="ledger-switcher-loading">
              <SpinLoading color="primary" />
              <span>{t('switcher.loading')}</span>
            </div>
          )}

          {!ledgerQuery.isLoading && ledgerQuery.isError && (
            <div className="ledger-switcher-panel__state">
              <ErrorBlock
                description={t('switcher.loadErrorDescription')}
                status="default"
                title={t('switcher.loadError')}
              />
              <Button color="primary" onClick={() => void ledgerQuery.refetch()} size="small">
                {t('switcher.retry')}
              </Button>
            </div>
          )}

          {!ledgerQuery.isLoading && !ledgerQuery.isError && (
            <>
              <div aria-labelledby={titleId} role="listbox">
                <List className="ledger-switcher-panel__list">
                  {items.map((item) => {
                    const selected = item.type === 'personal'
                      ? scope.type === 'personal'
                      : scope.type === 'custom' && scope.ledgerId === item.ledgerId;
                    const description = item.type === 'personal'
                      ? t('switcher.recordCount', { count: item.recordCount })
                      : item.activeMemberCount > 1
                        ? t('switcher.memberCount', { count: item.activeMemberCount })
                        : undefined;

                    return (
                      <button
                        aria-selected={selected}
                        className="ledger-switcher-panel__option"
                        data-ledger-switcher-option
                        data-ledger-switcher-id={item.type === 'custom' ? item.ledgerId : undefined}
                        data-selected={selected ? 'true' : 'false'}
                        data-testid={item.type === 'personal' ? 'ledger-switch-item-personal' : undefined}
                        key={item.type === 'personal' ? 'personal' : item.ledgerId}
                        onClick={() => handleSelect(item)}
                        role="option"
                        type="button"
                      >
                        <List.Item
                          arrow={false}
                          description={description}
                          extra={selected
                            ? <CheckOutline aria-label={t('switcher.selected')} className="ledger-switcher-panel__check" />
                            : null}
                          prefix={(
                            <span className="ledger-switcher-panel__icon" data-theme={item.type === 'custom' ? item.themeKey : 'personal'}>
                              <PayCircleOutline aria-hidden="true" />
                            </span>
                          )}
                        >
                          {item.type === 'personal' ? t('switcher.personal') : item.label}
                        </List.Item>
                      </button>
                    );
                  })}
                </List>
              </div>
              {!hasCustomLedger && (
                <div className="ledger-switcher-panel__empty">
                  <ErrorBlock
                    description={false}
                    status="empty"
                    title={t('switcher.customEmpty')}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="ledger-switcher-panel__footer">
          <Button
            block
            onClick={() => {
              onClose();
              navigate(ROUTES_PATH.LEDGER_TEMPLATES.getPath());
            }}
          >
            {t('switcher.create')}
          </Button>
          <Button
            block
            onClick={() => {
              onClose();
              navigate(ROUTES_PATH.LEDGERS.getPath());
            }}
          >
            {t('switcher.manage')}
          </Button>
        </div>
        <SafeArea position="bottom" />
      </section>
    </Popup>
  );
}

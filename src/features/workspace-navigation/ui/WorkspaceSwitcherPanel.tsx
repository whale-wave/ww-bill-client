import type { WorkspaceScope } from '../model/workspace-scope';
import { Popup, SafeArea, SpinLoading } from 'antd-mobile';
import { CheckOutline } from 'antd-mobile-icons';
import { Home, Landmark, Plus, Settings2, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HouseholdStatus, useMyHouseholdQuery } from '@/entities/household';
import {
  LedgerCapability,
  LedgerKind,
  LedgerStatus,
  useLedgerNavigationQuery,
} from '@/entities/ledger';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { getWorkspaceHomePath } from '../model/workspace-scope';
import '@/features/ledger-switcher/ui/ledger-switcher.scss';

interface WorkspaceSwitcherPanelProps {
  currentScope: WorkspaceScope;
  onClose: () => void;
  visible: boolean;
}

interface WorkspaceOption {
  description?: string;
  icon: typeof Home;
  key: string;
  label: string;
  path: string;
  scope: WorkspaceScope;
  themeKey?: string;
}

function isSameScope(left: WorkspaceScope, right: WorkspaceScope) {
  if (left.type !== right.type)
    return false;
  if (left.type === 'personal')
    return true;
  if (left.type === 'custom' && right.type === 'custom')
    return left.ledgerId === right.ledgerId;
  return left.type === 'household'
    && right.type === 'household'
    && left.householdId === right.householdId;
}

export function WorkspaceSwitcherPanel({
  currentScope,
  onClose,
  visible,
}: WorkspaceSwitcherPanelProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('ledger');
  const ledgerQuery = useLedgerNavigationQuery({
    queryOptions: { enabled: visible },
  });
  const householdQuery = useMyHouseholdQuery({
    queryOptions: { enabled: visible },
  });
  const { householdLedgerOptions, myLedgerOptions } = useMemo(() => {
    const personal: WorkspaceOption = {
      description: t('switcher.currentPersonal'),
      icon: Home,
      key: 'personal',
      label: t('switcher.personal'),
      path: ROUTES_PATH.DETAIL.getPath(),
      scope: { type: 'personal' },
      themeKey: 'personal',
    };
    const custom = ledgerQuery.data
      .filter(ledger =>
        ledger.kind === LedgerKind.CUSTOM
        && ledger.status !== LedgerStatus.ARCHIVED
        && ledger.capabilities.includes(LedgerCapability.LEDGER_READ))
      .map<WorkspaceOption>(ledger => ({
        description: t('switcher.memberCount', { count: ledger.activeMemberCount }),
        icon: Landmark,
        key: `custom-${ledger.id}`,
        label: ledger.name,
        path: getWorkspaceHomePath({
          capabilities: ledger.capabilities,
          ledgerId: ledger.id,
          type: 'custom',
        }),
        scope: {
          capabilities: ledger.capabilities,
          ledgerId: ledger.id,
          type: 'custom',
        },
        themeKey: ledger.themeKey,
      }));
    const household = householdQuery.data?.status === HouseholdStatus.ACTIVE
      ? [{
          description: t('switcher.householdDescription'),
          icon: Users,
          key: `household-${householdQuery.data.id}`,
          label: t('switcher.householdLedger'),
          path: ROUTES_PATH.HOUSEHOLD_HOME.getPath(householdQuery.data.id),
          scope: {
            householdId: householdQuery.data.id,
            type: 'household' as const,
          },
          themeKey: 'green',
        }]
      : [];
    return {
      householdLedgerOptions: household,
      myLedgerOptions: [personal, ...custom],
    };
  }, [householdQuery.data, ledgerQuery.data, t]);
  const isLoading = ledgerQuery.isLoading || householdQuery.isLoading;
  const hasSourceError = ledgerQuery.isError || householdQuery.isError;

  const handleSelect = (option: WorkspaceOption) => {
    if (!isSameScope(option.scope, currentScope))
      navigate(option.path, { replace: true });
    onClose();
  };

  const handleRetry = () => {
    void Promise.all([ledgerQuery.refetch(), householdQuery.refetch()]);
  };

  const renderOptions = (options: WorkspaceOption[]) => options.map((option) => {
    const OptionIcon = option.icon;
    const isSelected = isSameScope(option.scope, currentScope);
    return (
      <button
        aria-current={isSelected ? 'page' : undefined}
        className="ledger-switcher-panel__option"
        data-workspace-option={option.key}
        data-selected={isSelected ? 'true' : 'false'}
        key={option.key}
        onClick={() => handleSelect(option)}
        type="button"
      >
        <span className="ledger-switcher-panel__option-content">
          <span
            className={cn('ledger-switcher-panel__icon', isSelected && 'ledger-switcher-panel__icon--selected')}
            data-theme={option.themeKey}
          >
            <OptionIcon aria-hidden="true" size={21} strokeWidth={1.8} />
          </span>
          <span className="ledger-switcher-panel__option-copy">
            <strong className="ledger-switcher-panel__option-title">
              {option.label}
              {option.scope.type === 'personal' && <small>{t('switcher.systemBadge')}</small>}
            </strong>
            {option.description && <span className="ledger-switcher-panel__option-description">{option.description}</span>}
          </span>
          {isSelected && (
            <CheckOutline
              aria-label={t('switcher.selected')}
              className="ledger-switcher-panel__check"
            />
          )}
        </span>
      </button>
    );
  });

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
      <section aria-label={t('switcher.switch')} className="ledger-switcher-panel__dialog">
        <div className="ledger-switcher-panel__heading">
          <div>
            <h2>{t('switcher.switch')}</h2>
            <p>{t('switcher.subtitle')}</p>
          </div>
          <span>{myLedgerOptions.length + householdLedgerOptions.length}</span>
        </div>
        <div className="ledger-switcher-panel__content">
          {isLoading && (
            <div className="ledger-switcher-panel__state">
              <SpinLoading color="primary" />
              <span>{t('switcher.loading')}</span>
            </div>
          )}
          {!isLoading && (
            <>
              <section data-workspace-section="my-ledgers">
                <h3 className="ledger-switcher-panel__section-heading">
                  {t('switcher.myLedgers')}
                </h3>
                {renderOptions(myLedgerOptions)}
              </section>
              {householdLedgerOptions.length > 0 && (
                <section className="ledger-switcher-panel__section" data-workspace-section="household-ledger">
                  <h3 className="ledger-switcher-panel__section-heading">
                    {t('switcher.householdLedger')}
                  </h3>
                  {renderOptions(householdLedgerOptions)}
                </section>
              )}
            </>
          )}
          {!isLoading && hasSourceError && (
            <button
              className="ledger-switcher-panel__retry"
              onClick={handleRetry}
              type="button"
            >
              {t('switcher.loadError')}
              {t('common.listSeparator')}
              {t('switcher.retry')}
            </button>
          )}
        </div>
        <div className="ledger-switcher-panel__footer">
          <button
            className="ledger-switcher-panel__footer-action ledger-switcher-panel__create"
            data-ledger-switcher-create
            onClick={() => {
              onClose();
              navigate(ROUTES_PATH.LEDGER_TEMPLATES.getPath());
            }}
            type="button"
          >
            <Plus aria-hidden="true" className="ledger-switcher-panel__footer-icon" size={17} />
            <span>{t('switcher.create')}</span>
          </button>
          <button
            className="ledger-switcher-panel__footer-action ledger-switcher-panel__manage"
            data-ledger-switcher-manage
            onClick={() => {
              onClose();
              navigate(ROUTES_PATH.LEDGERS.getPath());
            }}
            type="button"
          >
            <Settings2 aria-hidden="true" className="ledger-switcher-panel__footer-icon" size={17} />
            <span>{t('switcher.manage')}</span>
          </button>
        </div>
        <SafeArea position="bottom" />
      </section>
    </Popup>
  );
}

import type { WorkspaceScope } from '../model/workspace-scope';
import { Button, Popup, SafeArea, SpinLoading } from 'antd-mobile';
import { Check, Home, Landmark, Users } from 'lucide-react';
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
  const options = useMemo<WorkspaceOption[]>(() => {
    const personal: WorkspaceOption = {
      description: t('switcher.currentPersonal'),
      icon: Home,
      key: 'personal',
      label: t('switcher.personal'),
      path: ROUTES_PATH.DETAIL.getPath(),
      scope: { type: 'personal' },
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
      }));
    const household = householdQuery.data?.status === HouseholdStatus.ACTIVE
      ? [{
          description: '家庭共享',
          icon: Users,
          key: `household-${householdQuery.data.id}`,
          label: '家庭账本',
          path: ROUTES_PATH.HOUSEHOLD_HOME.getPath(householdQuery.data.id),
          scope: {
            householdId: householdQuery.data.id,
            type: 'household' as const,
          },
        }]
      : [];
    return [personal, ...custom, ...household];
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

  return (
    <Popup
      bodyClassName="!bottom-auto !top-0 max-h-[82vh] overflow-hidden rounded-b-lg bg-white"
      closeOnMaskClick
      destroyOnClose
      onClose={onClose}
      position="top"
      visible={visible}
    >
      <section aria-label={t('switcher.switch')} className="flex max-h-[82vh] flex-col pt-3">
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="text-lg font-semibold text-font-black">{t('switcher.switch')}</h2>
          <button className="border-0 bg-transparent px-2 py-1 text-sm text-font-gray" onClick={onClose} type="button">
            {t('switcher.cancel')}
          </button>
        </div>
        <div className="min-h-[120px] overflow-auto border-0 border-t border-solid border-[#EBEBEB]">
          {isLoading && (
            <div className="flex min-h-[160px] items-center justify-center gap-2 text-sm text-font-gray">
              <SpinLoading color="primary" />
              <span>{t('switcher.loading')}</span>
            </div>
          )}
          {!isLoading && options.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = isSameScope(option.scope, currentScope);
            return (
              <button
                aria-current={isSelected ? 'page' : undefined}
                className="flex min-h-[64px] w-full items-center border-0 border-b border-solid border-[#EBEBEB] bg-white px-4 text-left"
                data-workspace-option={option.key}
                key={option.key}
                onClick={() => handleSelect(option)}
                type="button"
              >
                <span className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-gray text-font-gray',
                  isSelected && 'bg-primary text-font-black',
                )}
                >
                  <OptionIcon size={20} />
                </span>
                <span className="ml-3 min-w-0 flex-grow">
                  <strong className="block truncate text-base font-medium text-font-black">{option.label}</strong>
                  {option.description && <span className="mt-0.5 block truncate text-xs text-font-gray">{option.description}</span>}
                </span>
                {isSelected && <Check aria-label={t('switcher.selected')} className="text-font-black" size={20} />}
              </button>
            );
          })}
          {!isLoading && hasSourceError && (
            <button
              className="flex min-h-12 w-full items-center justify-center border-0 bg-bg-gray px-4 text-sm text-font-gray"
              onClick={handleRetry}
              type="button"
            >
              {t('switcher.loadError')}
              ，
              {t('switcher.retry')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 px-4 py-3">
          <Button onClick={() => {
            onClose();
            navigate(ROUTES_PATH.LEDGER_TEMPLATES.getPath());
          }}
          >
            {t('switcher.create')}
          </Button>
          <Button onClick={() => {
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

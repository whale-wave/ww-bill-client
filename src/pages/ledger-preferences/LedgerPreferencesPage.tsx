import type { FC } from 'react';
import { SafeArea, Switch, Toast } from 'antd-mobile';
import { BookOpenCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetUserAppConfigQuery,
  usePatchLedgerQuickSwitchMutation,
} from '@/entities/user-app-config';
import { useTranslation } from '@/shared/i18n';
import { PageHeader, Surface } from '@/shared/ui';

interface QuickSwitchPreferenceState {
  enabled: boolean;
  version: number;
}

function isConflictError(error: unknown) {
  return typeof error === 'object'
    && error !== null
    && 'statusCode' in error
    && error.statusCode === 409;
}

const LedgerPreferencesPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const configQuery = useGetUserAppConfigQuery();
  const [patchPreference, mutation] = usePatchLedgerQuickSwitchMutation();
  const [preferenceOverride, setPreferenceOverride]
    = useState<QuickSwitchPreferenceState>();
  const [isSaving, setIsSaving] = useState(false);
  const serverPreference = configQuery.data
    ? {
        enabled: configQuery.data.isLedgerQuickSwitchEnabled,
        version: configQuery.data.ledgerQuickSwitchVersion,
      }
    : undefined;
  const preference = preferenceOverride
    && (!serverPreference || preferenceOverride.version >= serverPreference.version)
    ? preferenceOverride
    : serverPreference;

  const handleChange = async (enabled: boolean) => {
    if (!preference || isSaving)
      return;

    const previousOverride = preferenceOverride;
    setPreferenceOverride({ ...preference, enabled });
    setIsSaving(true);
    try {
      const response = await patchPreference({
        enabled,
        version: preference.version,
      });
      setPreferenceOverride(response.data);
    }
    catch (error) {
      setPreferenceOverride(previousOverride);
      if (isConflictError(error)) {
        setPreferenceOverride(undefined);
        await configQuery.refetch();
        Toast.show({ content: t('preferences.conflict') });
      }
      else {
        Toast.show({ content: t('preferences.updateFailed') });
      }
    }
    finally {
      setIsSaving(false);
    }
  };

  const isLoading = configQuery.isLoading || isSaving || mutation.isLoading;

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('preferences.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-6 pt-2">
        <div className="mx-auto w-full max-w-[520px]">
          <Surface className="flex min-h-[78px] items-center gap-3 px-4 py-3.5" material="raised">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-primary-light/55 text-primary-deep"><BookOpenCheck size={21} /></span>
            <span className="min-w-0 flex-1">
              <strong className="block text-[13px] font-extrabold text-ww-ink">{t('preferences.quickSwitch')}</strong>
              <small className="mt-1 block text-[10px] leading-4 text-ww-soft">{t('preferences.description')}</small>
            </span>
            <Switch
              checked={preference?.enabled ?? false}
              className="[--checked-color:var(--ww-theme-color)]"
              disabled={!preference || isLoading}
              loading={isLoading}
              onChange={handleChange}
            />
          </Surface>
        </div>
      </main>
      <SafeArea position="bottom" />
    </div>
  );
};

export default LedgerPreferencesPage;

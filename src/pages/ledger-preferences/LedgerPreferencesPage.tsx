import type { FC } from 'react';
import { List, NavBar, SafeArea, Switch, Toast } from 'antd-mobile';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetUserAppConfigQuery,
  usePatchLedgerQuickSwitchMutation,
} from '@/entities/user-app-config';
import { useTranslation } from '@/shared/i18n';

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
    <div className="page-new bg-bg-gray">
      <NavBar
        back={t('common:nav.back')}
        className="bg-primary"
        onBack={() => navigate(-1)}
      >
        {t('preferences.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto pt-3">
        <List>
          <List.Item
            description={t('preferences.description')}
            extra={(
              <Switch
                checked={preference?.enabled ?? false}
                className="[--checked-color:var(--ww-theme-color)]"
                disabled={!preference || isLoading}
                loading={isLoading}
                onChange={handleChange}
              />
            )}
          >
            {t('preferences.quickSwitch')}
          </List.Item>
        </List>
      </main>
      <SafeArea position="bottom" />
    </div>
  );
};

export default LedgerPreferencesPage;

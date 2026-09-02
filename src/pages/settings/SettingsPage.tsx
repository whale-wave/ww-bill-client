import type { FC } from 'react';
import type { SupportedLang } from '@/shared/i18n';
import { Toast } from 'antd-mobile';
import { SlidersHorizontal, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserAppConfigQuery, usePatchUserAppConfigMutation } from '@/entities/user-app-config';
import { useWorkspaceBack } from '@/features/workspace-navigation';
import {
  SettingsOverviewPresentation,
} from '@/features/workspace-settings';
import { ROUTES_PATH } from '@/shared/config/routes';
import {
  changeLanguage,
  i18n,
  SUPPORTED_LANGS,
  useTranslation,
} from '@/shared/i18n';
import { clearLocalStorage, getLocalStorageSize } from '@/shared/lib';
import { playSound } from '@/shared/lib/play-sound';
import { useSeniorMode } from '@/shared/lib/senior-mode';
import {
  confirmAppAction,
  GradientPanel,
  PageHeader,
  showAppActionSheet,
} from '@/shared/ui';

const Settings: FC = () => {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const onBack = useWorkspaceBack({ type: 'personal' });
  const { data: userAppConfig } = useGetUserAppConfigQuery();
  const visibleAmountSwitch = userAppConfig?.isDisplayAmountSwitch ?? false;
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const [patchUserAppConfig] = usePatchUserAppConfigMutation();
  const [localStorageSize, setLocalStorageSize] = useState(() => getLocalStorageSize());
  const [currentLang, setCurrentLang] = useState<SupportedLang>(
    () => i18n.language as SupportedLang,
  );

  const goTo = (path: string) => {
    playSound.turnPage();
    navigate(path);
  };

  const handleSwitchLang = useCallback(() => {
    const entries = Object.entries(SUPPORTED_LANGS) as [SupportedLang, string][];
    showAppActionSheet({
      actions: entries.map(([key, label]) => ({
        bold: key === currentLang,
        key,
        onClick: async () => {
          await changeLanguage(key);
          setCurrentLang(key);
          Toast.show(i18n.t('settings:language.changed'));
        },
        text: label,
      })),
      cancelText: t('common:nav.cancel'),
      description: t('language.description'),
      title: t('language.title'),
    });
  }, [currentLang, t]);

  const handleClearCache = async () => {
    const confirmed = await confirmAppAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('storage.clear'),
      description: t('storage.clearDescription'),
      icon: <Trash2 size={22} strokeWidth={1.8} />,
      title: t('storage.clearTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    clearLocalStorage();
    setLocalStorageSize(getLocalStorageSize());
    Toast.show(t('storage.cleared'));
  };

  const showDeveloping = () => Toast.show(t('developing'));

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-[52%] h-48 w-48 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={onBack}
        title={t('title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(24px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px]">
          <GradientPanel className="mb-5 flex items-center gap-3.5 px-4 py-4" elevation="low" surface="ice">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/80 bg-white/65 text-primary-deep shadow-ww-xs">
              <SlidersHorizontal size={21} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-[14px] font-extrabold text-ww-ink">{t('overview.title')}</h2>
              <p className="mt-0.5 text-[11px] leading-4 text-ww-mid">{t('overview.description')}</p>
            </div>
          </GradientPanel>
          <SettingsOverviewPresentation
            sections={[
              {
                id: 'account',
                rows: [
                  {
                    icon: 'account',
                    id: 'account',
                    kind: 'link',
                    label: t('account.title'),
                    onClick: () => goTo('/user-info'),
                  },
                  {
                    icon: 'category',
                    id: 'category',
                    kind: 'link',
                    label: t('category.title'),
                    onClick: () => goTo(ROUTES_PATH.CATEGORY_SETTINGS.getPath()),
                  },
                  {
                    description: t('shortcutBookkeeping.entryDescription'),
                    icon: 'shortcut',
                    id: 'shortcut-bookkeeping',
                    kind: 'link',
                    label: t('shortcutBookkeeping.title'),
                    onClick: () => goTo(ROUTES_PATH.SETTINGS_SHORTCUT_BOOKKEEPING.getPath()),
                  },
                  {
                    description: t('appLock.description'),
                    icon: 'lock',
                    id: 'app-lock',
                    kind: 'link',
                    label: t('appLock.title'),
                    onClick: () => {
                      playSound.turnPage();
                      navigate(ROUTES_PATH.APP_LOCK_SETTINGS.getPath(), {
                        state: { mode: 'management' },
                      });
                    },
                    value: userAppConfig?.gestureLockEnabled ? t('appLock.enabled') : t('appLock.disabled'),
                  },
                ],
                title: t('function.title'),
              },
              {
                id: 'preferences',
                rows: [
                  {
                    icon: 'language',
                    id: 'language',
                    kind: 'link',
                    label: t('language.switch'),
                    onClick: handleSwitchLang,
                    value: SUPPORTED_LANGS[currentLang],
                  },
                  {
                    description: t('appearance.entryDescription'),
                    icon: 'appearance',
                    id: 'appearance',
                    kind: 'link',
                    label: t('appearance.title'),
                    onClick: () => goTo(ROUTES_PATH.SETTINGS_APPEARANCE.getPath()),
                    value: t(`appearance.templates.${userAppConfig?.appearanceTemplate ?? 'glass'}`),
                  },
                  {
                    icon: 'record',
                    id: 'sound-and-haptics',
                    kind: 'link',
                    label: t('soundAndHaptics.title'),
                    onClick: () => goTo(ROUTES_PATH.SETTINGS_SOUND_AND_HAPTICS.getPath()),
                  },
                  {
                    checked: isSeniorMode,
                    description: t('seniorMode.desc'),
                    icon: 'appearance',
                    id: 'senior-mode',
                    kind: 'switch',
                    label: t('seniorMode.switch'),
                    onChange: toggleSeniorMode,
                  },
                  {
                    checked: visibleAmountSwitch,
                    description: t('amount.visibleDesc'),
                    icon: 'record',
                    id: 'amount',
                    kind: 'switch',
                    label: t('amount.visible'),
                    onChange: checked => void patchUserAppConfig({
                      isDisplayAmountSwitch: checked,
                    }),
                  },
                ],
                title: t('personal'),
              },
              {
                id: 'data',
                rows: [
                  {
                    icon: 'export',
                    id: 'export',
                    kind: 'link',
                    label: t('export'),
                    onClick: () => goTo('/export-data'),
                  },
                  {
                    danger: true,
                    icon: 'storage',
                    id: 'storage',
                    kind: 'action',
                    label: t('storage.clear'),
                    onClick: () => void handleClearCache(),
                    value: localStorageSize,
                  },
                ],
                title: t('dataSecurity'),
              },
              {
                id: 'placeholders',
                rows: [
                  {
                    icon: 'help',
                    id: 'help',
                    kind: 'placeholder',
                    label: t('help'),
                    onClick: showDeveloping,
                  },
                  {
                    icon: 'desktop',
                    id: 'desktop',
                    kind: 'placeholder',
                    label: t('desktopEntry'),
                    onClick: showDeveloping,
                  },
                ],
                title: t('system'),
              },
            ]}
          />
        </div>
      </main>
    </div>
  );
};

export default Settings;

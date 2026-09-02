import type { FC } from 'react';
import { Toast } from 'antd-mobile';
import { useState } from 'react';
import { useGetUserAppConfigQuery, usePatchUserAppConfigMutation } from '@/entities/user-app-config';
import { useWorkspaceBack } from '@/features/workspace-navigation';
import { SettingsOverviewPresentation } from '@/features/workspace-settings';
import { useTranslation } from '@/shared/i18n';
import {
  audioWeb,
  hapticFeedback,
  playSound,
} from '@/shared/lib';
import { PageHeader } from '@/shared/ui';

const SoundAndHapticsPage: FC = () => {
  const { t } = useTranslation('settings');
  const onBack = useWorkspaceBack({ type: 'personal' });
  const { data: config } = useGetUserAppConfigQuery();
  const [patchConfig, patchState] = usePatchUserAppConfigMutation();
  const [soundOverride, setSoundOverride] = useState<boolean>();
  const [hapticOverride, setHapticOverride] = useState<boolean>();
  const [motionOverride, setMotionOverride] = useState<boolean>();
  const soundEnabled = soundOverride ?? config?.isOpenSoundEffect ?? false;
  const hapticEnabled = hapticOverride ?? config?.isOpenHapticEffect ?? false;
  const motionEnabled = motionOverride ?? config?.isOpenMotionEffect ?? true;

  const handleSoundSwitch = async (checked: boolean) => {
    const previous = soundEnabled;
    setSoundOverride(checked);
    if (checked) {
      if (audioWeb.hasCache())
        audioWeb.loadCache();
      else
        void audioWeb.download();
      audioWeb.open();
    }
    else {
      audioWeb.close();
    }

    try {
      await patchConfig({ isOpenSoundEffect: checked });
      playSound.click();
    }
    catch {
      setSoundOverride(previous);
      if (previous)
        audioWeb.open();
      else
        audioWeb.close();
      Toast.show({ content: t('soundAndHaptics.saveFailed'), icon: 'fail' });
    }
    finally {
      setSoundOverride(undefined);
    }
  };

  const handleHapticSwitch = async (checked: boolean) => {
    const previous = hapticEnabled;
    setHapticOverride(checked);
    if (checked) {
      hapticFeedback.open();
      hapticFeedback.impact();
    }
    else {
      hapticFeedback.impact();
      hapticFeedback.close();
    }

    try {
      await patchConfig({ isOpenHapticEffect: checked });
    }
    catch {
      setHapticOverride(previous);
      if (previous)
        hapticFeedback.open();
      else
        hapticFeedback.close();
      Toast.show({ content: t('soundAndHaptics.saveFailed'), icon: 'fail' });
    }
    finally {
      setHapticOverride(undefined);
    }
  };

  const handleMotionSwitch = async (checked: boolean) => {
    const previous = motionEnabled;
    setMotionOverride(checked);

    try {
      await patchConfig({ isOpenMotionEffect: checked });
    }
    catch {
      setMotionOverride(previous);
      Toast.show({ content: t('soundAndHaptics.saveFailed'), icon: 'fail' });
    }
    finally {
      setMotionOverride(undefined);
    }
  };

  return (
    <div className="page-new relative overflow-hidden">
      <PageHeader backLabel={t('common:nav.back')} onBack={onBack} title={t('soundAndHaptics.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
        <div className="mx-auto w-full max-w-[520px]">
          <SettingsOverviewPresentation
            sections={[{
              id: 'sound-and-haptics',
              rows: [
                {
                  checked: soundEnabled,
                  disabled: patchState.isLoading,
                  icon: 'record',
                  id: 'sound',
                  kind: 'switch',
                  label: t('soundAndHaptics.sound'),
                  onChange: checked => void handleSoundSwitch(checked),
                },
                {
                  checked: hapticEnabled,
                  disabled: patchState.isLoading,
                  icon: 'appearance',
                  id: 'haptics',
                  kind: 'switch',
                  label: t('soundAndHaptics.haptics'),
                  onChange: checked => void handleHapticSwitch(checked),
                },
                {
                  checked: motionEnabled,
                  disabled: patchState.isLoading,
                  icon: 'appearance',
                  id: 'motion',
                  kind: 'switch',
                  label: t('soundAndHaptics.motion'),
                  onChange: checked => void handleMotionSwitch(checked),
                },
              ],
            }]}
          />
        </div>
      </main>
    </div>
  );
};

export default SoundAndHapticsPage;

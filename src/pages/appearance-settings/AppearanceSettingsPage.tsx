import type { FC, KeyboardEvent } from 'react';
import type { AppearanceAccent, AppearanceTemplate } from '@/entities/user-app-config';
import type { AppearancePreference } from '@/features/appearance';
import { Toast } from 'antd-mobile';
import { Check, Palette, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  useGetUserAppConfigQuery,
  usePatchUserAppConfigMutation,
} from '@/entities/user-app-config';
import {
  appearanceAccentOptions,
  appearanceTemplateOptions,
  applyAppearancePreference,
  readAppearancePreference,
} from '@/features/appearance';
import { useWorkspaceBack } from '@/features/workspace-navigation';
import { useTranslation } from '@/shared/i18n';
import { PageHeader } from '@/shared/ui';

function moveRadioSelection<T extends string>(
  event: KeyboardEvent<HTMLButtonElement>,
  options: readonly { value: T }[],
  current: T,
  onChange: (value: T) => void,
) {
  const currentIndex = options.findIndex(option => option.value === current);
  const isPrevious = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
  const isNext = event.key === 'ArrowRight' || event.key === 'ArrowDown';
  const isBoundary = event.key === 'Home' || event.key === 'End';
  if (!isPrevious && !isNext && !isBoundary)
    return;

  event.preventDefault();
  const nextIndex = event.key === 'Home'
    ? 0
    : event.key === 'End'
      ? options.length - 1
      : (currentIndex + (isPrevious ? -1 : 1) + options.length) % options.length;
  const nextValue = options[nextIndex].value;
  onChange(nextValue);
  const radioButtons = event.currentTarget.closest('[role="radiogroup"]')?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
  radioButtons?.[nextIndex]?.focus();
}

const AppearanceSettingsPage: FC = () => {
  const { t } = useTranslation('settings');
  const onBack = useWorkspaceBack({ type: 'personal' });
  const appearanceQuery = useGetUserAppConfigQuery();
  const [patchUserAppConfig, patchMutation] = usePatchUserAppConfigMutation();
  const [pendingPreference, setPendingPreference] = useState<AppearancePreference>();
  const savedPreference = useMemo(
    () => readAppearancePreference(appearanceQuery.data),
    [appearanceQuery.data],
  );
  const preference = pendingPreference ?? savedPreference;

  const savePreference = async (nextPreference: AppearancePreference) => {
    if (patchMutation.isLoading || (nextPreference.accent === preference.accent && nextPreference.template === preference.template))
      return;

    const previousPreference = preference;
    setPendingPreference(nextPreference);
    applyAppearancePreference(nextPreference);
    try {
      await patchUserAppConfig({
        appearanceAccent: nextPreference.accent,
        appearanceTemplate: nextPreference.template,
      });
      setPendingPreference(undefined);
    }
    catch {
      setPendingPreference(previousPreference);
      applyAppearancePreference(previousPreference);
      Toast.show(t('appearance.saveFailed'));
    }
  };

  const handleTemplateChange = (template: AppearanceTemplate) => {
    void savePreference({ ...preference, template });
  };

  const handleAccentChange = (accent: AppearanceAccent) => {
    void savePreference({ ...preference, accent });
  };

  return (
    <div className="page-new relative overflow-hidden" data-appearance-settings>
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={onBack}
        title={t('appearance.title')}
      />
      <main className="min-h-0 flex-grow overflow-auto px-[var(--ww-page-gutter)] pb-[max(20px,env(safe-area-inset-bottom))]">
        <section className="appearance-settings__intro mt-1">
          <span className="appearance-settings__intro-icon"><Palette size={21} strokeWidth={1.8} /></span>
          <div>
            <h2>{t('appearance.introTitle')}</h2>
            <p>{t('appearance.introDescription')}</p>
          </div>
        </section>

        <section className="mt-4" aria-labelledby="appearance-template-title">
          <div className="mb-1.5 flex items-center gap-2 px-1">
            <Sparkles className="text-primary-deep" size={17} strokeWidth={1.8} />
            <h2 className="text-[13px] font-extrabold text-ww-ink" id="appearance-template-title">{t('appearance.templateTitle')}</h2>
          </div>
          <div aria-label={t('appearance.templateTitle')} className="grid grid-cols-1 gap-2.5" role="radiogroup">
            {appearanceTemplateOptions.map((option) => {
              const isSelected = preference.template === option.value;
              return (
                <button
                  aria-checked={isSelected}
                  className="appearance-template-option"
                  data-selected={isSelected}
                  data-template-preview={option.value}
                  disabled={patchMutation.isLoading}
                  key={option.value}
                  onClick={() => handleTemplateChange(option.value)}
                  onKeyDown={event => moveRadioSelection(event, appearanceTemplateOptions, preference.template, handleTemplateChange)}
                  role="radio"
                  type="button"
                >
                  <span aria-hidden="true" className="appearance-template-option__preview">
                    <span className="appearance-template-option__preview-orb" />
                    <span className="appearance-template-option__preview-card">
                      <span />
                      <span />
                    </span>
                    <span className="appearance-template-option__preview-line" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <strong className="flex items-center gap-1.5">
                      {t(option.labelKey)}
                      {option.value === 'glass' && <em>{t('appearance.recommended')}</em>}
                    </strong>
                    <small>{t(option.descriptionKey)}</small>
                  </span>
                  <span className="appearance-template-option__check">{isSelected && <Check size={15} strokeWidth={3} />}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-4 pb-5" aria-labelledby="appearance-accent-title">
          <h2 className="mb-1.5 px-1 text-[13px] font-extrabold text-ww-ink" id="appearance-accent-title">{t('appearance.accentTitle')}</h2>
          <div aria-label={t('appearance.accentTitle')} className="grid grid-cols-2 gap-2.5" role="radiogroup">
            {appearanceAccentOptions.map((option) => {
              const isSelected = preference.accent === option.value;
              return (
                <button
                  aria-checked={isSelected}
                  className="appearance-accent-option"
                  data-appearance-accent={option.value}
                  data-selected={isSelected}
                  disabled={patchMutation.isLoading}
                  key={option.value}
                  onClick={() => handleAccentChange(option.value)}
                  onKeyDown={event => moveRadioSelection(event, appearanceAccentOptions, preference.accent, handleAccentChange)}
                  role="radio"
                  type="button"
                >
                  <span aria-hidden="true" className="appearance-accent-option__swatch">
                    <span />
                    <span />
                  </span>
                  <span>{t(option.labelKey)}</span>
                  {isSelected && <Check className="ml-auto" size={16} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AppearanceSettingsPage;

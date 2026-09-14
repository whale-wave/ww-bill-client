import type { FC, FormEvent } from 'react';
import type {
  LedgerCreateFormErrorCode,
  LedgerCreateFormValues,
} from '../model/ledger-create-form';
import { PencilLine } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { AppButton, Surface } from '@/shared/ui';
import { Input, Stepper } from '@/shared/ui/konsta-compat';
import { validateLedgerCreateForm } from '../model/ledger-create-form';

interface LedgerCreateFormProps {
  defaultName: string;
  isSubmitting: boolean;
  onSubmit: (values: LedgerCreateFormValues) => void | Promise<void>;
}

function getErrorTranslationKey(error: LedgerCreateFormErrorCode) {
  if (error === 'name-required')
    return 'create.validation.nameRequired';

  return 'create.validation.monthStartDayRange';
}

export const LedgerCreateForm: FC<LedgerCreateFormProps> = ({
  defaultName,
  isSubmitting,
  onSubmit,
}) => {
  const { t } = useTranslation('ledger');
  const [name, setName] = useState(defaultName);
  const [monthStartDay, setMonthStartDay] = useState(1);
  const [errors, setErrors] = useState<ReturnType<typeof validateLedgerCreateForm>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = { monthStartDay, name };
    const nextErrors = validateLedgerCreateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length)
      return;

    void onSubmit(values);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (errors.name)
      setErrors(current => ({ ...current, name: undefined }));
  };

  const handleMonthStartDayChange = (value: number) => {
    setMonthStartDay(value);
    if (errors.monthStartDay)
      setErrors(current => ({ ...current, monthStartDay: undefined }));
  };

  return (
    <form className="space-y-4" data-ledger-create-form onSubmit={handleSubmit}>
      <Surface className="px-5 py-5" material="content">
        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-primary-light/55 text-primary-deep"><PencilLine size={16} /></span>
            <label className="text-[12px] font-extrabold text-ww-ink" htmlFor="ledger-name">
              {t('create.name')}
            </label>
          </div>
          <div className={`flex h-[52px] items-center rounded-[17px] border border-solid bg-white/80 px-4 shadow-ww-xs transition ${errors.name ? 'border-feedback-danger' : 'border-border-primary focus-within:border-primary'}`}>
            <Input
              aria-invalid={Boolean(errors.name)}
              className="min-w-0 flex-1 border-0 bg-transparent text-[14px] font-bold text-ww-ink outline-none placeholder:text-ww-ghost"
              id="ledger-name"
              maxLength={30}
              onChange={handleNameChange}
              placeholder={t('create.namePlaceholder')}
              value={name}
            />
            <span className="ml-2 text-[9px] font-semibold tabular-nums text-ww-ghost">
              {name.length}
              /30
            </span>
          </div>
          {errors.name && (
            <div className="mt-2 text-[10px] font-semibold text-feedback-danger" role="alert">
              {t(getErrorTranslationKey(errors.name))}
            </div>
          )}
        </div>

        <div className="my-5 h-px bg-border-primary" />

        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-extrabold text-ww-ink">{t('create.monthStartDay')}</div>
              <div className="mt-1 text-[10px] leading-4 text-ww-soft">
                {t('create.monthStartDayDescription')}
              </div>
            </div>
            <Stepper
              aria-label={t('create.monthStartDay')}
              className="shrink-0"
              max={28}
              min={1}
              onChange={value => value !== undefined && handleMonthStartDayChange(value)}
              value={monthStartDay}
            />
          </div>
          <div className="mt-3 inline-flex rounded-full bg-primary-light/35 px-3 py-1.5 text-[10px] font-bold text-primary-deep">
            {t('create.monthStartDayValue', { day: monthStartDay })}
          </div>
          {errors.monthStartDay && (
            <div className="mt-2 text-[10px] font-semibold text-feedback-danger" role="alert">
              {t(getErrorTranslationKey(errors.monthStartDay))}
            </div>
          )}
        </div>
      </Surface>
      <AppButton
        fullWidth
        loading={isSubmitting}
        loadingLabel={t('create.submitting')}
        size="large"
        type="submit"
      >
        {t('create.submit')}
      </AppButton>
    </form>
  );
};

import type { FC, FormEvent } from 'react';
import type {
  LedgerCreateFormErrorCode,
  LedgerCreateFormValues,
} from '../model/ledger-create-form';
import { Minus, PencilLine, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { Surface } from '@/shared/ui';
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

  const adjustMonthStartDay = (difference: number) => {
    handleMonthStartDayChange(Math.min(28, Math.max(1, monthStartDay + difference)));
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
            <input
              aria-invalid={Boolean(errors.name)}
              className="min-w-0 flex-1 border-0 bg-transparent text-[14px] font-bold text-ww-ink outline-none placeholder:text-ww-ghost"
              id="ledger-name"
              maxLength={30}
              onChange={event => handleNameChange(event.target.value)}
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
            <div aria-label={t('create.monthStartDay')} className="flex shrink-0 items-center gap-1 rounded-[16px] border border-solid border-border-primary bg-white/80 p-1 shadow-ww-xs" role="group">
              <button aria-label={t('create.decreaseDay')} className="flex h-11 w-11 items-center justify-center rounded-[12px] border-0 bg-primary-light/45 text-primary-deep disabled:opacity-35" disabled={monthStartDay <= 1} onClick={() => adjustMonthStartDay(-1)} type="button"><Minus size={16} strokeWidth={2.2} /></button>
              <output className="min-w-[38px] text-center text-[17px] font-black tabular-nums text-ww-ink">{monthStartDay}</output>
              <button aria-label={t('create.increaseDay')} className="flex h-11 w-11 items-center justify-center rounded-[12px] border-0 bg-primary text-white shadow-ww-xs disabled:opacity-35" disabled={monthStartDay >= 28} onClick={() => adjustMonthStartDay(1)} type="button"><Plus size={16} strokeWidth={2.2} /></button>
            </div>
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
      <button
        className="h-[54px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww transition active:scale-[0.99] disabled:opacity-45"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? t('create.submitting') : t('create.submit')}
      </button>
    </form>
  );
};

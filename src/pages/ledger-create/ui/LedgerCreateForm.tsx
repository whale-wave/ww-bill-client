import type { FC, FormEvent } from 'react';
import type {
  LedgerCreateFormErrorCode,
  LedgerCreateFormValues,
} from '../model/ledger-create-form';
import { Button, Input, Stepper } from 'antd-mobile';
import { useState } from 'react';
import { useTranslation } from '@/shared/i18n';
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
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="card-rounded bg-white px-4">
        <div className="border-0 border-b border-solid border-[#EBEBEB] py-3">
          <label className="mb-2 block text-sm text-font-black" htmlFor="ledger-name">
            {t('create.name')}
          </label>
          <Input
            aria-invalid={Boolean(errors.name)}
            clearable
            id="ledger-name"
            maxLength={30}
            onChange={handleNameChange}
            placeholder={t('create.namePlaceholder')}
            value={name}
          />
          {errors.name && (
            <div className="mt-1 text-xs text-red-500" role="alert">
              {t(getErrorTranslationKey(errors.name))}
            </div>
          )}
        </div>
        <div className="py-3">
          <div className="mb-1 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-font-black">{t('create.monthStartDay')}</div>
              <div className="mt-1 text-xs leading-5 text-font-gray">
                {t('create.monthStartDayDescription')}
              </div>
            </div>
            <Stepper
              max={28}
              min={1}
              onChange={handleMonthStartDayChange}
              value={monthStartDay}
            />
          </div>
          <div className="text-right text-xs text-font-gray">
            {t('create.monthStartDayValue', { day: monthStartDay })}
          </div>
          {errors.monthStartDay && (
            <div className="mt-1 text-xs text-red-500" role="alert">
              {t(getErrorTranslationKey(errors.monthStartDay))}
            </div>
          )}
        </div>
      </div>
      <Button
        block
        color="primary"
        disabled={isSubmitting}
        loading={isSubmitting}
        size="large"
        type="submit"
      >
        {isSubmitting ? t('create.submitting') : t('create.submit')}
      </Button>
    </form>
  );
};

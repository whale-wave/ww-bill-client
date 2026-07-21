import type {
  CreatableLedgerTemplateKey,
  PostLedgerApiData,
} from '@/entities/ledger';

export interface LedgerCreateFormValues {
  name: string;
  monthStartDay: number;
}

export type LedgerCreateFormErrorCode
  = | 'name-required'
    | 'month-start-day-range';

export interface LedgerCreateFormErrors {
  name?: LedgerCreateFormErrorCode;
  monthStartDay?: LedgerCreateFormErrorCode;
}

export function validateLedgerCreateForm(
  values: LedgerCreateFormValues,
): LedgerCreateFormErrors {
  const errors: LedgerCreateFormErrors = {};

  if (!values.name.trim())
    errors.name = 'name-required';

  if (!Number.isInteger(values.monthStartDay)
    || values.monthStartDay < 1
    || values.monthStartDay > 28) {
    errors.monthStartDay = 'month-start-day-range';
  }

  return errors;
}

export function buildLedgerCreatePayload(
  values: LedgerCreateFormValues,
  templateKey: CreatableLedgerTemplateKey,
): PostLedgerApiData {
  return {
    monthStartDay: values.monthStartDay,
    name: values.name.trim(),
    templateKey,
    templateVersion: 1,
  };
}

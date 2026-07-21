import { describe, expect, it } from 'vitest';
import {
  buildLedgerCreatePayload,
  validateLedgerCreateForm,
} from '@/pages/ledger-create/model/ledger-create-form';

describe('ledger create form model', () => {
  it('requires a non-blank name', () => {
    expect(validateLedgerCreateForm({ monthStartDay: 1, name: '   ' })).toEqual({
      name: 'name-required',
    });
  });

  it.each([0, 29, 1.5])('rejects month start day %s outside integer 1-28', (monthStartDay) => {
    expect(validateLedgerCreateForm({ monthStartDay, name: '旅行账本' })).toEqual({
      monthStartDay: 'month-start-day-range',
    });
  });

  it('accepts the month boundary values', () => {
    expect(validateLedgerCreateForm({ monthStartDay: 1, name: '账本' })).toEqual({});
    expect(validateLedgerCreateForm({ monthStartDay: 28, name: '账本' })).toEqual({});
  });

  it('trims the name and pins the selected template to version one', () => {
    expect(buildLedgerCreatePayload({ monthStartDay: 8, name: '  生意账本  ' }, 'business')).toEqual({
      monthStartDay: 8,
      name: '生意账本',
      templateKey: 'business',
      templateVersion: 1,
    });
  });
});

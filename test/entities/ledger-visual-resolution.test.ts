import { describe, expect, it } from 'vitest';
import { LedgerKind, resolveLedgerVisual } from '@/entities/ledger';

describe('resolveLedgerVisual', () => {
  it('always uses the Whale Wave logo for the system default ledger', () => {
    expect(resolveLedgerVisual({
      iconKey: 'users',
      kind: LedgerKind.SYSTEM_DEFAULT,
      templateKey: 'team',
    })).toEqual({ type: 'system-logo', value: 'whale-wave' });
  });

  it('prefers a valid custom ledger icon key', () => {
    expect(resolveLedgerVisual({
      iconKey: 'briefcase',
      kind: LedgerKind.CUSTOM,
      templateKey: 'team',
    })).toEqual({ type: 'ledger-icon', value: 'briefcase' });
  });

  it('falls back to a valid template icon when the icon key is missing or unknown', () => {
    expect(resolveLedgerVisual({ kind: LedgerKind.CUSTOM, templateKey: 'team' }))
      .toEqual({ type: 'template-icon', value: 'team' });
    expect(resolveLedgerVisual({ iconKey: 'not-a-ledger-icon', kind: LedgerKind.CUSTOM, templateKey: 'company' }))
      .toEqual({ type: 'template-icon', value: 'company' });
  });

  it('uses a stable fallback when both visual keys are unavailable', () => {
    expect(resolveLedgerVisual({ kind: LedgerKind.CUSTOM, templateKey: 'unknown-template' }))
      .toEqual({ type: 'fallback', value: 'ledger' });
    expect(resolveLedgerVisual({ iconKey: 'unknown-icon', kind: LedgerKind.CUSTOM }))
      .toEqual({ type: 'fallback', value: 'ledger' });
    expect(resolveLedgerVisual({})).toEqual({ type: 'fallback', value: 'ledger' });
  });
});

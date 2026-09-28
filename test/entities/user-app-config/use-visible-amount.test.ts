import { describe, expect, it } from 'vitest';
import { isAmountVisible } from '@/entities/user-app-config';

describe('isAmountVisible', () => {
  it('keeps amounts visible until the privacy switch is enabled', () => {
    expect(isAmountVisible({ isDisplayAmount: false, isDisplayAmountSwitch: false })).toBe(true);
  });

  it('hides amounts when the enabled preference is false', () => {
    expect(isAmountVisible({ isDisplayAmount: false, isDisplayAmountSwitch: true })).toBe(false);
  });

  it('shows amounts when the enabled preference is true', () => {
    expect(isAmountVisible({ isDisplayAmount: true, isDisplayAmountSwitch: true })).toBe(true);
  });

  it('defaults missing preferences to visible amounts', () => {
    expect(isAmountVisible()).toBe(true);
  });
});

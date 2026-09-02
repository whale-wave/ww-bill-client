import { describe, expect, it } from 'vitest';
import { resolveMotionPreference } from '@/shared/ui/motion';

describe('motion preference', () => {
  it('keeps motion enabled when both the account and system allow it', () => {
    expect(resolveMotionPreference({
      enabled: true,
      isSeniorMode: false,
      prefersReducedMotion: false,
    })).toEqual({
      isMotionEnabled: true,
      shouldReduceMotion: false,
    });
  });

  it.each([
    { enabled: false, isSeniorMode: false, prefersReducedMotion: false },
    { enabled: true, isSeniorMode: true, prefersReducedMotion: false },
    { enabled: true, isSeniorMode: false, prefersReducedMotion: true },
  ])('reduces motion for an explicit accessibility or preference override', (input) => {
    expect(resolveMotionPreference(input)).toEqual({
      isMotionEnabled: false,
      shouldReduceMotion: true,
    });
  });
});

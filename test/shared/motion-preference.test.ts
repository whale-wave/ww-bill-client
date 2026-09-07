import { describe, expect, it } from 'vitest';
import { resolveMotionPreference } from '@/shared/ui/motion';

describe('motion preference', () => {
  it('keeps motion enabled by default', () => {
    expect(resolveMotionPreference({
      isSeniorMode: false,
      prefersReducedMotion: false,
    })).toEqual({
      isMotionEnabled: true,
      shouldReduceMotion: false,
    });
  });

  it.each([
    { isSeniorMode: true, prefersReducedMotion: false },
    { isSeniorMode: false, prefersReducedMotion: true },
  ])('reduces motion for an accessibility override', (input) => {
    expect(resolveMotionPreference(input)).toEqual({
      isMotionEnabled: false,
      shouldReduceMotion: true,
    });
  });
});

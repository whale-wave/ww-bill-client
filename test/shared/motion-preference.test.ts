import { describe, expect, it } from 'vitest';
import { loadMotionFeatures, resolveMotionPreference } from '@/shared/ui';

describe('motion preference', () => {
  it('loads pan and drag features for follow-finger interactions', async () => {
    const features = await loadMotionFeatures();

    expect(features).toHaveProperty('pan');
    expect(features).toHaveProperty('drag');
  });

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

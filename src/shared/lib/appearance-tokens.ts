import { useEffect, useState } from 'react';
import { CHART_STYLE_FALLBACKS } from '@/shared/config/chart-style-fallbacks';

export const APPEARANCE_CHANGE_EVENT = 'ww:appearance-change';

function readCssVariable(name: string, fallback: string): string {
  if (typeof window === 'undefined')
    return fallback;
  return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function readAppearanceChartColors(): string[] {
  return [
    ...CHART_STYLE_FALLBACKS.chartColors.map((fallback, index) => (
      readCssVariable(`--ww-chart-${index + 1}`, fallback)
    )),
  ];
}

export function readAppearanceToken(name: string, fallback: string): string {
  return readCssVariable(name, fallback);
}

export { withColorAlpha as withAlpha } from '@ww-bill/bill-core';

export function useAppearanceRevision(): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const handleChange = () => setRevision(value => value + 1);
    document.addEventListener(APPEARANCE_CHANGE_EVENT, handleChange);
    return () => document.removeEventListener(APPEARANCE_CHANGE_EVENT, handleChange);
  }, []);
  return revision;
}

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

export function withAlpha(hexColor: string, alpha: number): string {
  const normalized = hexColor.replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map(value => `${value}${value}`).join('')
    : normalized;
  if (!/^[\da-f]{6}$/i.test(expanded))
    return hexColor;
  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function useAppearanceRevision(): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const handleChange = () => setRevision(value => value + 1);
    document.addEventListener(APPEARANCE_CHANGE_EVENT, handleChange);
    return () => document.removeEventListener(APPEARANCE_CHANGE_EVENT, handleChange);
  }, []);
  return revision;
}

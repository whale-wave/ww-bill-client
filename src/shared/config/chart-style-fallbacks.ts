/**
 * Canvas charts need concrete values during SSR and before computed CSS is
 * available. Appearance tokens replace these values whenever a document exists.
 */
export const CHART_STYLE_FALLBACKS = {
  chartColors: ['#4aaac4', '#f0a0b8', '#a996dc', '#79c6a8', '#efbc70', '#6e9fdb'],
  inverse: '#ffffff',
  negative: '#e84149',
  primary: '#4aaac4',
  surface: '#f5f5f5',
  text: '#263340',
  textMuted: '#666',
  textSoft: '#9baebb',
  textStrong: '#333',
  tooltipBackground: 'rgba(38, 51, 64, 0.92)',
  transparentSurface: 'rgba(255, 255, 255, 0)',
} as const;

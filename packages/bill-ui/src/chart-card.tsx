import type { ElementType, ReactNode } from 'react';
import { SurfacePresentation } from './surface';
import './chart-card.scss';

export function ChartSummaryCardVisual({ metrics, chart, toolbar, primitives = { Surface: SurfacePresentation, Box: 'div' } }: { metrics: ReactNode; chart: ReactNode; toolbar?: ReactNode; primitives?: { Surface: ElementType; Box: ElementType } }) {
  const { Surface, Box } = primitives;
  return (
    <Surface material="raised" className={`bill-chart-card${toolbar ? ' bill-chart-card--toolbar' : ''}`}>
      {toolbar && <Box className="bill-chart-card__toolbar" data-chart-display-toolbar>{toolbar}</Box>}
      <Box className={toolbar ? 'bill-chart-card__metrics bill-chart-card__metrics--toolbar' : 'bill-chart-card__metrics'}>{metrics}</Box>
      {chart}
    </Surface>
  );
}

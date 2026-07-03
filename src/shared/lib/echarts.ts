import { LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  CanvasRenderer,
  GridComponent,
  LabelLayout,
  LegendComponent,
  LineChart,
  MarkLineComponent,
  PieChart,
  TitleComponent,
  TooltipComponent,
  UniversalTransition,
]);

export { echarts };

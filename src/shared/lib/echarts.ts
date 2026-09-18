import { BarChart, LineChart, PieChart, SankeyChart } from 'echarts/charts';
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
  BarChart,
  GridComponent,
  LabelLayout,
  LegendComponent,
  LineChart,
  MarkLineComponent,
  PieChart,
  SankeyChart,
  TitleComponent,
  TooltipComponent,
  UniversalTransition,
]);

export { echarts };

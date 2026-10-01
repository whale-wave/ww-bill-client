import type { FC } from 'react';
import { clampProgress } from '@ww-bill/bill-core';
import { ProgressVisual } from '@ww-bill/bill-ui';
import { THEME_COLOR } from '@/assets/styles/reset';

export const ProgressBar: FC<{ color?: string; percent: number }> = ({ color = THEME_COLOR, percent }) => <ProgressVisual color={color} fraction={clampProgress(percent)} />;

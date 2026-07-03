import type { CSSProperties, FC } from 'react';
import type { BaseProps } from '@/shared/lib';
import React from 'react';
import { mergerProps, withBaseProps } from '@/shared/lib';

const classPrefix = 'bwm-progress-circle';

type ProgressCircleProps = {
  /**
   * 百分比
   * @default 0
   */
  percent?: number;
  /**
   * 子元素
   */
  children?: React.ReactNode;
} & BaseProps<'--size' | '--track-width' | '--track-color' | '--fill-color'>;

const defaultProps = {
  percent: 0,
};

export const ProgressCircle: FC<ProgressCircleProps> = (p) => {
  const props = mergerProps({ ...defaultProps }, p);
  const style: CSSProperties & Record<'--percent', string> = {
    '--percent': props.percent.toString(),
  };

  return withBaseProps(
    props,
    <div className={`${classPrefix}`} style={style}>
      <div className={`${classPrefix}-content`}>
        <svg className={`${classPrefix}-svg`}>
          <circle className={`${classPrefix}-track`} fill="transparent" />
          <circle className={`${classPrefix}-fill`} fill="transparent" />
        </svg>
        <div className={`${classPrefix}-info`}>{props.children}</div>
      </div>
    </div>,
  );
};

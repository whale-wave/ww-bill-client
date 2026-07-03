import type { FC } from 'react';
import type { BaseProps } from '@/shared/lib';
import { mergerProps, withBaseProps } from '@/shared/lib';

const classPrefix = 'bwm-progress-bar';

type ProgressBarProps = {
  /**
   * 百分比
   * @default 0
   */
  percent?: number;
} & BaseProps<'--track-width' | '--track-color' | '--fill-color'>;

const defaultProps = {
  percent: 0,
};

export const ProgressBar: FC<ProgressBarProps> = (p) => {
  const props = mergerProps({ ...defaultProps }, p);
  const fillStyle = {
    width: `${props.percent}%`,
  };

  return withBaseProps(
    props,
    <div className={classPrefix}>
      <div className={`${classPrefix}-trail`}>
        <div className={`${classPrefix}-fill`} style={fillStyle} />
      </div>
    </div>,
  );
};

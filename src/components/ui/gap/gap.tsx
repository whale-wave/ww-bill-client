import type { FC } from 'react';
import classNames from 'classnames';
import { mergerProps } from '../../utils';

interface GapProps {
  /**
   * 高度
   */
  height?: number;
  /**
   * 背景颜色
   */
  color?: string;
  /**
   * 组件额外的 className
   */
  className?: string;
}

const defaultProps = {
  height: 10,
  color: '#f5f5f5',
};

const classPrefix = 'bwm-gap';

export const Gap: FC<GapProps> = (p) => {
  const props = mergerProps({ ...defaultProps }, p);
  return (
    <div
      className={classNames(props.className, classPrefix)}
      style={{ height: props.height, background: props.color }}
    />
  );
};

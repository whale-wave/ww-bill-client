import type { FC } from 'react';
import classNames from 'classnames';
import { mergerProps } from '@/shared/lib';

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
  color: 'var(--ww-surface-tint-color)',
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

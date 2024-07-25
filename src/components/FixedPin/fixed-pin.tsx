import type { CSSProperties, FC, MouseEvent } from 'react';
import React from 'react';
import classNames from 'classnames';

const classPrefix = 'bwm-fixed-pin';

interface FixedPinProps {
  /**
   * 自定义 style 样式
   */
  style?: CSSProperties;
  /**
   * 组件额外的 className
   */
  className?: string;
  /**
   * 子元素
   */
  children?: React.ReactNode;
  /**
   * 点击事件
   */
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export const FixedPin: FC<FixedPinProps> = ({ children, onClick, className }) => {
  return (
    <div className={classNames(classPrefix, className)} onClick={onClick}>
      {children}
    </div>
  );
};

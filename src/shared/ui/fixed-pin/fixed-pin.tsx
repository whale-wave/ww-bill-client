import type { CSSProperties, FC, MouseEvent } from 'react';
import React from 'react';

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
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const FixedPin: FC<FixedPinProps> = ({ children, className, style, onClick }) => {
  return (
    <button className={`${classPrefix}${className ? ` ${className}` : ''}`} onClick={onClick} style={style} type="button">
      {children}
    </button>
  );
};

import type { CSSProperties, FC } from 'react';
import classNames from 'classnames';
import React from 'react';

const classPrefix = 'bwm-button';

export interface ButtonProps {
  /**
   * 大小
   * @default medium
   */
  size?: 'medium' | 'full';
  /**
   * 块级元素
   * @default false
   */
  block?: boolean;
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
  onClick?: () => void;
}

const defaultProps = {
  block: false,
  size: 'medium',
};

export const Button: FC<ButtonProps> = (p) => {
  const { children, onClick, style, block, size, className } = Object.assign(
    { ...defaultProps },
    p,
  );

  return (
    <button
      className={classNames(classPrefix, className, {
        [`${classPrefix}-block`]: block,
        [`${classPrefix}-middle`]: size === 'medium',
        [`${classPrefix}-full`]: size === 'full',
      })}
      style={style}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

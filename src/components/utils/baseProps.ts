import type { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';
import React from 'react';

export interface BaseProps<S extends string = never> {
  /**
   * 类名
   */
  className?: string;
  /**
   * 样式
   */
  style?: CSSProperties & Partial<Record<S, string>>;
}

export function withBaseProps<P extends BaseProps>(props: P, element: ReactElement) {
  const p = {
    ...element.props,
  };
  if (props.className) {
    p.className = classNames(element.props.className, props.className);
  }
  if (props.style) {
    p.style = {
      ...p.style,
      ...props.style,
    };
  }
  return React.cloneElement(element, p);
}

import type { CSSProperties, MouseEvent, ReactElement } from 'react';
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

export function composeExportComponent<C, O extends Record<string, any>>(com: C, otherCom: O): C & O {
  const res = com as any;
  for (const key in otherCom) {
    if (Object.hasOwn(otherCom, key)) {
      res[key] = otherCom[key];
    }
  }
  return res;
}

export function stopPropagation(e: MouseEvent<any>, event?: (...params: any[]) => void, ...params: any[]) {
  e.stopPropagation();
  event?.(...params);
}

export const mergerProps = Object.assign;

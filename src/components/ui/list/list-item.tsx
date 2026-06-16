import type { FC, ReactNode } from 'react';
import classNames from 'classnames';
import React from 'react';
import Icon from '../icon';

const classPrefix = `bwm-list-item`;

export interface ListItemProps {
  /**
   * 左侧插槽
   */
  prefix?: ReactNode;
  /**
   * 显示内容
   */
  children?: ReactNode;
  /**
   * 右侧拓展插槽
   */
  extra?: ReactNode;
  /**
   * 是否允许点击
   */
  disabled?: boolean;
  /**
   * 是否开启点击效果
   */
  clickable?: boolean;
  /**
   * 是否展示右侧箭头
   */
  arrow?: boolean | ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const ListItem: FC<ListItemProps> = (props) => {
  const clickable = props.clickable ?? !!props.onClick;
  const arrow = props.arrow === undefined ? clickable : props.arrow;

  const content = (
    <div className={`${classPrefix}-content`} style={props.style}>
      {props.prefix && <div className={`${classPrefix}-content-prefix`}>{props.prefix}</div>}
      <div className={`${classPrefix}-content-main`}>{props.children}</div>
      {props.extra && <div className={`${classPrefix}-content-extra`}>{props.extra}</div>}
      {arrow && (
        <div className={`${classPrefix}-content-arrow`}>
          {arrow === true ? <Icon name="right" /> : arrow}
        </div>
      )}
    </div>
  );

  return React.createElement(
    clickable ? 'a' : 'div',
    {
      className: classNames(
        `${classPrefix}`,
        clickable ? ['adm-plain-anchor'] : [],
        props.disabled && `${classPrefix}-disabled`,
      ),
      onClick: props.onClick,
    },
    content,
  );
};

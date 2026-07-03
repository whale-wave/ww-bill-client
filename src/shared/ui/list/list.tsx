import type { FC } from 'react';
import classNames from 'classnames';
import React from 'react';

const classPrefix = `bwm-list`;

export interface ListProps {
  style?: React.CSSProperties;
  mode?: 'default' | 'card';
  children?: React.ReactNode;
}

const defaultProps = {
  mode: 'default',
};

export const List: FC<ListProps> = (p) => {
  const props = Object.assign({}, defaultProps, p);
  return (
    <div className={classNames(classPrefix, `${classPrefix}-${props.mode}`)} style={props.style}>
      <div className={`${classPrefix}-body`}>
        <div className={`${classPrefix}-body-inner`}>{props.children}</div>
      </div>
    </div>
  );
};

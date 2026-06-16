import type { FC } from 'react';
import classNames from 'classnames';
import React from 'react';
import { mergerProps } from '../../utils';

export interface SwitchProps {
  /**
   * 是否打开
   * @default false
   */
  checked?: boolean;
  /**
   * 初始值
   * @default false
   */
  defaultChecked?: boolean;
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * 切换状态时触发
   */
  onChange?: (val: boolean) => void;
}

const classPrefix = 'bwm-switch';

const defaultProps = {
  checked: false,
  defaultChecked: false,
  disabled: false,
};

export const Switch: FC<SwitchProps> = (p) => {
  const props = mergerProps({ ...defaultProps }, p);

  const handleClick = () => {
    if (props.disabled)
      return;
    props.onChange?.(!props.checked);
  };

  return (
    <div
      className={classNames(classPrefix, {
        [`${classPrefix}-checked`]: props.checked || props.defaultChecked,
        [`${classPrefix}-disabled`]: props.disabled,
      })}
      onClick={handleClick}
    >
      <div className={`${classPrefix}-checkbox`}>
        <div className={`${classPrefix}-handle`}></div>
      </div>
    </div>
  );
};

import type { ChangeEventHandler, CSSProperties, FC, ReactNode } from 'react';

const classPrefix = `bwm-input`;

export interface InputProps {
  className?: string;
  label?: ReactNode;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  style?: CSSProperties;
  suffix?: ReactNode;
  type?: string;
  value?: string | number;
}

export const Input: FC<InputProps> = ({
  className = '',
  label = 'input',
  onChange,
  placeholder,
  style,
  suffix,
  type = 'text',
  value,
}) => {
  return (
    <label className={`${classPrefix}-wrapper ${className}`} style={style}>
      {label && <span className={`${classPrefix}-name`}>{label}</span>}
      <input
        className={classPrefix}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {suffix && <span className={`${classPrefix}-suffix`}>{suffix}</span>}
    </label>
  );
};

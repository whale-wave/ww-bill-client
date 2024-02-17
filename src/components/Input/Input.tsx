import { CSSProperties, ChangeEventHandler, FC, ReactNode } from 'react';
import c from 'classnames';

const classPrefix = `wwb-input`;

type InputProps = {
  className?: string;
  label?: string;
  value?: string | number;
  type?: string;
  placeholder?: string;
  suffix?: ReactNode;
  style?: CSSProperties;
  onChange?: ChangeEventHandler;
};

export const Input: FC<InputProps> = ({
  className = '',
  label = 'input',
  type = 'text',
  value,
  placeholder,
  suffix,
  style,
  onChange,
}) => {
  return (
    <label
      className={c(
        className,
        `${classPrefix}-wrapper`,
        'flex overflow-hidden items-center',
      )}
      style={style}
    >
      {label && <span className={`${classPrefix}-name`}>{label}</span>}
      <div className={c(classPrefix, 'flex-grow-1')}>
        <input
          className={c('w-full h-full')}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          value={value}
        />
      </div>
      <div className="flex-shrink-0 px-2 text-[15px]">{suffix || ''}</div>
    </label>
  );
};

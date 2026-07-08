import type { FC } from 'react';
import { Input } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons';
import classNames from 'classnames';
import { useCallback, useState } from 'react';

const WwInput: FC<{
  className?: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  type?: 'text' | 'password';
  onEnterPress?: () => void;
}> = (_props) => {
  const props = _props;
  const { className, clearable, onEnterPress } = props;
  const [type, setType] = useState(props.type);

  const onChange = useCallback((v: string) => {
    props.onChange?.(v);
  }, []);

  return (
    <div
      className={classNames(
        'bg-[#f6f7f8] w-[80%] min-h-[48px] flex items-center rounded-[12px] px-4',
        className,
      )}
    >
      <Input
        type={type}
        className="placeholder:text-[red]"
        placeholder={props.placeholder}
        clearable={clearable}
        onlyShowClearWhenFocus={false}
        value={props.value}
        onChange={onChange}
        readOnly={props.readonly}
        disabled={props.disabled}
        onEnterPress={onEnterPress}
      />
      {props.type === 'password' && (
        <div
          className="flex-shrink-0"
          onClick={() => setType(type === 'text' ? 'password' : 'text')}
        >
          {type === 'text'
            ? (
                <EyeOutline
                  className="text-xl"
                  onClick={() => setType('text')}
                />
              )
            : (
                <EyeInvisibleOutline
                  className="text-xl"
                  onClick={() => setType('password')}
                />
              )}
        </div>
      )}
    </div>
  );
};

export default WwInput;

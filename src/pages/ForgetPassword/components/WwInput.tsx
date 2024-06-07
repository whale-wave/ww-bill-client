import { Input } from 'antd-mobile';
import { FC, useCallback, useState } from 'react';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons';

const WwInput: FC<{
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
  const { clearable, onEnterPress } = props;
  const [type, setType] = useState(props.type);

  const onChange = useCallback((v: string) => {
    props.onChange?.(v);
  }, []);

  return (
    <div
      className={
        'bg-[#f6f7f8] w-[80%] min-h-[48px] flex items-center rounded-[12px] px-4'
      }
    >
      <Input
        type={type}
        className={'placeholder:text-[red]'}
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
          className={'flex-shrink-0'}
          onClick={() => setType(type === 'text' ? 'password' : 'text')}
        >
          {type === 'text' ? (
            <EyeOutline
              className={'text-[20px]'}
              onClick={() => setType('text')}
            />
          ) : (
            <EyeInvisibleOutline
              className={'text-[20px]'}
              onClick={() => setType('password')}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default WwInput;

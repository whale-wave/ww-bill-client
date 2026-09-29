import type { FC } from 'react';
import classNames from 'classnames';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/shared/ui/konsta-compat';

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

  const handleChange = (v: string) => {
    props.onChange?.(v);
  };

  return (
    <div
      className={classNames(
        'bg-ww-surface-tint w-[80%] min-h-[48px] flex items-center rounded-[12px] px-4',
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
        onChange={handleChange}
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
                <Eye
                  className="h-5 w-5"
                  onClick={() => setType('text')}
                />
              )
            : (
                <EyeOff
                  className="h-5 w-5"
                  onClick={() => setType('password')}
                />
              )}
        </div>
      )}
    </div>
  );
};

export default WwInput;

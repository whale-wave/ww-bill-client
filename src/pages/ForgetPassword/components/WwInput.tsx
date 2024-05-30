import { Input } from 'antd-mobile';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons';

const WwInput: FC<{
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  type?: 'text' | 'password';
}> = (_props) => {
  const props = _props;
  const { clearable } = props;
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
      />
      {props.type === 'password' && (
        <div
          className={'flex-shrink-0'}
          onClick={() => setType(type === 'text' ? 'password' : 'text')}
        >
          {type === 'text' ? (
            <EyeOutline onClick={() => setType('text')} />
          ) : (
            <EyeInvisibleOutline onClick={() => setType('password')} />
          )}
        </div>
      )}
    </div>
  );
};

export default WwInput;

const COUNTDOWN_TIME = 10;

export const WwInputVerifyCode: FC<{
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  isSend?: boolean;
  startTime?: Dayjs;
  setStartTime: (time?: Dayjs) => void;
  onSend?: () => Promise<boolean>;
}> = (_props) => {
  const props = _props;
  const { startTime, setStartTime } = props;
  const [now, setNow] = useState<Dayjs>();

  const onChange = useCallback((v: string) => {
    props.onChange?.(v);
  }, []);

  const onSend = useCallback(async () => {
    const success = await props.onSend?.();
    if (success) {
      setStartTime(dayjs());
      setNow(dayjs());
    }
  }, [props.onSend]);

  useEffect(() => {
    if (!startTime || !now) return;

    const timer = setInterval(() => {
      if (now.diff(startTime, 'second') < COUNTDOWN_TIME) {
        setNow(dayjs());
      } else {
        setNow(undefined);
        clearInterval(timer);
      }
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, [startTime, now]);

  const remainingTime = useMemo(() => {
    if (!startTime || !now) return 0;
    return COUNTDOWN_TIME - now.diff(startTime, 'second');
  }, [startTime, now]);

  return (
    <div
      className={
        'bg-[#f6f7f8] w-[80%] min-h-[48px] flex items-center rounded-[12px] px-4'
      }
    >
      <Input
        className={'placeholder:text-[red]'}
        placeholder={props.placeholder}
        clearable
        onlyShowClearWhenFocus={false}
        value={props.value}
        onChange={onChange}
        maxLength={6}
      />
      {!remainingTime ? (
        <div className={'flex-shrink-0'} onClick={onSend}>
          重新获取
        </div>
      ) : (
        <div className={'flex-shrink-0 text-[#ccc]'}>
          {remainingTime}s重新获取
        </div>
      )}
    </div>
  );
};

import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import { Input } from 'antd-mobile';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';

const COUNTDOWN_TIME_SECOND = 60;

const WwInputVerifyCode: FC<{
  className?: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  isSend?: boolean;
  startTime?: Dayjs;
  setStartTime: (time?: Dayjs) => void;
  onSend?: () => Promise<boolean>;
  autoCountdown?: boolean;
}> = (_props) => {
  const props = _props;
  const { startTime, setStartTime, autoCountdown = false, className } = props;
  const [now, setNow] = useState<Dayjs>();

  const onChange = useCallback((v: string) => {
    props.onChange?.(v);
  }, []);

  const startCountdown = useCallback(() => {
    setStartTime(dayjs());
    setNow(dayjs());
  }, []);

  const onSend = useCallback(async () => {
    const success = await props.onSend?.();
    if (success) {
      startCountdown();
    }
  }, [props.onSend]);

  useEffect(() => {
    if (!startTime || !now)
      return;

    const timer = setInterval(() => {
      if (now.diff(startTime, 'second') < COUNTDOWN_TIME_SECOND) {
        setNow(dayjs());
      }
      else {
        setNow(undefined);
        clearInterval(timer);
      }
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, [startTime, now]);

  const remainingTime = useMemo(() => {
    if (!startTime || !now)
      return 0;
    return COUNTDOWN_TIME_SECOND - now.diff(startTime, 'second');
  }, [startTime, now]);

  useEffect(() => {
    if (autoCountdown) {
      startCountdown();
    }
  }, [autoCountdown]);

  return (
    <div
      className={classNames(
        'bg-[#f6f7f8] w-[80%] min-h-[48px] flex items-center rounded-[12px] px-4',
        className,
      )}
    >
      <Input
        className="placeholder:text-[red]"
        placeholder={props.placeholder}
        clearable
        onlyShowClearWhenFocus={false}
        value={props.value}
        onChange={onChange}
        maxLength={6}
      />
      {!remainingTime
        ? (
            <div className="flex-shrink-0" onClick={onSend}>
              重新获取
            </div>
          )
        : (
            <div className="flex-shrink-0 text-[#ccc]">
              {remainingTime}
              s重新获取
            </div>
          )}
    </div>
  );
};

export default WwInputVerifyCode;

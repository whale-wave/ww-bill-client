import { type FC, useEffect, useRef } from 'react';
import { themeColor } from '@/assets/styles/reset';

export const ProgressBar: FC<{
  percent: number;
  color?: string;
}> = ({ percent, color = themeColor }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current!;
    const bar = barRef.current!;
    let width = wrapper.clientWidth * percent;
    const MIN_WIDTH = 4;
    if (width < MIN_WIDTH) {
      width = MIN_WIDTH;
    }
    bar.style.width = `${width}px`;
  }, [percent]);

  return (
    <div className="flex-grow h-[5px]" ref={wrapperRef}>
      <div className="h-full rounded-full" ref={barRef} style={{ background: color }} />
    </div>
  );
};

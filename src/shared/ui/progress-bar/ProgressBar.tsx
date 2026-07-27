import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { THEME_COLOR } from '@/assets/styles/reset';

export const ProgressBar: FC<{
  color?: string;
  percent: number;
}> = ({ color = THEME_COLOR, percent }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current!;
    const bar = barRef.current!;
    let width = wrapper.clientWidth * percent;
    const minWidth = 4;
    if (width < minWidth)
      width = minWidth;
    bar.style.width = `${width}px`;
  }, [percent]);

  return (
    <div className="h-[5px] flex-grow" ref={wrapperRef}>
      <div className="h-full rounded-full" ref={barRef} style={{ background: color }} />
    </div>
  );
};

import type { FC } from 'react';
import { cn } from '@/shared/lib';

interface PatternGestureProps {
  disabled?: boolean;
  onChange: (pattern: number[]) => void;
  pattern: number[];
}

export const PatternGesture: FC<PatternGestureProps> = ({
  disabled,
  onChange,
  pattern,
}) => (
  <div
    className="grid grid-cols-3 gap-5 rounded-[28px] bg-white/70 p-7 shadow-ww"
    data-pattern-gesture
  >
    {Array.from({ length: 9 }, (_, index) => index + 1).map((point) => {
      const selected = pattern.includes(point);
      return (
        <button
          aria-pressed={selected}
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full border-2 transition',
            selected
              ? 'border-primary bg-primary text-white shadow-[0_0_0_7px_rgba(73,169,191,0.16)]'
              : 'border-border-primary bg-white text-ww-soft',
          )}
          disabled={disabled || selected}
          key={point}
          onClick={() => onChange([...pattern, point])}
          type="button"
        >
          <span className="h-3 w-3 rounded-full bg-current" />
          <span className="sr-only">{point}</span>
        </button>
      );
    })}
  </div>
);

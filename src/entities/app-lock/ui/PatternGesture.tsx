import type { FC } from 'react';
import { useRef } from 'react';
import { cn } from '@/shared/lib';

interface PatternGestureProps {
  disabled?: boolean;
  onChange: (pattern: number[]) => void;
  pattern: number[];
}

const PatternGestureGrid: FC<PatternGestureProps> = ({
  disabled,
  onChange,
  pattern,
}) => {
  const pointerActivationRef = useRef(false);
  return (
    <div
      className="grid grid-cols-3 touch-none select-none gap-5 rounded-[28px] bg-white/70 p-7 shadow-ww"
      data-pattern-gesture
    >
      {Array.from({ length: 9 }, (_, index) => index + 1).map((point) => {
        const selected = pattern.includes(point);
        const appendPoint = () => {
          if (!disabled && !selected)
            onChange([...pattern, point]);
        };
        return (
          <button
            aria-pressed={selected}
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full border-2 transition',
              selected
                ? 'border-primary bg-primary text-white shadow-[0_0_0_7px_rgba(73,169,191,0.16)]'
                : 'border-border-primary bg-white text-ww-soft',
            )}
            disabled={disabled}
            key={point}
            onClick={() => {
              if (pointerActivationRef.current) {
                pointerActivationRef.current = false;
                return;
              }
              appendPoint();
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              pointerActivationRef.current = true;
              appendPoint();
            }}
            onPointerEnter={(event) => {
              if (event.buttons === 1)
                appendPoint();
            }}
            type="button"
          >
            <span className="h-3 w-3 rounded-full bg-current" />
            <span className="sr-only">{point}</span>
          </button>
        );
      })}
    </div>
  );
};

export const PatternGesture: FC<PatternGestureProps> = props => (
  <PatternGestureGrid {...props} />
);

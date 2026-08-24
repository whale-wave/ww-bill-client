import type { FC, PointerEvent as ReactPointerEvent } from 'react';
import { useRef } from 'react';
import { cn } from '@/shared/lib';

interface PatternGestureProps {
  disabled?: boolean;
  onChange: (pattern: number[]) => void;
  pattern: number[];
}

const POINTS = [
  { id: 1, x: 16.67, y: 16.67 },
  { id: 2, x: 50, y: 16.67 },
  { id: 3, x: 83.33, y: 16.67 },
  { id: 4, x: 16.67, y: 50 },
  { id: 5, x: 50, y: 50 },
  { id: 6, x: 83.33, y: 50 },
  { id: 7, x: 16.67, y: 83.33 },
  { id: 8, x: 50, y: 83.33 },
  { id: 9, x: 83.33, y: 83.33 },
] as const;

function getPoint(pointId: number) {
  return POINTS.find(point => point.id === pointId);
}

function getPointIdAtPosition(
  event: ReactPointerEvent<SVGSVGElement>,
  svg: SVGSVGElement,
) {
  const rect = svg.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  const closest = POINTS
    .map(point => ({
      ...point,
      distance: Math.hypot(point.x - x, point.y - y),
    }))
    .sort((left, right) => left.distance - right.distance)[0];
  return closest && closest.distance <= 14 ? closest.id : null;
}

function getIntermediatePoint(fromId: number, toId: number) {
  const from = getPoint(fromId);
  const to = getPoint(toId);
  if (!from || !to)
    return null;
  const midpointX = (from.x + to.x) / 2;
  const midpointY = (from.y + to.y) / 2;
  return POINTS.find(
    point => point.id !== fromId && point.id !== toId
      && Math.abs(point.x - midpointX) < 0.1
      && Math.abs(point.y - midpointY) < 0.1,
  )?.id ?? null;
}

export const PatternGesture: FC<PatternGestureProps> = ({
  disabled,
  onChange,
  pattern,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const drawingRef = useRef(false);
  const patternRef = useRef(pattern);
  patternRef.current = pattern;

  const appendPoint = (pointId: number) => {
    const currentPattern = patternRef.current;
    if (disabled || currentPattern.includes(pointId))
      return;
    const previousPoint = currentPattern.at(-1);
    const intermediatePoint = previousPoint === undefined
      ? null
      : getIntermediatePoint(previousPoint, pointId);
    const nextPattern = intermediatePoint !== null
      && !currentPattern.includes(intermediatePoint)
      ? [...currentPattern, intermediatePoint, pointId]
      : [...currentPattern, pointId];
    patternRef.current = nextPattern;
    onChange(nextPattern);
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (disabled || !svgRef.current)
      return;
    event.preventDefault();
    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointId = getPointIdAtPosition(event, svgRef.current);
    if (pointId !== null)
      appendPoint(pointId);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drawingRef.current || !svgRef.current)
      return;
    const pointId = getPointIdAtPosition(event, svgRef.current);
    if (pointId !== null)
      appendPoint(pointId);
  };

  const stopDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    drawingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      className={cn(
        'w-[min(92vw,360px)] rounded-[28px] bg-white/70 p-2 shadow-ww',
        disabled && 'opacity-60',
      )}
      data-pattern-gesture
    >
      <svg
        aria-label="Pattern lock"
        className="block aspect-square w-full touch-none"
        onPointerCancel={stopDrawing}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        ref={svgRef}
        role="application"
        viewBox="0 0 100 100"
      >
        {pattern.slice(1).map((pointId, index) => {
          const from = getPoint(pattern[index]);
          const to = getPoint(pointId);
          if (!from || !to)
            return null;
          return (
            <line
              className="stroke-primary"
              key={`${pattern[index]}-${pointId}`}
              strokeLinecap="round"
              strokeWidth="2.5"
              x1={from.x}
              x2={to.x}
              y1={from.y}
              y2={to.y}
            />
          );
        })}
        {POINTS.map((point) => {
          const selected = pattern.includes(point.id);
          return (
            <g key={point.id}>
              <circle
                className={cn(
                  selected ? 'fill-primary' : 'fill-white',
                  'stroke-primary',
                )}
                cx={point.x}
                cy={point.y}
                r={selected ? 5 : 4}
                strokeWidth="1.5"
              />
              <circle
                className="fill-transparent"
                cx={point.x}
                cy={point.y}
                r="10"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

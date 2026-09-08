import type { Dayjs } from 'dayjs';

export const CALENDAR_SWIPE_MIN_DISTANCE = 48;
export const CALENDAR_SWIPE_DIRECTION_RATIO = 1.25;

const CALENDAR_SWIPE_MIN_VELOCITY = 520;

export function getCalendarWeekStart(date: Dayjs): Dayjs {
  const daysSinceMonday = (date.day() + 6) % 7;
  return date.startOf('day').subtract(daysSinceMonday, 'day');
}

export function getCalendarDragDirection({
  offsetX,
  offsetY,
  velocityX,
  velocityY,
}: {
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
}): -1 | 0 | 1 {
  const hasHorizontalDistance = Math.abs(offsetX) >= CALENDAR_SWIPE_MIN_DISTANCE
    && Math.abs(offsetX) >= Math.abs(offsetY) * CALENDAR_SWIPE_DIRECTION_RATIO;
  const hasHorizontalVelocity = Math.abs(velocityX) >= CALENDAR_SWIPE_MIN_VELOCITY
    && Math.abs(velocityX) >= Math.abs(velocityY) * CALENDAR_SWIPE_DIRECTION_RATIO;
  if (!hasHorizontalDistance && !hasHorizontalVelocity)
    return 0;

  const horizontalIntent = hasHorizontalDistance ? offsetX : velocityX;
  return horizontalIntent < 0 ? 1 : -1;
}

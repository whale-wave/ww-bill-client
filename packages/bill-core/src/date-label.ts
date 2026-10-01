/** Formatting only: hosts retain timezone and language selection. */
export function formatMonthDay(month: number, day: number, { monthSuffix, daySuffix }: { monthSuffix: string; daySuffix: string }): string {
  return `${String(month).padStart(2, '0')}${monthSuffix}${String(day).padStart(2, '0')}${daySuffix}`;
}

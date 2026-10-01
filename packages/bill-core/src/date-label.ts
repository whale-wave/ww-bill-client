/** Formatting only: hosts retain timezone and language selection. */
export function formatMonthDay(month: number, day: number, { monthSuffix, daySuffix }: { monthSuffix: string; daySuffix: string }): string {
  return `${String(month).padStart(2, '0')}${monthSuffix}${String(day).padStart(2, '0')}${daySuffix}`;
}

/** Month keys come from each host's own timezone adapter. */
export function formatMonthPeriod(month: string, currentMonth: string, labels: {
  thisMonth: string;
  lastMonth: string;
  monthNumber: (month: number) => string;
  yearMonthNumber: (year: number, month: number) => string;
}): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const [currentYear, currentMonthNumber] = currentMonth.split('-').map(Number);
  if (month === currentMonth)
    return labels.thisMonth;
  const previousMonth = currentMonthNumber === 1 ? `${currentYear - 1}-12` : `${currentYear}-${String(currentMonthNumber - 1).padStart(2, '0')}`;
  if (month === previousMonth)
    return labels.lastMonth;
  return year === currentYear ? labels.monthNumber(monthNumber) : labels.yearMonthNumber(year, monthNumber);
}

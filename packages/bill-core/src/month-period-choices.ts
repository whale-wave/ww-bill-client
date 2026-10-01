/** Calendar geometry only; hosts provide their own current date key. */
export function getMonthPeriodChoices(year: number, today: string): Array<{ anchorDate: string; startDate: string; endDate: string }> {
  return Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, '0')}`;
    const startDate = `${month}-01`;
    const lastDay = new Date(Date.UTC(year, index + 1, 0)).getUTCDate();
    return { anchorDate: startDate, startDate, endDate: `${month}-${lastDay}` };
  }).filter(choice => choice.startDate <= today);
}

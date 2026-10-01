export type CalendarParts = [number, number, number, number, number, number];

/** Dependent calendar columns, including boundary times and short months. */
export function calendarWheel(parts: CalendarParts, min: CalendarParts, max: CalendarParts) {
  const selected: number[] = [];
  const columns: number[][] = [];
  for (let index = 0; index < 6; index++) {
    const lower = index === 0 ? min[0] : index < 3 ? 1 : 0;
    const upper = index === 0 ? max[0] : index === 1 ? 12 : index === 2 ? new Date(Date.UTC(selected[0], selected[1], 0)).getUTCDate() : index === 3 ? 23 : 59;
    const atMin = selected.every((value, position) => value === min[position]);
    const atMax = selected.every((value, position) => value === max[position]);
    const from = atMin ? Math.max(lower, min[index]) : lower;
    const to = atMax ? Math.min(upper, max[index]) : upper;
    columns.push(Array.from({ length: to - from + 1 }, (_, offset) => from + offset));
    selected.push(Math.max(from, Math.min(to, parts[index])));
  }
  return { columns, selected: selected as CalendarParts, indices: columns.map((values, index) => values.indexOf(selected[index])) };
}

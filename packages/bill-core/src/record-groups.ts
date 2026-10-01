import { money } from './amount';

export function groupRecordsByKey<T>(records: readonly T[], keyFor: (record: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const record of records) {
    const key = keyFor(record);
    const group = groups.get(key);
    if (group)
      group.push(record);
    else
      groups.set(key, [record]);
  }
  return groups;
}

export function sumRecordAmounts(records: readonly { type: string; amount: string | number }[]) {
  let income = '0';
  let expense = '0';
  for (const record of records) {
    if (record.type === 'add')
      income = money.add(income, record.amount);
    else if (record.type === 'sub')
      expense = money.add(expense, record.amount);
  }
  return { income, expense };
}

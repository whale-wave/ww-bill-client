import { math } from '@/shared/lib';

interface BreakdownRecord {
  amount: string | number;
  category?: { id: number; name: string; parentId?: number | null };
}

export function SubcategoryBreakdown({ records, items }: { records: readonly BreakdownRecord[]; items?: Array<{ key: string; name: string; amount: string }> }) {
  if (items ? !items.length : !records.some(record => record.category?.parentId))
    return null;
  const amounts = new Map<string, { name: string; amount: string }>(items?.map(item => [item.key, item]));
  for (const record of items ? [] : records) {
    const key = record.category?.parentId ? String(record.category.id) : 'direct';
    const current = amounts.get(key) ?? { name: record.category?.parentId ? record.category.name : '未细分', amount: '0' };
    amounts.set(key, { ...current, amount: math.add(current.amount, record.amount).toString() });
  }
  return (
    <section className="rounded-2xl bg-ww-surface p-4" aria-label="二级分类明细">
      <h2 className="mb-2 text-sm font-bold text-ww-ink">二级分类明细</h2>
      {[...amounts].map(([key, item]) => (
        <div key={key} className="flex justify-between gap-4 py-2 text-sm">
          <span>{item.name}</span>
          <span>
            ¥
            {math.add(item.amount, 0).toFixed(2)}
          </span>
        </div>
      ))}
    </section>
  );
}

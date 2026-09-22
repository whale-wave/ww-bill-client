import { useLedgerTagRankingQuery, useTagRankingQuery } from '@/entities/chart';
import { useHouseholdTagRankingQuery } from '@/entities/household';
import { TagRankingSection } from './TagRankingSection';

interface Props {
  startDate?: string;
  endDate?: string;
  type: 'add' | 'sub';
  ledgerId?: string;
  householdId?: string;
}
interface RangeProps {
  startDate: string;
  endDate: string;
  type: 'add' | 'sub';
}
function PersonalTagRanking({ startDate, endDate, type }: RangeProps) {
  const query = useTagRankingQuery({ params: { startDate, endDate, type } });
  return <TagRankingSection data={query.data} isLoading={query.isLoading} isError={query.isError} />;
}
function LedgerTagRanking({ ledgerId, startDate, endDate, type }: RangeProps & { ledgerId: string }) {
  const query = useLedgerTagRankingQuery({ params: { ledgerId, filters: { startDate, endDate, type } } });
  return <TagRankingSection data={query.data} isLoading={query.isLoading} isError={query.isError} />;
}
function HouseholdTagRanking({ householdId, startDate, endDate, type }: RangeProps & { householdId: string }) {
  const query = useHouseholdTagRankingQuery({ params: { householdId, filters: { startDate, endDate, metric: type === 'sub' ? 'expense' : 'income' } } });
  return <TagRankingSection data={query.data} isLoading={query.isLoading} isError={query.isError} />;
}
export function GlobalTagRanking({ startDate, endDate, type, ledgerId, householdId }: Props) {
  if (!startDate || !endDate)
    return null;
  const start = startDate.length === 10 ? `${startDate}T00:00:00+08:00` : startDate;
  const inclusiveEnd = endDate.length === 10 ? `${endDate}T23:59:59+08:00` : endDate;
  if (householdId)
    return <HouseholdTagRanking householdId={householdId} type={type} startDate={start} endDate={inclusiveEnd} />;
  const end = new Date(new Date(inclusiveEnd).getTime() + 1000).toISOString();
  const filters = { type, startDate: start, endDate: end };
  return ledgerId ? <LedgerTagRanking ledgerId={ledgerId} {...filters} /> : <PersonalTagRanking {...filters} />;
}

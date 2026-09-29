import { useDisplayPreference } from './useDisplayPreference';

export function useHouseholdAmountPreference(householdId: string, legacyValue?: boolean) {
  return useDisplayPreference(`household:${householdId}`, 'hide-total', legacyValue);
}

export function useLedgerAmountPreferences(
  ledgerId: string,
  legacy?: { hideTotalAmount: boolean; showDailySummary: boolean },
) {
  const [hideTotalAmount, setHideTotalAmount] = useDisplayPreference(`ledger:${ledgerId}`, 'hide-total', legacy?.hideTotalAmount);
  const [showDailySummary, setShowDailySummary] = useDisplayPreference(`ledger:${ledgerId}`, 'daily-summary', legacy?.showDailySummary, true);
  return { hideTotalAmount, setHideTotalAmount, showDailySummary, setShowDailySummary };
}

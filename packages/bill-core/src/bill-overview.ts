import type { MoneyInput } from './amount';

/** Match the existing Web overview, accepting the miniapp API's string amounts. */
export function formatBillOverviewAmount(value?: MoneyInput | null) {
  return `¥${value == null ? '0.00' : Number(value)}`;
}

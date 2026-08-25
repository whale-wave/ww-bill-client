import type { GetRecordApiParams, GetRecordBillApiParams } from './api';

export const recordKeys = {
  all: ['record'] as const,
  lists: () => [...recordKeys.all, 'list'] as const,
  list: (params?: GetRecordApiParams) => [...recordKeys.lists(), params] as const,
  filterOptions: () => [...recordKeys.all, 'filter-options'] as const,
  ledgerRoot: (ledgerId: string) => [...recordKeys.all, 'ledger', ledgerId] as const,
  ledgerListRoot: (ledgerId: string) => [...recordKeys.ledgerRoot(ledgerId), 'list'] as const,
  ledgerList: (ledgerId: string, params?: GetRecordApiParams) => [
    ...recordKeys.ledgerListRoot(ledgerId),
    params,
  ] as const,
  ledgerFilterOptions: (ledgerId: string) => [
    ...recordKeys.ledgerRoot(ledgerId),
    'filter-options',
  ] as const,
  ledgerDetails: (ledgerId: string) => [...recordKeys.ledgerRoot(ledgerId), 'detail'] as const,
  ledgerDetail: (ledgerId: string, recordId: string) => [
    ...recordKeys.ledgerDetails(ledgerId),
    recordId,
  ] as const,
  ledgerBills: (ledgerId: string) => [...recordKeys.ledgerRoot(ledgerId), 'bill'] as const,
  ledgerBill: (ledgerId: string, params: GetRecordBillApiParams) => [
    ...recordKeys.ledgerBills(ledgerId),
    params,
  ] as const,
  householdRoot: (householdId: string) => [...recordKeys.all, 'household', householdId] as const,
  householdBills: (householdId: string) => [
    ...recordKeys.householdRoot(householdId),
    'bill',
  ] as const,
  householdBill: (householdId: string, params: GetRecordBillApiParams) => [
    ...recordKeys.householdBills(householdId),
    params,
  ] as const,
  details: () => [...recordKeys.all, 'detail'] as const,
  detail: (params: { id: string }) => [...recordKeys.details(), params.id] as const,
  bills: () => [...recordKeys.all, 'bill'] as const,
  bill: (params: GetRecordBillApiParams) => [...recordKeys.bills(), params] as const,
  billMonthDetail: (month: string) => [...recordKeys.bills(), 'month-detail', month] as const,
};

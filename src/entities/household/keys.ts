import type {
  GetHouseholdBudgetsApiParams,
  GetHouseholdChartPeriodsApiParams,
  GetHouseholdChartsApiParams,
  GetHouseholdRecordsApiParams,
} from './api';

export const householdKeys = {
  all: ['household'] as const,
  mine: () => [...householdKeys.all, 'mine'] as const,
  details: () => [...householdKeys.all, 'detail'] as const,
  detail: (householdId: string) => [...householdKeys.details(), householdId] as const,
  memberRoot: () => [...householdKeys.all, 'member'] as const,
  members: (householdId: string) => [...householdKeys.memberRoot(), householdId] as const,
  preferenceRoot: () => [...householdKeys.all, 'preference'] as const,
  preferences: (householdId: string) => [
    ...householdKeys.preferenceRoot(),
    householdId,
  ] as const,
  invitationRoot: () => [...householdKeys.all, 'invitation'] as const,
  invitation: (householdId: string) => [
    ...householdKeys.invitationRoot(),
    householdId,
  ] as const,
  invitationPreviewRoot: () => [...householdKeys.all, 'invitation-preview'] as const,
  invitationPreview: (code: string) => [
    ...householdKeys.invitationPreviewRoot(),
    code,
  ] as const,
  recordRoot: () => [...householdKeys.all, 'record'] as const,
  recordsRoot: (householdId: string) => [
    ...householdKeys.recordRoot(),
    householdId,
  ] as const,
  records: (householdId: string, params?: GetHouseholdRecordsApiParams) => [
    ...householdKeys.recordsRoot(householdId),
    params,
  ] as const,
  recordFilterOptions: (householdId: string) => [
    ...householdKeys.recordsRoot(householdId),
    'filter-options',
  ] as const,
  recordPages: (householdId: string, params?: GetHouseholdRecordsApiParams) => [
    ...householdKeys.recordsRoot(householdId),
    'pages',
    params,
  ] as const,
  record: (householdId: string, recordId: number) => [
    ...householdKeys.recordsRoot(householdId),
    recordId,
  ] as const,
  recordPolicyRoot: () => [...householdKeys.all, 'record-policy'] as const,
  recordPolicy: (householdId: string, recordId: number) => [
    ...householdKeys.recordPolicyRoot(),
    householdId,
    recordId,
  ] as const,
  budgetRoot: () => [...householdKeys.all, 'budget'] as const,
  budgetsRoot: (householdId: string) => [
    ...householdKeys.budgetRoot(),
    householdId,
  ] as const,
  budgets: (householdId: string, params: GetHouseholdBudgetsApiParams) => [
    ...householdKeys.budgetsRoot(householdId),
    params,
  ] as const,
  chartRoot: () => [...householdKeys.all, 'chart'] as const,
  chartsRoot: (householdId: string) => [
    ...householdKeys.chartRoot(),
    householdId,
  ] as const,
  charts: (householdId: string, params: GetHouseholdChartsApiParams) => [
    ...householdKeys.chartsRoot(householdId),
    params,
  ] as const,
  tagRanking: (householdId: string, params: GetHouseholdChartsApiParams) => [
    ...householdKeys.chartsRoot(householdId),
    'tag-ranking',
    params,
  ] as const,
  chartPeriods: (householdId: string, params: GetHouseholdChartPeriodsApiParams) => [
    ...householdKeys.chartsRoot(householdId),
    'periods',
    params,
  ] as const,
  calendarRoot: () => [...householdKeys.all, 'calendar'] as const,
  calendarsRoot: (householdId: string) => [
    ...householdKeys.calendarRoot(),
    householdId,
  ] as const,
  calendar: (householdId: string, month: string) => [
    ...householdKeys.calendarsRoot(householdId),
    month,
  ] as const,
  exportRoot: () => [...householdKeys.all, 'export'] as const,
  exportsRoot: (householdId: string) => [
    ...householdKeys.exportRoot(),
    householdId,
  ] as const,
  exportTask: (householdId: string, taskId: string) => [
    ...householdKeys.exportsRoot(householdId),
    taskId,
  ] as const,
};

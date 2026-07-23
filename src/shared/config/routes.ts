function encodeRouteSegment(value: string | number) {
  return encodeURIComponent(String(value));
}

export const ROUTES_PATH = {
  DETAIL: {
    getPath: () => '/detail',
  },
  BOOKKEEPING: {
    getPath: () => '/bookkeeping',
  },
  BILL: {
    getPath: () => '/bill',
  },
  BUDGET: {
    getPath: () => '/budget',
  },
  ASSET: {
    getPath: () => '/asset',
  },
  ASSET_ADD_FORM: {
    getPath: (id?: string) => {
      if (id) {
        return `/asset/add-form/${id}`;
      }
      return '/asset/add-form';
    },
  },
  ASSET_ADD_ACCOUNT: {
    getPath: () => '/asset/add-account',
  },
  ASSET_DETAIL: {
    getPath: (id: string) => `/asset/detail/${id}`,
  },
  ASSET_CHART: {
    getPath: () => '/asset/chart',
  },
  CHART: {
    getPath: () => '/chart',
  },
  CATEGORY_SETTINGS: {
    getPath: () => '/category',
  },
  COMMUNITY: {
    getPath: () => '/community',
  },
  DISCOVERY: {
    getPath: () => '/discovery',
  },
  EXPORT_DATA: {
    getPath: () => '/export-data',
  },
  FIXED_EXPENSES: {
    getPath: () => '/fixed-expenses',
  },
  FIXED_EXPENSES_CREATE: {
    getPath: () => '/fixed-expenses/create',
  },
  FIXED_EXPENSES_DETAIL: {
    getPath: (id: string) => `/fixed-expenses/${id}`,
  },
  FIXED_EXPENSES_EDIT: {
    getPath: (id: string) => `/fixed-expenses/${id}/edit`,
  },
  INVOICE: {
    getPath: () => '/invoice',
  },
  HOUSEHOLD: {
    getPath: () => '/household',
  },
  HOUSEHOLD_CREATE: {
    getPath: () => '/household/create',
  },
  HOUSEHOLD_JOIN: {
    getPath: () => '/household/join',
  },
  HOUSEHOLD_INVITATION_PREVIEW: {
    getPath: (code: string) => `/household-invitations/${encodeRouteSegment(code)}`,
  },
  HOUSEHOLD_HOME: {
    getPath: (householdId: string) => `/households/${encodeRouteSegment(householdId)}`,
  },
  HOUSEHOLD_INVITATION: {
    getPath: (householdId: string) => `/households/${encodeRouteSegment(householdId)}/invitation`,
  },
  HOUSEHOLD_RECORDS: {
    getPath: (householdId: string) => `/households/${encodeRouteSegment(householdId)}/records`,
  },
  HOUSEHOLD_RECORD_SEARCH: {
    getPath: (householdId: string) => `/households/${encodeRouteSegment(householdId)}/records/search`,
  },
  HOUSEHOLD_RECORD_DETAIL: {
    getPath: (householdId: string, recordId: string | number) =>
      `/households/${encodeRouteSegment(householdId)}/records/${encodeRouteSegment(recordId)}`,
  },
  HOUSEHOLD_RECORD_POLICY: {
    getPath: (householdId: string, recordId: string | number) =>
      `/households/${encodeRouteSegment(householdId)}/records/${encodeRouteSegment(recordId)}/policy`,
  },
  HOUSEHOLD_CALENDAR: {
    getPath: (householdId: string) => `/households/${encodeRouteSegment(householdId)}/calendar`,
  },
  HOUSEHOLD_BUDGETS: {
    getPath: (householdId: string) => `/households/${encodeRouteSegment(householdId)}/budgets`,
  },
  HOUSEHOLD_CHARTS: {
    getPath: (householdId: string) => `/households/${encodeRouteSegment(householdId)}/charts`,
  },
  HOUSEHOLD_SETTINGS: {
    getPath: (householdId: string) => `/households/${encodeRouteSegment(householdId)}/settings`,
  },
  HOUSEHOLD_EXPORT: {
    getPath: (householdId: string) => `/households/${encodeRouteSegment(householdId)}/export`,
  },
  HOUSEHOLD_MEMBERS: {
    getPath: (householdId: string) => `/households/${encodeRouteSegment(householdId)}/members`,
  },
  LEDGERS: {
    getPath: () => '/ledgers',
  },
  LEDGER_TEMPLATES: {
    getPath: () => '/ledgers/templates',
  },
  LEDGER_CREATE: {
    getPath: () => '/ledgers/create',
  },
  LEDGER_DETAIL: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}`,
  },
  LEDGER_JOIN: {
    getPath: () => '/ledgers/join',
  },
  LEDGER_APPLICATIONS: {
    getPath: () => '/ledgers/applications',
  },
  LEDGER_PREFERENCES: {
    getPath: () => '/ledgers/preferences',
  },
  LEDGER_INVITE: {
    getPath: (code: string) => `/ledger-invites/${encodeRouteSegment(code)}`,
  },
  LEDGER_RECORDS: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/records`,
  },
  LEDGER_RECORD_CREATE: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/records/new`,
  },
  LEDGER_RECORD_DETAIL: {
    getPath: (ledgerId: string, recordId: string | number) =>
      `/ledgers/${encodeRouteSegment(ledgerId)}/records/${encodeRouteSegment(recordId)}`,
  },
  LEDGER_RECORD_EDIT: {
    getPath: (ledgerId: string, recordId: string | number) =>
      `/ledgers/${encodeRouteSegment(ledgerId)}/records/${encodeRouteSegment(recordId)}/edit`,
  },
  LEDGER_RECORD_SEARCH: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/records/search`,
  },
  LEDGER_CALENDAR: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/calendar`,
  },
  LEDGER_BILL: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/bill`,
  },
  LEDGER_BUDGET: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/budget`,
  },
  LEDGER_CHARTS: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/charts`,
  },
  LEDGER_EXPORT: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/export`,
  },
  LEDGER_MEMBERS: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/members`,
  },
  LEDGER_MEMBER_DETAIL: {
    getPath: (ledgerId: string, memberId: string) =>
      `/ledgers/${encodeRouteSegment(ledgerId)}/members/${encodeRouteSegment(memberId)}`,
  },
  LEDGER_INVITES: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/invites`,
  },
  LEDGER_JOIN_REQUESTS: {
    getPath: (ledgerId: string) =>
      `/ledgers/${encodeRouteSegment(ledgerId)}/join-requests`,
  },
  LEDGER_JOIN_REQUEST_DETAIL: {
    getPath: (ledgerId: string, requestId: string) =>
      `/ledgers/${encodeRouteSegment(ledgerId)}/join-requests/${encodeRouteSegment(requestId)}`,
  },
  LEDGER_SETTINGS: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/settings`,
  },
  LEDGER_CATEGORIES: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/settings/categories`,
  },
  LEDGER_TAGS: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/settings/tags`,
  },
  LEDGER_RECOVERY: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/recovery`,
  },
  LEDGER_TRANSFER: {
    getPath: (ledgerId: string) => `/ledgers/${encodeRouteSegment(ledgerId)}/transfer`,
  },
  MESSAGE: {
    getPath: () => '/message',
  },
  MESSAGE_NEW_FOLLOW: {
    getPath: () => '/message/new-follow',
  },
  MESSAGE_COMMENT_LIST: {
    getPath: () => '/message/comment-list',
  },
  MESSAGE_SYSTEM_NOTIFY: {
    getPath: () => '/message/system-notify',
  },
  MINE: {
    getPath: () => '/mine',
  },
  RECORD_CALENDAR: {
    getPath: () => '/record-calendar',
  },
  SEARCH_RECORD: {
    getPath: () => '/search-record',
  },
  SETTINGS: {
    getPath: () => '/settings',
  },
  SHARE: {
    getPath: () => '/share',
  },
  TOPIC_DETAIL: {
    getPath: (id: string) => `/topic-detail/${id}`,
  },
};

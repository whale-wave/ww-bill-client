export const ROUTES_PATH = {
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

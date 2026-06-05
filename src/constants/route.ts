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
};

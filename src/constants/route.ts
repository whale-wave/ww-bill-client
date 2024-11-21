export const ROUTES_PATH = {
  // 账单
  BILL: {
    getPath: () => '/bill',
  },
  // 预算
  BUDGET: {
    getPath: () => '/budget',
  },
  // 资产
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
};

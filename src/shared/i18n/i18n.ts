import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANG } from './config';
import { detectLanguage } from './detector';
// Locale JSON imports — all loaded at build time since the app is small enough
import asset from './locales/zh-CN/asset.json';
import auth from './locales/zh-CN/auth.json';
import bill from './locales/zh-CN/bill.json';
import budget from './locales/zh-CN/budget.json';
import chart from './locales/zh-CN/chart.json';
import common from './locales/zh-CN/common.json';
import community from './locales/zh-CN/community.json';
import fixedExpense from './locales/zh-CN/fixed-expense.json';
import invoice from './locales/zh-CN/invoice.json';
import record from './locales/zh-CN/record.json';

import settings from './locales/zh-CN/settings.json';
import user from './locales/zh-CN/user.json';

const resources = {
  'zh-CN': {
    asset,
    auth,
    bill,
    budget,
    chart,
    common,
    community,
    'fixed-expense': fixedExpense,
    invoice,
    record,
    settings,
    user,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: DEFAULT_LANG,
  interpolation: {
    escapeValue: false, // React already escapes output
  },
});

export default i18n;

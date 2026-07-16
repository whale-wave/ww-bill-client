import type { SupportedLang } from './config';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANG } from './config';
import { detectLanguage, setLanguage } from './detector';

// en locales
import enAsset from './locales/en/asset.json';
import enAuth from './locales/en/auth.json';
import enBill from './locales/en/bill.json';
import enBudget from './locales/en/budget.json';
import enChart from './locales/en/chart.json';
import enCommon from './locales/en/common.json';
import enCommunity from './locales/en/community.json';
import enFixedExpense from './locales/en/fixed-expense.json';
import enInvoice from './locales/en/invoice.json';
import enRecord from './locales/en/record.json';
import enSettings from './locales/en/settings.json';
import enUser from './locales/en/user.json';

// zh-CN locales
import zhAsset from './locales/zh-CN/asset.json';
import zhAuth from './locales/zh-CN/auth.json';
import zhBill from './locales/zh-CN/bill.json';
import zhBudget from './locales/zh-CN/budget.json';
import zhChart from './locales/zh-CN/chart.json';
import zhCommon from './locales/zh-CN/common.json';
import zhCommunity from './locales/zh-CN/community.json';
import zhFixedExpense from './locales/zh-CN/fixed-expense.json';
import zhInvoice from './locales/zh-CN/invoice.json';
import zhRecord from './locales/zh-CN/record.json';
import zhSettings from './locales/zh-CN/settings.json';
import zhUser from './locales/zh-CN/user.json';

export type { SupportedLang } from './config';
export { DEFAULT_LANG, SUPPORTED_LANGS } from './config';
export { detectLanguage, setLanguage } from './detector';

const resources = {
  'zh-CN': {
    'asset': zhAsset,
    'auth': zhAuth,
    'bill': zhBill,
    'budget': zhBudget,
    'chart': zhChart,
    'common': zhCommon,
    'community': zhCommunity,
    'fixed-expense': zhFixedExpense,
    'invoice': zhInvoice,
    'record': zhRecord,
    'settings': zhSettings,
    'user': zhUser,
  },
  'en': {
    'asset': enAsset,
    'auth': enAuth,
    'bill': enBill,
    'budget': enBudget,
    'chart': enChart,
    'common': enCommon,
    'community': enCommunity,
    'fixed-expense': enFixedExpense,
    'invoice': enInvoice,
    'record': enRecord,
    'settings': enSettings,
    'user': enUser,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: DEFAULT_LANG,
  interpolation: {
    escapeValue: false,
  },
});

export async function changeLanguage(lang: SupportedLang): Promise<void> {
  setLanguage(lang);
  await i18n.changeLanguage(lang);
}

export default i18n;

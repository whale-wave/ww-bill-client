export { DEFAULT_LANG, SUPPORTED_LANGS } from './config';
export type { SupportedLang } from './config';
export { detectLanguage, setLanguage } from './detector';
export { changeLanguage, clearMissingTranslationKeys, getLocaleParity, getMissingTranslationKeys, default as i18n, resources } from './i18n';
export { compareLocaleKeys, flattenLocaleKeys } from './locale-parity';
export { useTranslation } from 'react-i18next';

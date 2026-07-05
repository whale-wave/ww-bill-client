import type { SupportedLang } from './config';
import { DEFAULT_LANG, LANG_STORAGE_KEY, SUPPORTED_LANGS } from './config';

/**
 * Detect the user's preferred language.
 * Priority: localStorage → browser language → default (zh-CN).
 */
export function detectLanguage(): SupportedLang {
  // 1. Persisted preference
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && stored in SUPPORTED_LANGS) {
    return stored as SupportedLang;
  }

  // 2. Browser preference
  const browserLang = navigator.language;
  if (browserLang === 'zh-CN' || browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  if (browserLang.startsWith('en')) {
    return 'en';
  }

  // 3. Default
  return DEFAULT_LANG;
}

/**
 * Persist the selected language and return it.
 */
export function setLanguage(lang: SupportedLang): SupportedLang {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  return lang;
}

import type { SupportedLang } from './config';
import { DEFAULT_LANG, LANG_STORAGE_KEY, SUPPORTED_LANGS } from './config';

/**
 * Detect the user's preferred language.
 * Priority: localStorage explicit choice → default (zh-CN).
 *
 * We intentionally skip browser language detection because on macOS
 * navigator.language often returns "en" regardless of the user's actual
 * preference. Users can manually switch in Settings → Language.
 */
export function detectLanguage(): SupportedLang {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && stored in SUPPORTED_LANGS) {
    return stored as SupportedLang;
  }
  return DEFAULT_LANG;
}

/**
 * Persist the selected language and return it.
 */
export function setLanguage(lang: SupportedLang): SupportedLang {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  return lang;
}

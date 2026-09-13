import { Toast } from 'antd-mobile';
import { i18n } from '@/shared/i18n';

const ERROR_DEDUPE_WINDOW_MS = 1000;
const ERROR_DURATION_MS = 1800;
const NOTICE_DURATION_MS = 1500;

const handledErrors = new WeakSet<object>();
const recentKeys = new Map<string, number>();

export interface AppErrorOptions {
  message?: string;
  fallbackMessage?: string;
  dedupeKey?: string;
}

function isObject(value: unknown): value is object {
  return (typeof value === 'object' && value !== null) || typeof value === 'function';
}

function getMessage(error: unknown, options: AppErrorOptions) {
  if (options.message?.trim())
    return options.message;
  if (typeof error === 'string' && error.trim())
    return error;
  if (error instanceof Error && error.message.trim())
    return error.message;
  if (isObject(error) && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim())
      return message;
  }
  if (isObject(error) && 'content' in error) {
    const content = (error as { content?: unknown }).content;
    if (typeof content === 'string' && content.trim())
      return content;
  }
  return options.fallbackMessage?.trim() || i18n.t('common:api.requestFailed') || '请求失败';
}

function canShowKey(key: string) {
  const now = Date.now();
  const previous = recentKeys.get(key);
  if (previous !== undefined && now - previous < ERROR_DEDUPE_WINDOW_MS)
    return false;
  recentKeys.set(key, now);
  for (const [storedKey, storedAt] of recentKeys) {
    if (now - storedAt >= ERROR_DEDUPE_WINDOW_MS)
      recentKeys.delete(storedKey);
  }
  return true;
}

function show(content: string, duration: number, icon?: 'fail') {
  (Toast.clear as (() => void) | undefined)?.();
  Toast.show({
    content,
    duration,
    icon,
    maskStyle: { pointerEvents: 'none' },
    position: 'top',
    stopPropagation: [],
  });
}

export function showAppError(error: unknown, options: AppErrorOptions = {}) {
  if (isObject(error)) {
    if (handledErrors.has(error))
      return;
    handledErrors.add(error);
  }
  if (options.dedupeKey && !canShowKey(options.dedupeKey))
    return;
  show(getMessage(error, options), ERROR_DURATION_MS, 'fail');
}

export function showAppNotice(message: string | { content?: unknown; [key: string]: unknown }) {
  const content = typeof message === 'string' ? message : message.content;
  if (typeof content !== 'string' || !content.trim())
    return;
  show(content, NOTICE_DURATION_MS);
}

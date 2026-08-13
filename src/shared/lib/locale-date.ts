export function formatLocalizedDateTime(value: Date | number | string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatLocalizedMonthDay(value: Date | number | string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(new Date(value));
}

export function formatLocalizedYear(value: Date | number | string, locale: string) {
  return new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(new Date(value));
}

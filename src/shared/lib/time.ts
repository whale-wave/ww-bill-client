import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import { i18n } from '@/shared/i18n';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  relativeTime: {
    future: (s: string) => i18n.t('common:time.relative.future', { s }),
    past: (s: string) => i18n.t('common:time.relative.past', { s }),
    s: () => i18n.t('common:time.relative.justNow'),
    m: () => i18n.t('common:time.relative.oneMinAgo'),
    mm: (d: number) => i18n.t('common:time.relative.minutesAgo', { count: d }),
    h: () => i18n.t('common:time.relative.oneHourAgo'),
    hh: (d: number) => i18n.t('common:time.relative.hoursAgo', { count: d }),
    d: () => i18n.t('common:time.relative.oneDayAgo'),
    dd: (d: number) => i18n.t('common:time.relative.daysAgo', { count: d }),
    M: () => i18n.t('common:time.relative.oneMonthAgo'),
    MM: (d: number) => i18n.t('common:time.relative.monthsAgo', { count: d }),
    y: () => i18n.t('common:time.relative.oneYearAgo'),
    yy: (d: number) => i18n.t('common:time.relative.yearsAgo', { count: d }),
  },
});

dayjs.locale('zh-cn');

export function showDate(timestamp: string) {
  const now = dayjs().valueOf();
  const before = dayjs(timestamp).valueOf();
  const oneDay = 60 * 60 * 24 * 1000;
  return now - before < oneDay
    ? dayjs().from(timestamp, now - before < 60 * 1000)
    : dayjs(timestamp).format('YYYY-MM-DD HH:mm');
}

export function spliceNumberByPoint(n?: number) {
  if (!n)
    return ['0', '00'];
  const sp = n.toString().split('.');
  return sp.length === 1 ? [...sp, '00'] : sp;
}

export function zeroFill(n?: number) {
  if (!n)
    n = 0;
  return n < 10 ? `0${n}` : n.toString();
}

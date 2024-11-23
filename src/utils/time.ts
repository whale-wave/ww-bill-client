import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  relativeTime: {
    future: '%s后',
    past: '%s前',
    s: '刚刚',
    m: '1分钟前',
    mm: '%d分钟前',
    h: '1小时前',
    hh: '%d小时前',
    d: '1天前',
    dd: '%d天前',
    M: '1个月前',
    MM: '%d个月前',
    y: '1年前',
    yy: '%d年前',
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

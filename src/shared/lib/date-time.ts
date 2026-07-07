import { i18n } from '@/shared/i18n';

export function getWeekByDay(dayValue: string) {
  // dayValue=“2014-01-01”
  const day = new Date(Date.parse(dayValue.replace(/-/g, '/'))); // 将日期值格式化
  const today = [
    i18n.t('common:dateTime.sunday'),
    i18n.t('common:dateTime.monday'),
    i18n.t('common:dateTime.tuesday'),
    i18n.t('common:dateTime.wednesday'),
    i18n.t('common:dateTime.thursday'),
    i18n.t('common:dateTime.friday'),
    i18n.t('common:dateTime.saturday'),
  ]; // 创建星期数组
  // console.log (today[day.getDay ()]);
  return today[day.getDay()]; // 返一个星期中的某一天，其中0为星期日
}

export function getTimeDateYear(val: Date) {
  const Y = `${val.getFullYear()}${i18n.t('common:dateTime.yearSuffix')}`;
  const M
    = `${val.getMonth() + 1 < 10
      ? `0${val.getMonth() + 1}`
      : val.getMonth() + 1}${i18n.t('common:dateTime.monthSuffix')}`;
  const D = `${val.getDate() < 10 ? `0${val.getDate()}` : val.getDate()}${i18n.t('common:dateTime.daySuffix')}`;
  return Y + M + D;
}

export function getShowTime(val: Date) {
  const Y = `${val.getFullYear()}/`;
  const M
    = `${val.getMonth() + 1 < 10
      ? `0${val.getMonth() + 1}`
      : val.getMonth() + 1}/`;
  const D = `${val.getDate() < 10 ? `0${val.getDate()}` : val.getDate()} `;
  return Y + M + D;
}

export function getTimedate(val: Date) {
  const Y = `${val.getFullYear()}-`;
  const M
    = `${val.getMonth() + 1 < 10
      ? `0${val.getMonth() + 1}`
      : val.getMonth() + 1}-`;
  const D = `${val.getDate() < 10 ? `0${val.getDate()}` : val.getDate()}`;
  return Y + M + D;
}

export function getTimeValueFn(val: Date) {
  const M
    = `${val.getMonth() + 1 < 10
      ? `0${val.getMonth() + 1}`
      : val.getMonth() + 1}${i18n.t('common:dateTime.monthSuffix')}`;
  const D = `${val.getDate() < 10 ? `0${val.getDate()}` : val.getDate()}${i18n.t('common:dateTime.daySuffix')}`;
  return M + D;
}

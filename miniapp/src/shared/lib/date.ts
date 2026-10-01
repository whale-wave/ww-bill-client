import { formatMonthDay } from '@ww-bill/bill-core'

const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000

function shanghaiDate(date: Date): Date {
  return new Date(date.getTime() + SHANGHAI_OFFSET_MS)
}

export function dateKey(date: Date): string {
  const shifted = shanghaiDate(date)
  const year = shifted.getUTCFullYear()
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0')
  const day = String(shifted.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function timeKey(date: Date): string {
  const shifted = shanghaiDate(date)
  return `${String(shifted.getUTCHours()).padStart(2, '0')}:${String(shifted.getUTCMinutes()).padStart(2, '0')}`
}

export function shanghaiDateTimeToIso(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    return null
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  if (hour > 23 || minute > 59)
    return null
  const timestamp = new Date(Date.UTC(year, month - 1, day, hour - 8, minute))
  return dateKey(timestamp) === date && timeKey(timestamp) === time ? timestamp.toISOString() : null
}

export function currentMonth(): string {
  return dateKey(new Date()).slice(0, 7)
}

export function monthStart(month: string): string {
  return `${month}-01`
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function displayRecordDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return value
  const shifted = shanghaiDate(date)
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${formatMonthDay(shifted.getUTCMonth() + 1, shifted.getUTCDate(), { monthSuffix: '月', daySuffix: '日' })} ${weekdays[shifted.getUTCDay()]}`
}

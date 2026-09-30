export function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function currentMonth(): string {
  return dateKey(new Date()).slice(0, 7)
}

export function monthStart(month: string): string {
  return `${month}-01`
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 1 + delta, 1)
  return dateKey(date).slice(0, 7)
}

export function displayRecordDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return value
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

import type { FamilyRecord } from '@/entities/household';
import type { RecordEntry } from '@/entities/record';
import { FamilyRecordPolicy } from '@/entities/household';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function parseMonthStart(monthStart: string) {
  const match = /^(\d{4})-(\d{2})-01$/.exec(monthStart);
  if (!match)
    return;

  return { monthIndex: Number(match[2]) - 1, year: Number(match[1]) };
}

export function formatMonthStart(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-01`;
}

export function formatCalendarDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function shiftMonth(monthStart: string, amount: number) {
  const parsed = parseMonthStart(monthStart);
  if (!parsed)
    return monthStart;

  return formatMonthStart(new Date(parsed.year, parsed.monthIndex + amount, 1));
}

export function buildMonthRecordRange(monthStart: string) {
  const parsed = parseMonthStart(monthStart);
  if (!parsed)
    return { endDate: monthStart, startDate: monthStart };

  const end = new Date(parsed.year, parsed.monthIndex + 1, 0);
  return {
    endDate: formatCalendarDate(end),
    startDate: monthStart,
  };
}

export function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function getFamilyRecordPolicyBehavior(policy: FamilyRecordPolicy) {
  switch (policy) {
    case FamilyRecordPolicy.INHERIT:
    case FamilyRecordPolicy.SHARED_COUNTED:
      return { counted: true, visible: true };
    case FamilyRecordPolicy.SHARED_UNCOUNTED:
      return { counted: false, visible: true };
    case FamilyRecordPolicy.PRIVATE:
      return { counted: false, visible: false };
  }
}

export function toMoney(value: string | number | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00';
}

export function getDisplayName(user: { name?: string; username?: string }) {
  return user.name?.trim() || user.username?.trim() || '—';
}

export interface FamilyRecordGroup {
  data: RecordEntry[];
  date: string;
  time: number;
}

export function toFamilyRecordEntry(record: FamilyRecord): RecordEntry {
  return {
    amount: record.amount,
    category: {
      createdAt: '',
      icon: record.category?.icon ?? '',
      id: record.category?.id ?? 0,
      name: record.category?.name ?? '',
      updatedAt: '',
    },
    createdAt: record.time,
    id: record.id,
    remark: record.remark || record.category?.name || '—',
    tags: record.tags,
    time: record.time,
    type: record.type,
    updatedAt: record.time,
    version: record.version,
  };
}

export function groupFamilyRecords(records: FamilyRecord[]) {
  const groups = new Map<string, FamilyRecordGroup>();
  records.forEach((record) => {
    const date = record.time.slice(0, 10);
    const group = groups.get(date) ?? {
      data: [],
      date,
      time: new Date(`${date}T00:00:00`).getTime(),
    };
    group.data.push(toFamilyRecordEntry(record));
    groups.set(date, group);
  });
  return [...groups.values()].sort((left, right) => right.date.localeCompare(left.date));
}

export function formatFamilyRecordDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime()))
    return date;
  const monthDay = new Intl.DateTimeFormat('zh-CN', { day: '2-digit', month: '2-digit' })
    .format(parsed)
    .replace('/', '月')
    .concat('日');
  const weekday = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(parsed);
  return `${monthDay} ${weekday}`;
}

export function getFamilyRecordSubtitle(record: FamilyRecord) {
  const tags = record.tags.map(tag => `#${tag.name}`).join(' ');
  return `${tags ? `${tags} ` : ''}@${getDisplayName(record.creator)}`;
}

export function getApiErrorStatus(error: unknown) {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = Number((error as { statusCode?: unknown }).statusCode);
    return Number.isFinite(statusCode) ? statusCode : undefined;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim())
    return error.message;
  return fallback;
}

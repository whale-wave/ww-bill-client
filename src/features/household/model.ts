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

import { twMerge } from 'tailwind-merge';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';

export function cn(...args: ClassValue[]) {
  return twMerge(clsx(args));
}

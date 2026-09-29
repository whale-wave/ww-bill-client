import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib';
import './ios-toggle.scss';

export interface IosToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

/** Project-owned iOS toggle, adapted from the Konsta toggle proportions and pressed glass thumb. */
export function IosToggle({ className, disabled, ...props }: IosToggleProps) {
  return (
    <label className={cn('ww-ios-toggle relative inline-flex h-11 w-16 shrink-0 items-center', disabled && 'ww-ios-toggle--disabled', className)}>
      <input {...props} className="ww-ios-toggle__input absolute inset-0 z-[1] m-0 h-full w-full cursor-pointer opacity-0" disabled={disabled} role="switch" type="checkbox" />
      <span aria-hidden className="ww-ios-toggle__track absolute inset-x-0 top-2 h-7 rounded-full">
        <span className="ww-ios-toggle__thumb absolute left-0.5 top-0.5 h-6 rounded-full">
          <span className="ww-ios-toggle__thumb-glass absolute inset-0 rounded-full" />
        </span>
      </span>
    </label>
  );
}

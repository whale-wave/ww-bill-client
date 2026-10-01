import type { ComponentProps } from 'react';
import { createElement } from 'react';

export function Button({ ariaLabel, ...props }: ComponentProps<'button'> & { ariaLabel?: string }) {
  return createElement('button', { ...props, 'aria-label': ariaLabel ?? props['aria-label'] });
}
export const Text = 'span';
export const View = 'div';
export const Image = 'img';
export const Input = 'input';
export const Picker = 'div';
export const ScrollView = 'div';
export const PickerView = 'div';
export const PickerViewColumn = 'div';

import type { ComponentType } from 'react';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActionField, FormField, SelectField } from '@/shared/ui';

let cleanup: (() => void) | undefined;
function render(Component: ComponentType<any>, props?: Record<string, unknown>) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(Component, props)));
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('form-field controls', () => {
  it('formField forwards an explicit id to the inner input', () => {
    const container = render(FormField, { id: 'member-nickname', label: '昵称', value: '小勇' });
    expect(container.querySelector('input#member-nickname')).not.toBeNull();
  });
  it('selectField renders options and reports changes', () => {
    const onChange = vi.fn();
    const container = render(SelectField, {
      label: '来源账本',
      onChange,
      options: [{ label: 'A', value: 'a' }],
      placeholder: '请选择',
      value: '',
    });
    const select = container.querySelector('select')!;
    act(() => {
      (Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set)?.call(select, 'a');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith('a');
  });
  it('actionField shows label, value and fires onClick', () => {
    const onClick = vi.fn();
    const container = render(ActionField, { label: '角色', onClick, value: '记账员' });
    expect(container.textContent).toContain('记账员');
    act(() => {
      container.querySelector('button')?.click();
    });
    expect(onClick).toHaveBeenCalledOnce();
  });
});

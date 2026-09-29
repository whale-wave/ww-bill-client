import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, Form, Input, Selector, Stepper, Switch } from '@/shared/ui/konsta-compat';

let cleanup: (() => void) | undefined;

function render(element: ReturnType<typeof createElement>) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() => root.render(element));
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

describe('konsta compatibility controls', () => {
  it('shows field validation errors and connects them to the input', async () => {
    const container = render(createElement(Form, {
      initialValues: { name: '' },
      onFinish: vi.fn(),
      children: [
        createElement(Form.Item, {
          key: 'name',
          label: 'Name',
          name: 'name',
          rules: [{ message: 'Name is required', required: true }],
          children: createElement('div', null, createElement(Input)),
        }),
        createElement(Button, { key: 'submit', type: 'submit' }, 'Save'),
      ],
    }));

    await act(async () => container.querySelector('form')?.requestSubmit());

    const error = container.querySelector<HTMLElement>('[role="alert"]');
    const input = container.querySelector<HTMLInputElement>('input');
    expect(error?.textContent).toBe('Name is required');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-describedby')).toBe(error?.id);
  });

  it('clears a nested context-bound input through the Konsta clear control', () => {
    const onValuesChange = vi.fn();
    const container = render(createElement(Form, {
      initialValues: { name: 'Travel' },
      onValuesChange,
      children: createElement(Form.Item, {
        name: 'name',
        children: createElement('div', null, createElement(Input, { clearLabel: 'Clear input', clearable: true })),
      }),
    }));

    const clearButton = container.querySelector<HTMLButtonElement>('button[aria-label="Clear input"]');
    expect(container.querySelector<HTMLInputElement>('input')?.value).toBe('Travel');
    act(() => clearButton?.click());
    expect(onValuesChange).toHaveBeenCalledWith({ name: '' }, { name: '' });
  });

  it('keeps a form switch in sync with its initial and changed values', () => {
    const onValuesChange = vi.fn();
    const container = render(createElement(Form, {
      initialValues: { autoRenew: true },
      onValuesChange,
      children: createElement(Form.Item, {
        label: 'Auto renew',
        name: 'autoRenew',
        children: createElement(Switch, { 'aria-label': 'Auto renew' }),
      }),
    }));
    const toggle = container.querySelector<HTMLInputElement>('[role="switch"]');

    expect(toggle?.checked).toBe(true);
    act(() => toggle?.click());
    expect(toggle?.checked).toBe(false);
    expect(onValuesChange).toHaveBeenCalledWith({ autoRenew: false }, { autoRenew: false });
  });

  it('does not expose a clear action for disabled or read-only inputs', () => {
    const container = render(createElement('div', null, createElement(Input, { clearable: true, disabled: true, value: 'Disabled' }), createElement(Input, { clearable: true, readOnly: true, value: 'Read only' })));

    expect(container.querySelector('button')).toBeNull();
  });

  it('keeps selector controls from submitting their parent form', () => {
    const container = render(createElement('form', null, createElement(Selector, {
      options: [{ label: 'Monthly', value: 'month' }, { label: 'Yearly', value: 'year' }],
      value: ['month'],
    })));

    expect([...container.querySelectorAll('button')].every(button => button.type === 'button')).toBe(true);
  });

  it('renders a controlled empty stepper and blocks changes while disabled', () => {
    const onChange = vi.fn();
    const container = render(createElement(Stepper, { allowEmpty: true, disabled: true, onChange, value: undefined }));

    expect(container.querySelector<HTMLInputElement>('input')?.value).toBe('');
    expect(container.querySelector<HTMLInputElement>('input')?.disabled).toBe(true);
    act(() => container.querySelector<HTMLElement>('[role="button"]')?.click());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('emits undefined when an allow-empty stepper input is cleared', () => {
    const onChange = vi.fn();
    const container = render(createElement(Stepper, { allowEmpty: true, onChange, value: 5 }));
    const input = container.querySelector<HTMLInputElement>('input');

    act(() => {
      if (input) {
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        setValue?.call(input, '');
      }
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});

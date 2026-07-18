import type { InvoiceEntity } from '@/entities/invoice';
import { act, createContext, createElement, useContext, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import InvoiceInfoForm from '@/pages/invoice/ui/InvoiceInfoForm';

const { navigate, patchInvoiceMutate, postInvoiceMutate, queryResult } = vi.hoisted(() => ({
  navigate: vi.fn(),
  patchInvoiceMutate: vi.fn(),
  postInvoiceMutate: vi.fn(),
  queryResult: {
    data: undefined as InvoiceEntity | undefined,
    isLoading: true,
  },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

vi.mock('@/entities/invoice', () => ({
  useGetInvoiceByIdQuery: () => queryResult,
  usePatchInvoiceMutation: () => [patchInvoiceMutate],
  usePostInvoiceMutation: () => [postInvoiceMutate],
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

interface FormContextValue {
  setValues: React.Dispatch<React.SetStateAction<Omit<InvoiceEntity, 'id'>>>;
  values: Omit<InvoiceEntity, 'id'>;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

vi.mock('antd-mobile', () => {
  function MockForm({
    children,
    disabled,
    footer,
    onFinish,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    footer: React.ReactNode;
    onFinish: (values: Omit<InvoiceEntity, 'id'>) => Promise<void>;
  }) {
    const [values, setValues] = useState<Omit<InvoiceEntity, 'id'>>({
      accountOpeningBank: '',
      bankAccount: '',
      companyAddress: '',
      companyName: '',
      phone: '',
      taxNumber: '',
    });

    return createElement(
      FormContext.Provider,
      { value: { setValues, values } },
      createElement(
        'form',
        {
          'data-disabled': String(disabled),
          'onSubmit': async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            await onFinish(values);
          },
        },
        createElement('fieldset', { disabled }, children, footer),
      ),
    );
  }

  function MockFormItem({ name }: {
    name: keyof Omit<InvoiceEntity, 'id'>;
  }) {
    const form = useContext(FormContext);

    return createElement('input', {
      name,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        form?.setValues(current => ({ ...current, [name]: event.target.value }));
      },
      value: form?.values[name] ?? '',
    });
  }

  MockForm.useForm = () => [{ setFieldsValue: vi.fn() }];
  MockForm.Item = MockFormItem;

  return {
    Button: ({ block: _block, color: _color, size: _size, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { block?: boolean; color?: string; size?: string }) => createElement('button', props, children),
    Form: MockForm,
    Input: () => null,
  };
});

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('invoice info form', () => {
  it('enables a loaded edit form and saves the current invoice values', async () => {
    queryResult.data = undefined;
    queryResult.isLoading = true;
    patchInvoiceMutate.mockResolvedValue(undefined);
    navigate.mockReset();
    patchInvoiceMutate.mockClear();

    const container = document.createElement('div');
    const root = createRoot(container);
    const firstInvoice: InvoiceEntity = {
      companyName: 'Whale Wave',
      id: 'invoice-7',
      taxNumber: '91310000TEST',
    };
    const currentInvoice: InvoiceEntity = {
      companyName: 'Whale Wave Labs',
      id: 'invoice-9',
      taxNumber: '91310000CURRENT',
    };

    act(() => root.render(createElement(InvoiceInfoForm, { id: firstInvoice.id })));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('form')?.dataset.disabled).toBe('true');

    queryResult.data = currentInvoice;
    queryResult.isLoading = false;
    act(() => root.render(createElement(InvoiceInfoForm, { id: currentInvoice.id })));

    expect(container.querySelector('form')?.dataset.disabled).toBe('false');

    const companyName = container.querySelector('input');
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

    expect(companyName).not.toBeNull();
    expect(setValue).toBeDefined();

    act(() => {
      setValue?.call(companyName, 'Whale Wave Labs');
      companyName?.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () => {
      container.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(patchInvoiceMutate).toHaveBeenCalledWith({
      id: currentInvoice.id,
      params: expect.objectContaining({ companyName: 'Whale Wave Labs' }),
    });
    expect(navigate).toHaveBeenCalledWith(-1);
  });
});

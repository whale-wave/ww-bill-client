/* eslint-disable react-refresh/only-export-components -- Form.useForm and Form.Item intentionally share one compatibility namespace. */
import type { FormEvent, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { cloneElement, createContext, isValidElement, useContext, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib';

type FormValues = Record<string, unknown>;
type FieldValue = never;

export interface FormRule {
  message?: ReactNode;
  required?: boolean;
  validator?: (rule: FormRule, value: FieldValue) => Promise<void> | void;
}

interface FieldRegistration {
  getRules: () => FormRule[] | undefined;
}

export interface FormInstance<Values extends object = FormValues> {
  getFieldsValue: () => Values;
  setFieldValue: <Key extends keyof Values>(name: Key, value: Values[Key]) => void;
  setFieldsValue: (values: Partial<Values>) => void;
}

class FormStore implements FormInstance<FormValues> {
  private fields = new Map<string, FieldRegistration>();
  private errors = new Map<string, ReactNode[]>();
  private listeners = new Set<() => void>();
  private values: FormValues = {};

  getFieldsValue = () => ({ ...this.values });

  getFieldValue = (name: string) => this.values[name];

  getFieldErrors = (name: string) => this.errors.get(name) ?? [];

  registerField = (name: string, registration: FieldRegistration) => {
    this.fields.set(name, registration);
    return () => {
      this.fields.delete(name);
    };
  };

  setFieldValue = (name: string, value: unknown) => {
    this.values = { ...this.values, [name]: value };
    this.errors.delete(name);
    this.emit();
  };

  setFieldsValue = (values: FormValues) => {
    this.values = { ...this.values, ...values };
    Object.keys(values).forEach(name => this.errors.delete(name));
    this.emit();
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  validate = async () => {
    const errorFields: Array<{ errors: ReactNode[]; name: string[] }> = [];
    for (const [name, registration] of this.fields) {
      const value = this.values[name];
      const errors: ReactNode[] = [];
      for (const rule of registration.getRules() ?? []) {
        const isEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
        if (rule.required && isEmpty) {
          errors.push(rule.message ?? 'Required');
          continue;
        }
        if (rule.validator) {
          try {
            await rule.validator(rule, value as FieldValue);
          }
          catch (error) {
            errors.push(error instanceof Error ? error.message : rule.message ?? 'Invalid value');
          }
        }
      }
      if (errors.length)
        errorFields.push({ errors, name: [name] });
    }
    this.errors = new Map(errorFields.map(field => [field.name[0], field.errors]));
    this.emit();
    return { errorFields, values: this.getFieldsValue() };
  };

  private emit() {
    this.listeners.forEach(listener => listener());
  }
}

interface FormContextValue {
  disabled?: boolean;
  form: FormStore;
  onValuesChange?: (changedValues: FormValues, values: FormValues) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

interface FormFieldBinding {
  describedBy?: string;
  disabled?: boolean;
  invalid: boolean;
  onChange: (value: unknown) => void;
  value: unknown;
}

const FormFieldBindingContext = createContext<FormFieldBinding | null>(null);

export function useFormFieldBinding() {
  return useContext(FormFieldBindingContext);
}

export interface FormProps<Values extends object = FormValues> extends PropsWithChildren {
  className?: string;
  disabled?: boolean;
  footer?: ReactNode;
  form?: FormInstance<Values>;
  hasFeedback?: boolean;
  initialValues?: Values;
  layout?: 'horizontal' | 'vertical';
  onFinish?: (values: Values) => void | Promise<void>;
  onFinishFailed?: (errorInfo: { errorFields: Array<{ errors: string[]; name: string[] }> }) => void;
  onValuesChange?: (changedValues: Partial<Values>, values: Values) => void;
  requiredMarkStyle?: 'asterisk' | 'none' | 'text-required';
}

export interface FormItemProps extends PropsWithChildren {
  childElementPosition?: 'left' | 'normal' | 'right';
  className?: string;
  description?: ReactNode;
  label?: ReactNode;
  name?: string;
  noStyle?: boolean;
  normalize?: (value: FieldValue, previousValue: FieldValue, values: FormValues) => unknown;
  rules?: FormRule[];
}

function useForm<Values extends object = FormValues>(provided?: FormInstance<Values>): [FormInstance<Values>] {
  const formRef = useRef<FormInstance<Values> | null>(provided ?? null);
  if (!formRef.current)
    formRef.current = new FormStore() as unknown as FormInstance<Values>;
  return [formRef.current];
}

function FormItem({
  childElementPosition = 'normal',
  children,
  className,
  description,
  label,
  name,
  noStyle = false,
  normalize,
  rules,
}: FormItemProps) {
  const context = useContext(FormContext);
  const [_revision, setRevision] = useState(0);
  const errorId = name ? `ww-k-form-error-${name}` : undefined;
  const rulesRef = useRef(rules);
  rulesRef.current = rules;

  useEffect(() => context?.form.subscribe(() => setRevision(revision => revision + 1)), [context?.form]);
  useEffect(() => {
    if (!context || !name)
      return;
    return context.form.registerField(name, { getRules: () => rulesRef.current });
  }, [context, name]);

  const errors = context && name ? context.form.getFieldErrors(name) : [];
  const updateFieldValue = (nextValue: unknown) => {
    if (!context || !name)
      return;
    const extractedValue = typeof nextValue === 'object' && nextValue !== null && 'target' in nextValue
      ? ((nextValue as { target?: { checked?: boolean; value?: unknown } }).target?.checked
        ?? (nextValue as { target?: { value?: unknown } }).target?.value)
      : nextValue;
    const previousValue = context.form.getFieldValue(name);
    const normalizedValue = normalize
      ? normalize(extractedValue as FieldValue, previousValue as FieldValue, context.form.getFieldsValue())
      : extractedValue;
    context.form.setFieldValue(name, normalizedValue);
    context.onValuesChange?.({ [name]: normalizedValue }, context.form.getFieldsValue());
  };

  let content = children;
  if (context && name && isValidElement(children) && (typeof children.type !== 'string' || ['input', 'select', 'textarea'].includes(children.type))) {
    const child = children as ReactElement<Record<string, unknown>>;
    const value = context.form.getFieldValue(name);
    const originalOnChange = child.props.onChange;
    // Compatibility is intentionally concentrated here so page forms can move
    // from the old field store without coupling Konsta controls to it.
    // eslint-disable-next-line react/no-clone-element
    content = cloneElement(child, {
      'aria-describedby': [child.props['aria-describedby'], errors.length ? errorId : undefined].filter(Boolean).join(' ') || undefined,
      'aria-invalid': errors.length ? true : child.props['aria-invalid'],
      'disabled': child.props.disabled ?? context.disabled,
      'value': value,
      'onChange': (nextValue: unknown) => {
        updateFieldValue(nextValue);
        if (typeof originalOnChange === 'function')
          originalOnChange(nextValue);
      },
    });
  }

  const boundContent = context && name
    ? (
        <FormFieldBindingContext.Provider value={{
          describedBy: errors.length ? errorId : undefined,
          disabled: context.disabled,
          invalid: errors.length > 0,
          onChange: updateFieldValue,
          value: context.form.getFieldValue(name),
        }}
        >
          {content}
        </FormFieldBindingContext.Provider>
      )
    : content;

  if (noStyle)
    return boundContent;

  return (
    <div
      className={cn(
        'adm-form-item ww-k-form-item border-b border-solid border-border-primary px-4 py-3 last:border-b-0',
        childElementPosition === 'right' && 'ww-k-form-item--right',
        className,
      )}
    >
      {label && <div className="adm-form-item-label mb-2 text-[12px] font-bold text-ww-mid">{label}</div>}
      <div className={cn('adm-form-item-child-inner min-w-0', childElementPosition === 'right' && 'flex items-center justify-between gap-4')}>
        {boundContent}
      </div>
      {description && <div className="adm-form-item-description mt-1 text-[11px] leading-4 text-ww-soft">{description}</div>}
      {errorId && errors.length > 0 && (
        <div className="mt-1 text-[11px] font-semibold leading-4 text-feedback-danger" id={errorId} role="alert">
          {errors[0]}
        </div>
      )}
    </div>
  );
}

function FormRoot<Values extends object = FormValues>({
  children,
  className,
  disabled,
  footer,
  form: providedForm,
  initialValues,
  onFinish,
  onFinishFailed,
  onValuesChange,
}: FormProps<Values>) {
  const [internalForm] = useForm(providedForm);
  const form = internalForm as unknown as FormStore;
  const initializedRef = useRef(false);
  if (!initializedRef.current) {
    if (initialValues)
      form.setFieldsValue(initialValues as unknown as FormValues);
    initializedRef.current = true;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled)
      return;
    const result = await form.validate();
    if (result.errorFields.length) {
      onFinishFailed?.({
        errorFields: result.errorFields.map(field => ({
          errors: field.errors.map(error => String(error ?? 'Invalid value')),
          name: field.name,
        })),
      });
      return;
    }
    await onFinish?.(result.values as Values);
  };

  return (
    <FormContext.Provider value={{
      disabled,
      form,
      onValuesChange: onValuesChange
        ? (changedValues, values) => onValuesChange(changedValues as Partial<Values>, values as Values)
        : undefined,
    }}
    >
      <form className={cn('adm-form ww-k-form', className)} onSubmit={handleSubmit}>
        {children}
        {footer && <div className="adm-form-footer ww-k-form__footer">{footer}</div>}
      </form>
    </FormContext.Provider>
  );
}

export const Form = Object.assign(FormRoot, {
  Item: FormItem,
  useForm,
});

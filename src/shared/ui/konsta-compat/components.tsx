/* eslint-disable react-refresh/only-export-components -- compatibility namespaces mirror the replaced component API. */
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { useDrag } from '@use-gesture/react';
import { AlertCircle, Inbox, SearchX, X } from 'lucide-react';
import { animate, m, useMotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { IosToggle } from '@/shared/ui/ios-toggle';
import { useFormFieldBinding } from './form';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  block?: boolean;
  color?: 'danger' | 'default' | 'primary' | 'success' | 'warning' | string;
  fill?: 'none' | 'outline' | 'solid';
  loading?: boolean;
  size?: 'large' | 'middle' | 'mini' | 'small' | 'tiny';
}

export function Button({
  block,
  children,
  className,
  color = 'primary',
  disabled,
  fill = 'solid',
  loading,
  size = 'middle',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'adm-button ww-k-button inline-flex min-h-11 items-center justify-center rounded-xl border-0 px-4 font-bold',
        `ww-k-button--${color}`,
        `ww-k-button--${size}`,
        fill === 'none' ? 'bg-transparent text-primary-deep' : fill === 'outline' ? 'border border-primary-deep bg-transparent text-primary-deep' : 'bg-primary text-white',
        block && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      type={type}
    >
      {loading && <span aria-hidden className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}

export interface SpinLoadingProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'current' | 'default' | 'primary' | 'white' | string;
}

export function SpinLoading({ className, color = 'primary', ...props }: SpinLoadingProps) {
  return (
    <span
      {...props}
      className={cn('adm-spin-loading ww-k-preloader inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-current border-t-transparent', color === 'white' && 'text-white', className)}
    />
  );
}

export interface ErrorBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  description?: ReactNode;
  status?: 'busy' | 'default' | 'disconnected' | 'empty' | string;
  title?: ReactNode;
}

export function ErrorBlock({ className, description, status = 'default', title, ...props }: ErrorBlockProps) {
  const Icon = status === 'empty' ? Inbox : status === 'disconnected' ? SearchX : AlertCircle;
  return (
    <div
      {...props}
      className={cn('adm-error-block ww-k-error-block m-0 flex flex-col items-center px-5 py-8 text-center', className)}
    >
      <Icon aria-hidden className="mb-3 text-ww-soft" size={34} strokeWidth={1.5} />
      {title && <strong className="text-[15px] text-ww-ink">{title}</strong>}
      {description && <p className="mt-1 text-[13px] leading-5 text-ww-mid">{description}</p>}
    </div>
  );
}

export interface CheckboxProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  name?: string;
  onChange?: (checked: boolean) => void;
  value?: string;
}

export function Checkbox(checkboxProps: CheckboxProps) {
  const { checked, children, className, defaultChecked, disabled, name, onChange, value = 'on', ...props } = checkboxProps;
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const isControlled = Object.hasOwn(checkboxProps, 'checked');
  const resolvedChecked = isControlled ? checked : internalChecked;
  return (
    <label
      {...props}
      className={cn('adm-checkbox ww-k-checkbox inline-flex items-center gap-2', className)}
    >
      <input
        className="h-[18px] w-[18px] shrink-0 accent-primary"
        checked={resolvedChecked}
        disabled={disabled}
        name={name}
        onChange={(event) => {
          if (!isControlled)
            setInternalChecked(event.currentTarget.checked);
          onChange?.(event.currentTarget.checked);
        }}
        type="checkbox"
        value={value}
      />
      {children}
    </label>
  );
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  clearLabel?: string;
  clearable?: boolean;
  onlyShowClearWhenFocus?: boolean;
  onChange?: (value: string) => void;
  onEnterPress?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function Input(inputProps: InputProps) {
  const { t } = useTranslation('common');
  const field = useFormFieldBinding();
  const {
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-label': ariaLabel,
    className,
    clearLabel,
    clearable,
    onChange,
    onEnterPress,
    onlyShowClearWhenFocus: _onlyShowClearWhenFocus,
    value,
    ...props
  } = inputProps;
  const isControlled = Object.hasOwn(inputProps, 'value');
  const hasOwnOnChange = Object.hasOwn(inputProps, 'onChange');
  const resolvedValue = isControlled ? value : field?.value as InputProps['value'];
  const resolvedDisabled = props.disabled ?? field?.disabled;
  const resolvedClearLabel = clearLabel ?? t('action.clearInput');
  const canClear = Boolean(clearable && resolvedValue && !resolvedDisabled && !props.readOnly);
  const commitValue = (nextValue: string) => {
    onChange?.(nextValue);
    if (!hasOwnOnChange)
      field?.onChange(nextValue);
  };
  const input = (
    <input
      {...props}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      aria-invalid={ariaInvalid ?? field?.invalid}
      aria-label={ariaLabel}
      className={cn('adm-input-element ww-k-input__control', canClear && 'pr-12', className)}
      disabled={resolvedDisabled}
      onChange={event => commitValue(event.target.value)}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (event.key === 'Enter')
          onEnterPress?.(event);
      }}
      value={resolvedValue ?? ''}
    />
  );
  return (
    <div aria-label={ariaLabel} className="adm-input ww-k-input relative w-full">
      {input}
      {canClear && (
        <button
          aria-label={ariaLabel ? `${ariaLabel}: ${resolvedClearLabel}` : resolvedClearLabel}
          className="absolute right-1 top-1/2 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-transparent text-ww-soft"
          onClick={() => commitValue('')}
          type="button"
        >
          <X aria-hidden size={17} />
        </button>
      )}
    </div>
  );
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  onChange?: (value: string) => void;
}

export function Select({ 'aria-label': ariaLabel, children, className, onChange, value, ...props }: SelectProps) {
  const select = (
    <select
      {...props}
      aria-label={ariaLabel}
      className={cn('adm-select-element ww-k-select__control', className)}
      onChange={event => onChange?.(event.target.value)}
      value={value}
    >
      {children}
    </select>
  );
  return (
    <div className="adm-select ww-k-select">
      {select}
    </div>
  );
}

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  autoSize?: boolean | { maxRows?: number; minRows?: number };
  onChange?: (value: string) => void;
  showCount?: boolean;
}

export function TextArea({ autoSize, className, maxLength, onChange, rows, showCount, value, ...props }: TextAreaProps) {
  const minRows = typeof autoSize === 'object' ? autoSize.minRows : undefined;
  const resolvedRows = rows ?? minRows ?? (autoSize ? 3 : undefined);
  const input = (
    <textarea
      {...props}
      className={cn('adm-text-area-element ww-k-textarea__control', className)}
      maxLength={maxLength}
      onChange={event => onChange?.(event.target.value)}
      rows={resolvedRows}
      value={value ?? ''}
    />
  );
  return (
    <div className="adm-text-area ww-k-textarea">
      {input}
      {showCount && (
        <span className="block text-right text-xs text-ww-soft">
          {String(value ?? '').length}
          /
          {maxLength ?? ''}
        </span>
      )}
    </div>
  );
}

export interface SelectorOption<T = string> {
  description?: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  value: T;
}

export interface SelectorProps<T = string> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  columns?: number;
  disabled?: boolean;
  onChange?: (value: T[]) => void;
  options: SelectorOption<T>[];
  value?: T[];
}

export function Selector<T = string>({ className, columns, disabled, onChange, options, value = [], ...props }: SelectorProps<T>) {
  return (
    <div
      {...props}
      className={cn('adm-selector ww-k-selector grid w-full gap-2', className)}
      style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))`, ...props.style }}
    >
      {options.map((option) => {
        const isActive = value.some(selected => Object.is(selected, option.value));
        return (
          <button
            aria-selected={isActive}
            className={cn('adm-selector-item ww-k-selector__item min-h-11', isActive && 'adm-selector-item-active')}
            disabled={disabled || option.disabled}
            key={String(option.value)}
            onClick={() => onChange?.([option.value])}
            role="option"
            type="button"
          >
            <span>{option.label}</span>
            {option.description && <small className="block opacity-70">{option.description}</small>}
          </button>
        );
      })}
    </div>
  );
}

export interface SwitchProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  checked?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onChange?: (checked: boolean) => void;
  value?: boolean;
}

export function Switch({ checked, className, disabled, loading, onChange, value, ...props }: SwitchProps) {
  const field = useFormFieldBinding();
  const isChecked = checked ?? value ?? Boolean(field?.value);
  const isDisabled = Boolean(disabled || loading || field?.disabled);
  return (
    <IosToggle
      {...props}
      aria-checked={isChecked}
      aria-disabled={isDisabled}
      checked={isChecked}
      className={cn('adm-switch ww-k-switch', className)}
      disabled={isDisabled}
      onChange={(event) => {
        onChange?.(event.currentTarget.checked);
        if (!onChange)
          field?.onChange(event.currentTarget.checked);
      }}
    />
  );
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  allowEmpty?: boolean;
  defaultValue?: number;
  disabled?: boolean;
  max?: number;
  min?: number;
  onChange?: (value?: number) => void;
  value?: number;
}

export function Stepper(stepperProps: StepperProps) {
  const { allowEmpty, className, defaultValue, disabled, max, min, onChange, value, ...props } = stepperProps;
  const [internalValue, setInternalValue] = useState(defaultValue ?? min ?? 0);
  const isControlled = Object.hasOwn(stepperProps, 'value');
  const currentValue = isControlled ? value : internalValue;
  const updateValue = (next: number) => {
    if (disabled)
      return;
    const bounded = Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, next));
    if (!isControlled)
      setInternalValue(bounded);
    onChange?.(bounded);
  };
  const numericValue = currentValue ?? min ?? 0;
  return (
    <div {...props} aria-disabled={disabled} className={cn('adm-stepper ww-k-stepper inline-flex items-center gap-1', disabled && 'pointer-events-none opacity-45', className)}>
      <button aria-label="减少" className="h-11 w-11 rounded-xl bg-ww-surface-tint" disabled={disabled} onClick={() => updateValue(numericValue - 1)} type="button">−</button>
      <input
        className="h-11 w-14 bg-transparent text-center"
        disabled={disabled}
        placeholder={allowEmpty ? '—' : undefined}
        onChange={(event) => {
          if (disabled)
            return;
          const rawValue = event.currentTarget.value;
          if (allowEmpty && rawValue === '') {
            onChange?.(undefined);
            return;
          }
          const next = Number(rawValue);
          if (Number.isFinite(next))
            updateValue(next);
          else if (allowEmpty)
            onChange?.(undefined);
        }}
        type="number"
        value={(currentValue ?? '') as number}
      />
      <button aria-label="增加" className="h-11 w-11 rounded-xl bg-ww-surface-tint" disabled={disabled} onClick={() => updateValue(numericValue + 1)} type="button">+</button>
    </div>
  );
}

export interface SafeAreaProps extends HTMLAttributes<HTMLDivElement> {
  position?: 'bottom' | 'top';
}

export function SafeArea({ className, position = 'bottom', style, ...props }: SafeAreaProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn('adm-safe-area', `adm-safe-area-position-${position}`, 'ww-k-safe-area', className)}
      style={{ height: `env(safe-area-inset-${position})`, ...style }}
    />
  );
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
  gap?: number | [number, number];
}

function GridItem({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props}>{children}</div>;
}

function GridRoot({ children, className, columns = 1, gap = 0, style, ...props }: GridProps) {
  const [columnGap, rowGap] = Array.isArray(gap) ? gap : [gap, gap];
  return (
    <div
      {...props}
      className={cn('ww-k-grid grid', className)}
      style={{ columnGap, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, rowGap, ...style }}
    >
      {children}
    </div>
  );
}

export const Grid = Object.assign(GridRoot, { Item: GridItem });

export interface SpaceProps extends HTMLAttributes<HTMLDivElement> {
  wrap?: boolean;
}

export function Space({ children, className, wrap, ...props }: SpaceProps) {
  return <div className={cn('ww-k-space flex gap-2', wrap && 'flex-wrap', className)} {...props}>{children}</div>;
}

interface SkeletonPieceProps extends HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
  lineCount?: number;
}

function SkeletonTitle({ animated, className, ...props }: SkeletonPieceProps) {
  return <div {...props} className={cn('adm-skeleton-title ww-k-skeleton h-5 w-2/5 rounded-md', animated && 'animate-pulse', className)} />;
}

function SkeletonParagraph({ animated, className, lineCount = 3, ...props }: SkeletonPieceProps) {
  return (
    <div {...props} className={cn('adm-skeleton-paragraph mt-4 space-y-3', className)}>
      {Array.from({ length: lineCount }, (_, index) => (
        <div
          className={cn('ww-k-skeleton h-3 rounded', animated && 'animate-pulse', index === lineCount - 1 && 'w-4/5')}
          key={index}
        />
      ))}
    </div>
  );
}

export const Skeleton = {
  Paragraph: SkeletonParagraph,
  Title: SkeletonTitle,
};

export interface TagProps extends HTMLAttributes<HTMLDivElement> {
  fill?: 'outline' | 'solid';
}

export function Tag({ children, className, fill, ...props }: TagProps) {
  return <div {...props} className={cn('adm-tag ww-k-tag inline-flex items-center rounded-full px-2 py-1 text-xs', fill === 'outline' ? 'border border-current' : 'bg-primary-light text-primary-deep', className)}>{children}</div>;
}

export interface SwipeActionItem {
  color?: 'danger' | 'light' | 'primary' | 'success' | 'warning' | string;
  key: number | string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  text: ReactNode;
}

export interface SwipeActionProps extends HTMLAttributes<HTMLDivElement> {
  leftActions?: SwipeActionItem[];
  rightActions?: SwipeActionItem[];
}

export function SwipeAction({ children, className, leftActions = [], rightActions = [], ...props }: SwipeActionProps) {
  const leftWidth = leftActions.length * 76;
  const rightWidth = rightActions.length * 76;
  const x = useMotionValue(0);
  const [activeSide, setActiveSide] = useState<'left' | 'right' | null>(null);
  const draggedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const snapTo = (target: number) => {
    x.stop();
    setActiveSide(target > 0 ? 'left' : target < 0 ? 'right' : null);
    animate(x, target, { type: 'spring', stiffness: 520, damping: 42 });
  };
  useDrag(({ down, first, offset: [offset] }) => {
    if (first) {
      x.stop();
      draggedRef.current = true;
    }
    if (down) {
      x.set(offset);
      return;
    }
    const target = offset > leftWidth * 0.35 && leftWidth > 0
      ? leftWidth
      : offset < -rightWidth * 0.35 && rightWidth > 0 ? -rightWidth : 0;
    snapTo(target);
  }, {
    axis: 'x',
    bounds: { left: -rightWidth, right: leftWidth },
    filterTaps: true,
    from: () => [x.get(), 0],
    rubberband: false,
    target: contentRef,
  });
  const renderActions = (actions: SwipeActionItem[], isActive: boolean) => actions.map(action => (
    <button
      className={cn('ww-k-swipe-action__button', `ww-k-swipe-action__action--${action.color ?? 'primary'}`)}
      key={action.key}
      onClick={(event) => {
        snapTo(0);
        action.onClick?.(event);
      }}
      tabIndex={isActive ? 0 : -1}
      type="button"
    >
      {action.text}
    </button>
  ));
  return (
    <div {...props} className={cn('adm-swipe-action ww-k-swipe-action relative overflow-hidden', className)} data-tab-swipe-ignore>
      {leftWidth > 0 && <div aria-hidden={activeSide !== 'left'} className="ww-k-swipe-action__actions absolute inset-y-0 left-0 flex" style={{ width: leftWidth }}>{renderActions(leftActions, activeSide === 'left')}</div>}
      {rightWidth > 0 && <div aria-hidden={activeSide !== 'right'} className="ww-k-swipe-action__actions absolute inset-y-0 right-0 flex" style={{ width: rightWidth }}>{renderActions(rightActions, activeSide === 'right')}</div>}
      <m.div
        className="ww-k-swipe-action__content relative z-[1] w-full touch-pan-y"
        onClickCapture={(event) => {
          const wasDrag = draggedRef.current;
          if (!wasDrag && Math.abs(x.get()) < 1)
            return;
          event.preventDefault();
          event.stopPropagation();
          draggedRef.current = false;
          if (!wasDrag)
            snapTo(0);
        }}
        onPointerDownCapture={() => {
          draggedRef.current = false;
        }}
        ref={contentRef}
        style={{ x }}
      >
        {children}
      </m.div>
    </div>
  );
}

export interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  hasMore: boolean;
  loadMore: () => Promise<unknown> | unknown;
  threshold?: number;
}

export function InfiniteScroll({ children, className, hasMore, loadMore, threshold = 250, ...props }: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  useEffect(() => {
    if (!hasMore || !sentinelRef.current || typeof IntersectionObserver === 'undefined')
      return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting) || isLoadingRef.current)
        return;
      isLoadingRef.current = true;
      Promise.resolve(loadMore()).finally(() => {
        isLoadingRef.current = false;
      });
    }, { rootMargin: `${threshold}px 0px` });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore, threshold]);
  return (
    <div {...props} className={cn('adm-infinite-scroll ww-k-infinite-scroll flex min-h-11 items-center justify-center py-3 text-xs text-ww-soft', className)} ref={sentinelRef}>
      {children ?? (hasMore ? <SpinLoading /> : null)}
    </div>
  );
}

export function CloseIconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-full border-0 bg-black/5 text-ww-mid" onClick={onClick} type="button">
      <X aria-hidden size={19} />
    </button>
  );
}

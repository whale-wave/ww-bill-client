import type { FC, ReactNode } from 'react';
import { Input, Selector } from 'antd-mobile';
import { CircleDollarSign, WalletCards } from 'lucide-react';
import { AppButton, AppModal } from '@/shared/ui';

export interface BudgetEditorCategoryOption {
  label: ReactNode;
  value: string;
}

interface BudgetEditorPresentationProps {
  amount: string;
  amountPlaceholder: string;
  cancelLabel: ReactNode;
  categoryDisabled?: boolean;
  categoryEmptyContent?: ReactNode;
  categoryOptions?: BudgetEditorCategoryOption[];
  categoryValue?: string;
  inputName?: string;
  isSaving?: boolean;
  onAfterClose?: () => void;
  onAmountChange: (value: string) => void;
  onCancel: () => void;
  onCategoryChange?: (value: string) => void;
  onSave: () => void | Promise<void>;
  saveLabel: ReactNode;
  title: ReactNode;
  visible: boolean;
}

export const BudgetEditorPresentation: FC<BudgetEditorPresentationProps> = ({
  amount,
  amountPlaceholder,
  cancelLabel,
  categoryDisabled = false,
  categoryEmptyContent,
  categoryOptions,
  categoryValue,
  inputName,
  isSaving = false,
  onAfterClose,
  onAmountChange,
  onCancel,
  onCategoryChange,
  onSave,
  saveLabel,
  title,
  visible,
}) => (
  <AppModal
    actions={[]}
    afterClose={onAfterClose}
    bodyClassName="!box-border !max-h-[calc(100dvh-32px)] !max-w-full !p-0 [&_.adm-modal-content]:!p-0 [&_.adm-modal-footer]:!hidden"
    closeOnMaskClick={!isSaving}
    content={(
      <div data-budget-editor>
        <div className="ww-budget-editor-header border-0 border-b border-solid border-[var(--ww-component-sheet-divider)] px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--ww-component-overlay-icon-radius)] bg-[var(--ww-component-sheet-icon-background)] text-primary-deep">
              <WalletCards size={20} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-[17px] font-extrabold leading-6 text-ww-ink">{title}</h2>
              <p className="mt-0.5 text-[13px] leading-5 text-ww-mid">{amountPlaceholder}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 px-5 py-5">
          {categoryOptions !== undefined && (
            categoryOptions.length > 0
              ? (
                  <Selector
                    className="[&_.adm-selector-item]:!rounded-[var(--ww-radius-control)] [&_.adm-selector-item]:!border [&_.adm-selector-item]:!border-solid [&_.adm-selector-item]:!border-[var(--ww-component-sheet-control-border)] [&_.adm-selector-item]:!bg-[var(--ww-component-sheet-control-background)] [&_.adm-selector-item]:!px-3 [&_.adm-selector-item]:!py-3 [&_.adm-selector-item-active]:!border-primary [&_.adm-selector-item-active]:!bg-[var(--ww-component-sheet-selected-background)] [&_.adm-selector-item-active]:!text-primary-deep"
                    columns={1}
                    disabled={categoryDisabled}
                    onChange={values => onCategoryChange?.(String(values[0] ?? ''))}
                    options={categoryOptions}
                    value={categoryValue ? [categoryValue] : []}
                  />
                )
              : <p className="rounded-[var(--ww-radius-control)] bg-[var(--ww-component-sheet-subtle-background)] px-4 py-3 text-[13px] leading-5 text-ww-mid">{categoryEmptyContent}</p>
          )}
          <label className="block">
            <span className="mb-2 block text-[12px] font-bold text-ww-mid">{amountPlaceholder}</span>
            <div className="flex h-14 items-center gap-2 rounded-[var(--ww-radius-control)] border border-solid border-[var(--ww-component-sheet-control-border)] bg-[var(--ww-component-sheet-control-background)] px-4 transition-within focus-within:border-primary focus-within:ring-2 focus-within:ring-[var(--ww-component-sheet-focus-ring)]">
              <CircleDollarSign className="shrink-0 text-primary-deep" size={20} strokeWidth={1.7} />
              <span className="text-[20px] font-extrabold text-ww-ink">¥</span>
              <Input
                className="text-[22px] font-extrabold text-ww-ink"
                name={inputName}
                onChange={onAmountChange}
                placeholder="0.00"
                type="number"
                value={amount}
              />
            </div>
          </label>
          <div className="grid grid-cols-[0.9fr_1.1fr] gap-2 pt-1">
            <AppButton
              className="!border-0 !bg-[var(--ww-component-overlay-secondary-background)] !text-[var(--ww-component-overlay-secondary-foreground)] !shadow-none"
              disabled={isSaving}
              fullWidth
              onClick={onCancel}
              variant="secondary"
            >
              {cancelLabel}
            </AppButton>
            <AppButton
              className="ww-theme-primary-action !shadow-none"
              disabled={isSaving || (categoryOptions !== undefined && categoryOptions.length === 0)}
              fullWidth
              loading={isSaving}
              onClick={() => void onSave()}
            >
              {saveLabel}
            </AppButton>
          </div>
        </div>
      </div>
    )}
    onClose={onCancel}
    visible={visible}
  />
);

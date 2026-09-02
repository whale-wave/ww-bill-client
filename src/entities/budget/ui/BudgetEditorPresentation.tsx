import type { FC, ReactNode } from 'react';
import { Input, Modal, Selector } from 'antd-mobile';
import { CircleDollarSign, WalletCards } from 'lucide-react';
import {
  BUDGET_CENTER_POPUP_CLASS_NAME,
  BUDGET_OVERLAY_MASK_CLASS_NAME,
} from './budget-overlay-styles';

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
  <Modal
    actions={[]}
    afterClose={onAfterClose}
    bodyClassName="!box-border !max-h-[calc(100dvh-32px)] !w-full !max-w-full !overflow-hidden !rounded-[26px] !border !border-solid !border-white/80 !bg-white/95 !p-0 !shadow-ww-floating [&_.adm-modal-content]:!p-0 [&_.adm-modal-footer]:!hidden"
    className={BUDGET_CENTER_POPUP_CLASS_NAME}
    closeOnMaskClick={!isSaving}
    content={(
      <div data-budget-editor>
        <div className="ww-budget-editor-header px-5 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/80 bg-white/75 text-primary-deep shadow-ww-xs">
              <WalletCards size={22} strokeWidth={1.7} />
            </span>
            <div>
              <h2 className="text-[18px] font-extrabold leading-6 text-ww-ink">{title}</h2>
              <p className="mt-0.5 text-[11px] text-ww-mid">{amountPlaceholder}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 px-5 py-5">
          {categoryOptions !== undefined && (
            categoryOptions.length > 0
              ? (
                  <Selector
                    className="[&_.adm-selector-item]:!rounded-[13px] [&_.adm-selector-item]:!border [&_.adm-selector-item]:!border-solid [&_.adm-selector-item]:!border-border-primary [&_.adm-selector-item]:!bg-white [&_.adm-selector-item]:!px-3 [&_.adm-selector-item]:!py-2.5 [&_.adm-selector-item-active]:!border-primary [&_.adm-selector-item-active]:!bg-primary-light/45 [&_.adm-selector-item-active]:!text-primary-deep"
                    columns={1}
                    disabled={categoryDisabled}
                    onChange={values => onCategoryChange?.(String(values[0] ?? ''))}
                    options={categoryOptions}
                    value={categoryValue ? [categoryValue] : []}
                  />
                )
              : <p className="rounded-[14px] bg-ww-surface-tint px-4 py-3 text-[13px] text-ww-mid">{categoryEmptyContent}</p>
          )}
          <label className="block">
            <span className="mb-2 block text-[12px] font-bold text-ww-mid">{amountPlaceholder}</span>
            <div className="flex h-14 items-center gap-2 rounded-[16px] border border-solid border-border-primary bg-white px-4 shadow-ww-xs transition-within focus-within:border-primary">
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
          <div className="grid grid-cols-[0.82fr_1.18fr] gap-3 pt-1">
            <button
              className="h-12 rounded-[15px] border-0 bg-ww-surface-tint text-[13px] font-bold text-ww-mid disabled:opacity-50"
              disabled={isSaving}
              onClick={onCancel}
              type="button"
            >
              {cancelLabel}
            </button>
            <button
              className="ww-theme-primary-action h-12 rounded-[15px] border-0 text-[13px] font-bold disabled:opacity-50"
              disabled={isSaving || (categoryOptions !== undefined && categoryOptions.length === 0)}
              onClick={() => void onSave()}
              type="button"
            >
              {saveLabel}
            </button>
          </div>
        </div>
      </div>
    )}
    maskClassName={BUDGET_OVERLAY_MASK_CLASS_NAME}
    onClose={onCancel}
    visible={visible}
  />
);

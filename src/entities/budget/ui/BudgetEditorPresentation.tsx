import type { FC, ReactNode } from 'react';
import { Input, Modal, Selector } from 'antd-mobile';

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
    actions={[
      {
        disabled: isSaving || (categoryOptions !== undefined && categoryOptions.length === 0),
        key: 'confirm',
        onClick: onSave,
        primary: true,
        text: saveLabel,
      },
      {
        disabled: isSaving,
        key: 'cancel',
        onClick: onCancel,
        text: cancelLabel,
      },
    ]}
    afterClose={onAfterClose}
    closeOnMaskClick={!isSaving}
    content={(
      <div className="space-y-3 py-3" data-budget-editor>
        {categoryOptions !== undefined && (
          categoryOptions.length > 0
            ? (
                <Selector
                  columns={1}
                  disabled={categoryDisabled}
                  onChange={values => onCategoryChange?.(String(values[0] ?? ''))}
                  options={categoryOptions}
                  value={categoryValue ? [categoryValue] : []}
                />
              )
            : <p className="text-sm text-font-gray">{categoryEmptyContent}</p>
        )}
        <div className="!bg-[#fcfcfc] p-2">
          <Input
            name={inputName}
            onChange={onAmountChange}
            placeholder={amountPlaceholder}
            type="number"
            value={amount}
          />
        </div>
      </div>
    )}
    onClose={onCancel}
    title={title}
    visible={visible}
  />
);

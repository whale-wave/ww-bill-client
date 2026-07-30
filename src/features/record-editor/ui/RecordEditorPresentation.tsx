import type { FC } from 'react';
import type { RecordEditorTag } from '../model/types';
import type { RecordEditorController } from '../model/useRecordEditorController';
import type { CategoryEntity } from '@/entities/category';
import {
  Button,
  DatePicker,
  ErrorBlock,
  Popup,
  SpinLoading,
} from 'antd-mobile';
import { useCallback } from 'react';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Icon } from '@/shared/ui';
import { KEYPAD_LAYOUT } from '../model/constants';

export type RecordEditorCategoryState = 'error' | 'loading' | 'ready';

interface RecordEditorPresentationProps {
  categories: CategoryEntity[];
  categoryState: RecordEditorCategoryState;
  controller: RecordEditorController;
  onCancel: () => void;
  onRetryCategories?: () => void;
  tags?: RecordEditorTag[];
}

export const RecordEditorPresentation: FC<RecordEditorPresentationProps> = ({
  categories,
  categoryState,
  controller,
  onCancel,
  onRetryCategories,
  tags = [],
}) => {
  const { t } = useTranslation(['record', 'ledger', 'common']);
  const renderDateLabel = useCallback((type: string, value: number) => {
    const labelKeys: Record<string, string> = {
      day: 'common:time.day',
      hour: 'common:time.hour',
      minute: 'common:time.minute',
      month: 'common:time.month',
      second: 'common:time.second',
      year: 'common:time.year',
    };
    return labelKeys[type] ? `${value}${t(labelKeys[type]!)}` : value;
  }, [t]);
  const hasSelectedCategory = Boolean(controller.selectedCategory);
  const showNumericKeypad = hasSelectedCategory && !controller.isNoteFocused;

  return (
    <div
      className="flex h-full select-none flex-col [-webkit-touch-callout:none]"
      data-record-editor-presentation
    >
      <header className="flex bg-primary">
        <button
          className="ml-[21px] border-0 bg-transparent py-[11px] text-base font-normal text-black"
          data-record-editor-cancel
          onClick={onCancel}
          type="button"
        >
          {t('common:nav.cancel')}
        </button>
        <div className="flex flex-grow justify-center pr-[33px]">
          {([
            { label: t('record:bookkeeping.expend'), type: 'sub' },
            { label: t('record:bookkeeping.income'), type: 'add' },
          ] as const).map((item, index) => (
            <button
              className={cn(
                'relative border-0 bg-transparent px-[5px] py-[11px] text-lg font-normal text-black',
                index === 0 && 'mr-[34px]',
                controller.recordType === item.type
                && 'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#333233] after:content-[""]',
              )}
              key={item.type}
              onClick={() => controller.handleRecordTypeChange(item.type)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main
        className={cn(
          'flex-grow overflow-auto pb-[38px]',
          showNumericKeypad && 'pb-[224px]',
        )}
      >
        {categoryState === 'loading' && (
          <div className="flex min-h-[240px] items-center justify-center">
            <SpinLoading />
          </div>
        )}
        {categoryState === 'error' && (
          <div className="flex min-h-[240px] flex-col items-center justify-center">
            <ErrorBlock description={t('common:loadErrorDescription')} />
            {onRetryCategories && (
              <Button className="mt-3" onClick={onRetryCategories} size="small">
                {t('common:retry')}
              </Button>
            )}
          </div>
        )}
        {categoryState === 'ready' && (
          <div className="flex flex-wrap pb-[10px] pt-5">
            {categories.map(category => (
              <button
                aria-pressed={controller.selectedCategory?.id === category.id}
                className="mb-5 flex w-[24%] flex-col items-center border-0 bg-transparent p-0 [&:not(:nth-child(4n))]:mr-[calc(4%/3)]"
                data-record-editor-category={category.id}
                key={category.id}
                onClick={() => controller.handleSelectCategory(category)}
                type="button"
              >
                <span
                  className={cn(
                    'mb-[5px] flex size-[55px] items-center justify-center overflow-hidden rounded-full bg-[#cccc]',
                    controller.selectedCategory?.id === category.id && 'bg-primary',
                  )}
                >
                  <Icon className="text-[30px]" name={category.icon} />
                </span>
                <span className="text-sm font-normal text-black">{category.name}</span>
              </button>
            ))}
          </div>
        )}
      </main>

      {hasSelectedCategory && (
        <section
          className="fixed inset-x-0 bottom-0 flex flex-col overflow-hidden"
          data-record-editor-keypad
        >
          <div className="flex flex-wrap items-center border-t border-solid border-[#ccc] bg-white">
            <div className="mb-[-2px] flex h-[39px] flex-grow items-center border-b border-solid border-[#ccc] py-[5px]">
              <span className="ml-[26px] mr-[13px] min-w-[30px] text-sm font-normal text-[#333233]">
                {t('record:bookkeeping.note')}
                :
              </span>
              <input
                className="min-w-[80px] flex-1 select-text border-0 bg-transparent pr-2 outline-none [-webkit-user-select:text]"
                onBlur={() => controller.setIsNoteFocused(false)}
                onChange={event => controller.setRemark(event.target.value)}
                onFocus={() => controller.setIsNoteFocused(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.stopPropagation();
                    void controller.handleSubmit();
                  }
                }}
                placeholder={t('record:bookkeeping.notePlaceholder')}
                type="text"
                value={controller.remark}
              />
              {tags.length > 0 && (
                <button
                  className="mr-2 shrink-0 border-0 bg-transparent px-1 text-sm text-font-gray"
                  data-record-editor-tag-trigger
                  onClick={() => controller.setIsTagPickerVisible(true)}
                  type="button"
                >
                  #
                  {controller.selectedTagIds.length || ''}
                </button>
              )}
            </div>
            <span className="min-w-[60px] overflow-auto px-[10px] text-center text-2xl font-normal text-black [&::-webkit-scrollbar]:hidden">
              {controller.calculator.totals}
            </span>
          </div>

          {showNumericKeypad && (
            <div className="flex">
              <div className="flex flex-[3] flex-wrap bg-[#f3f3f3]">
                {KEYPAD_LAYOUT.map((item, index) => (
                  <button
                    className={cn(
                      'flex h-[46.5px] w-1/3 items-center justify-center border-0 border-r border-t border-solid border-[#ccc] bg-[#f3f3f3] text-xl font-normal text-[#333233]',
                      controller.activeKeyIndex === index && 'bg-[#c5c5c5]',
                    )}
                    key={String(item.keys)}
                    onClick={() => controller.handleKeyClick(item.keys)}
                    onTouchMove={controller.handleKeyTouchMove}
                    onTouchStart={() => controller.handleKeyTouchStart(index)}
                    type="button"
                  >
                    {item.keys}
                  </button>
                ))}
              </div>
              <div className="flex flex-1 flex-col bg-[#f3f3f3]">
                <button
                  className="flex h-[46.5px] items-center justify-center border-0 border-t border-solid border-[#ccc] bg-transparent text-base"
                  onClick={() => controller.setIsDatePickerVisible(true)}
                  onTouchMove={controller.handleKeyTouchMove}
                  onTouchStart={() => controller.handleKeyTouchStart(5)}
                  type="button"
                >
                  {controller.isToday
                    ? (
                        <>
                          <Icon className="text-[21px]" name="today" />
                          <span className="ml-1">{t('common:time.today')}</span>
                        </>
                      )
                    : <span>{controller.formattedDate}</span>}
                </button>
                {['+', '-'].map((operator, index) => (
                  <button
                    className={cn(
                      'flex h-[46.5px] items-center justify-center border-0 border-t border-solid border-[#ccc] bg-transparent text-base',
                      controller.activeSideIndex === index + 1 && 'bg-[#c5c5c5]',
                    )}
                    key={operator}
                    onClick={() => controller.handleOperatorClick(operator)}
                    onTouchMove={controller.handleKeyTouchMove}
                    onTouchStart={() => controller.handleKeyTouchStart(index + 1)}
                    type="button"
                  >
                    {operator}
                  </button>
                ))}
                <button
                  className="flex h-[46.5px] items-center justify-center border-0 border-t border-solid border-[#ccc] bg-primary text-base active:shadow-[inset_0_0_10px_8px_#c5c5c5]"
                  disabled={controller.isSubmitting}
                  onClick={() => void controller.handleSubmit()}
                  onTouchMove={controller.handleKeyTouchMove}
                  onTouchStart={() => controller.handleKeyTouchStart(3)}
                  type="button"
                >
                  {controller.calculator.completeText}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <DatePicker
        onClose={() => controller.setIsDatePickerVisible(false)}
        onConfirm={(value) => {
          controller.setDate(value);
          controller.setIsDatePickerVisible(false);
        }}
        renderLabel={renderDateLabel}
        title={t('record:bookkeeping.selectTime')}
        value={controller.date}
        visible={controller.isDatePickerVisible}
      />

      <Popup
        bodyClassName="max-h-[55vh] overflow-auto rounded-t-[5px] bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4"
        destroyOnClose
        onMaskClick={() => controller.setIsTagPickerVisible(false)}
        onClose={() => controller.setIsTagPickerVisible(false)}
        position="bottom"
        visible={controller.isTagPickerVisible}
      >
        <div className="mb-3 text-center text-base text-font-black">
          {t('ledger:records.tags')}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              aria-pressed={controller.selectedTagIds.includes(tag.id)}
              className={cn(
                'min-h-[36px] rounded-[4px] border border-solid border-[#EBEBEB] bg-white px-3 text-sm',
                controller.selectedTagIds.includes(tag.id) && 'border-primary bg-primary',
              )}
              key={tag.id}
              onClick={() => controller.handleToggleTag(tag.id)}
              type="button"
            >
              {tag.name}
            </button>
          ))}
        </div>
      </Popup>
    </div>
  );
};

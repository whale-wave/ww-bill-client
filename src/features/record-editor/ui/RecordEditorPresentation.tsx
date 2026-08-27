import type { FC } from 'react';
import type { RecordEditorTag } from '../model/types';
import type { RecordEditorController } from '../model/useRecordEditorController';
import type { CategoryEntity } from '@/entities/category';
import { Button, DatePicker, ErrorBlock, Popup, SpinLoading } from 'antd-mobile';
import { Delete as BackspaceIcon, ImagePlus, Tags, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { CategoryIcon } from '@/entities/category';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { DesignIcon, IllustratedEmptyState } from '@/shared/ui';
import { KEYPAD_LAYOUT } from '../model/constants';

export type RecordEditorCategoryState = 'error' | 'loading' | 'ready';

interface RecordEditorPresentationProps {
  canManageTags?: boolean;
  categories: CategoryEntity[];
  categoryState: RecordEditorCategoryState;
  controller: RecordEditorController;
  onCancel: () => void;
  onRetryCategories?: () => void;
  onCreateTag?: (name: string) => Promise<{ id: string; name: string }>;
  tags?: RecordEditorTag[];
}

export const RecordEditorPresentation: FC<RecordEditorPresentationProps> = ({
  categories,
  canManageTags = false,
  categoryState,
  controller,
  onCancel,
  onRetryCategories,
  onCreateTag,
  tags,
}) => {
  const { t } = useTranslation(['record', 'ledger', 'common']);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<'amount' | 'category'>(
    controller.selectedCategory ? 'amount' : 'category',
  );
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
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
  const showNumericKeypad = stage === 'amount' && !controller.isNoteFocused;
  const showOperatorControls = Number.parseFloat(controller.calculator.totals) > 0;

  const handleBack = () => {
    if (stage === 'amount') {
      controller.setIsNoteFocused(false);
      setStage('category');
      return;
    }
    onCancel();
  };

  return (
    <div
      className="page select-none pt-[max(8px,env(safe-area-inset-top))] [-webkit-touch-callout:none]"
      data-record-editor-presentation
      data-record-editor-stage={stage}
    >
      <header
        className={cn(
          'flex shrink-0 items-start justify-between gap-3',
          stage === 'category'
            ? 'h-[58px] px-5 pb-[14px] pt-1'
            : 'h-14 px-[22px] pb-4',
        )}
        data-record-editor-header
      >
        <button
          aria-label={t('common:nav.cancel')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border-primary bg-white/90 text-ww-mid shadow-ww-xs"
          data-record-editor-cancel
          onClick={handleBack}
          type="button"
        >
          <DesignIcon name="editor-back" size={18} />
        </button>
        {stage === 'category'
          ? (
              <div className="flex rounded-[14px] border border-border-primary bg-white/[0.85] p-1 shadow-ww-xs">
                {([
                  { label: t('record:bookkeeping.expend'), type: 'sub' },
                  { label: t('record:bookkeeping.income'), type: 'add' },
                ] as const).map(item => (
                  <button
                    className={cn(
                      'rounded-[10px] px-[22px] py-[7px] text-[13px] font-bold leading-[19.5px] transition',
                      controller.recordType === item.type
                        ? item.type === 'sub'
                          ? 'bg-[linear-gradient(154.093deg,#f0a0b8_0%,#d06080_100%)] text-white shadow-ww-xs'
                          : 'bg-[linear-gradient(154.093deg,#6fc2dc_0%,#4aaac4_100%)] text-white shadow-ww-xs'
                        : 'text-ww-soft',
                    )}
                    key={item.type}
                    onClick={() => {
                      controller.handleRecordTypeChange(item.type);
                      setStage('category');
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )
          : (
              <div className="flex h-7 items-center rounded-full bg-primary-light px-[14px] py-1 text-[13px] font-bold leading-[19.5px] text-primary-deep">
                {controller.selectedCategory?.name}
              </div>
            )}
        <span className="h-10 w-10" />
      </header>

      {stage === 'category'
        ? (
            <main className="min-h-0 flex-grow overflow-auto px-[14px] pb-5" data-record-editor-categories>
              {categoryState === 'loading' && (
                <div className="flex min-h-[240px] items-center justify-center"><SpinLoading /></div>
              )}
              {categoryState === 'error' && (
                <div className="flex min-h-[240px] flex-col items-center justify-center">
                  <ErrorBlock description={t('common:error.loadFail')} />
                  {onRetryCategories && (
                    <Button className="mt-3" onClick={onRetryCategories} size="small">
                      {t('common:retry')}
                    </Button>
                  )}
                </div>
              )}
              {categoryState === 'ready' && categories.length === 0 && (
                <div className="rounded-[24px] border border-solid border-border-primary bg-white/65 shadow-ww-xs backdrop-blur-xl">
                  <IllustratedEmptyState
                    className="min-h-[360px]"
                    description={t('record:bookkeeping.emptyCategoryDescription')}
                    icon={<Tags className="text-primary-deep" size={42} strokeWidth={1.5} />}
                    testId="record-editor-empty-state"
                    title={t('record:bookkeeping.emptyCategoryTitle')}
                  />
                </div>
              )}
              {categoryState === 'ready' && categories.length > 0 && (
                <div className="grid grid-cols-4 gap-[9px]">
                  {categories.map((category, index) => (
                    <button
                      aria-pressed={controller.selectedCategory?.id === category.id}
                      className="flex h-[92.5px] min-w-0 flex-col items-center gap-[7px] rounded-[18px] border border-border-primary bg-white/80 px-1 pb-[10px] pt-[13px] shadow-ww-xs transition active:scale-95"
                      data-record-editor-category={category.id}
                      key={category.id}
                      onClick={() => {
                        controller.handleSelectCategory(category);
                        setStage('amount');
                      }}
                      type="button"
                    >
                      <span className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-full text-primary-deep',
                        index % 4 === 1
                          ? 'bg-[#fff0f5] text-[#cf7894]'
                          : index % 4 === 2
                            ? 'bg-[#f1ecff] text-[#8d78c7]'
                            : index % 4 === 3
                              ? 'bg-[#e7f7f0] text-[#4d9d82]'
                              : 'bg-[#e4f5fa]',
                      )}
                      >
                        <CategoryIcon categoryName={category.name} iconKey={category.icon} size={24} />
                      </span>
                      <span className="w-full truncate text-[11px] font-semibold leading-[16.5px] text-ww-mid">{category.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </main>
          )
        : (
            <main className="flex min-h-0 flex-grow flex-col" data-record-editor-amount>
              <label className="mx-[22px] flex h-[50px] shrink-0 items-center rounded-[14px] border border-border-primary bg-white/[0.84] px-4 shadow-ww-xs" data-record-editor-note>
                <input
                  className="min-w-0 flex-1 select-text border-0 bg-transparent py-3 text-[14px] leading-[normal] text-ww-ink outline-none placeholder:text-[rgba(38,51,64,0.5)] [-webkit-user-select:text]"
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
                {tags !== undefined && (
                  <button
                    className="shrink-0 border-0 bg-transparent px-1 text-[13px] font-semibold text-primary-deep"
                    data-record-editor-tag-trigger
                    onClick={() => controller.setIsTagPickerVisible(true)}
                    type="button"
                  >
                    #
                    {' '}
                    {controller.selectedTagIds.length || ''}
                  </button>
                )}
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file)
                      void controller.handleSelectImage(file);
                  }}
                  ref={imageInputRef}
                  type="file"
                />
                <button
                  aria-label="选择图片"
                  className="ml-1 shrink-0 border-0 bg-transparent p-1 text-primary-deep"
                  onClick={() => imageInputRef.current?.click()}
                  type="button"
                >
                  <ImagePlus size={18} />
                </button>
              </label>
              {(controller.imagePreviewUrl || controller.hasInitialImage) && (
                <div className="mx-[22px] mt-2 flex items-center gap-2 text-xs text-ww-soft" data-record-editor-image>
                  {controller.imagePreviewUrl
                    ? <img alt="待上传凭证" className="h-11 w-11 rounded-lg object-cover" src={controller.imagePreviewUrl} />
                    : <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light"><ImagePlus size={18} /></span>}
                  <span>{controller.isImageUploading ? '正在上传图片…' : controller.imageUploadError ? '上传失败，可重新选择' : '已添加凭证图片'}</span>
                  <button aria-label="移除图片" className="ml-auto p-1 text-ww-mid" onClick={controller.handleRemoveImage} type="button"><X size={16} /></button>
                </div>
              )}

              <div className="relative flex min-h-[220px] flex-grow flex-col items-center justify-center text-center">
                <div className="pb-2 text-[11px] font-semibold leading-[16.5px] tracking-[0.5px] text-ww-soft">
                  {controller.recordType === 'sub' ? t('record:bookkeeping.expend') : t('record:bookkeeping.income')}
                  {t('record:bookkeeping.amount')}
                </div>
                <div className="h-[81px] max-w-full overflow-x-auto whitespace-nowrap font-number text-[54px] font-black leading-[81px] tracking-[-1.5px] text-ww-ink [&::-webkit-scrollbar]:hidden" data-record-editor-total>
                  <span className="mr-1 text-[26px] font-bold leading-[39px] tracking-normal text-ww-soft">¥</span>
                  {controller.calculator.totals}
                </div>
                <span className="mt-[10px] h-[2.5px] w-10 rounded-sm bg-primary opacity-70" />
                {showOperatorControls && (
                  <div className="absolute bottom-3 flex gap-2" data-record-editor-operators>
                    {['+', '-'].map((operator, index) => (
                      <button
                        className={cn(
                          'flex h-8 w-11 items-center justify-center rounded-[10px] border border-border-primary bg-white/80 font-number text-lg font-bold text-primary-deep shadow-ww-xs',
                          controller.activeSideIndex === index + 1 && 'bg-primary-light',
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
                  </div>
                )}
              </div>

              <section
                className="shrink-0 border-t border-solid border-border-primary bg-white/70 px-4 pb-[calc(38px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
                data-record-editor-keypad
              >
                <div className="grid grid-cols-[1fr_1fr] gap-[10px]">
                  <button
                    className="flex h-[50px] items-center justify-center rounded-[16px] border border-border-primary bg-white/80 px-2 text-[14px] font-bold leading-[21px] text-ww-mid active:bg-primary-light"
                    onClick={() => controller.setIsDatePickerVisible(true)}
                    type="button"
                  >
                    <DesignIcon className="mr-1" name="editor-date" size={16} />
                    {controller.isToday ? t('common:time.today') : controller.formattedDate}
                  </button>
                  <button
                    className="h-[50px] rounded-[16px] bg-[linear-gradient(163.094deg,#6fc2dc_0%,#4aaac4_100%)] px-4 text-[15px] font-extrabold leading-[22.5px] text-white shadow-[0_5px_9px_rgba(74,170,200,0.4)] disabled:opacity-50"
                    disabled={controller.isSubmitting || controller.isImageUploading}
                    onClick={() => void controller.handleSubmit()}
                    type="button"
                  >
                    {controller.calculator.completeText}
                  </button>
                </div>
                {showNumericKeypad && (
                  <div className="mt-[10px] grid grid-cols-3 gap-2">
                    {KEYPAD_LAYOUT.map((item, index) => (
                      <button
                        aria-label={item.keys === 'x' ? t('record:bookkeeping.backspace') : undefined}
                        className={cn(
                          'flex h-[54px] items-center justify-center rounded-[16px] border border-border-primary bg-white/90 font-number text-[21px] font-bold leading-[31.5px] text-ww-ink shadow-ww-xs',
                          item.keys === 'x' && 'gap-1.5 border-primary-light bg-primary-light/55 font-sans text-[12px] text-primary-deep',
                          controller.activeKeyIndex === index && 'bg-primary-light',
                        )}
                        key={String(item.keys)}
                        onClick={() => controller.handleKeyClick(item.keys)}
                        onTouchMove={controller.handleKeyTouchMove}
                        onTouchStart={() => controller.handleKeyTouchStart(index)}
                        type="button"
                      >
                        {item.keys === 'x'
                          ? (
                              <>
                                <BackspaceIcon aria-hidden="true" size={20} strokeWidth={1.8} />
                                <span>{t('record:bookkeeping.backspace')}</span>
                              </>
                            )
                          : item.keys}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </main>
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
        bodyClassName="max-h-[55vh] overflow-auto rounded-t-[28px] bg-white/95 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl"
        destroyOnClose
        onMaskClick={() => controller.setIsTagPickerVisible(false)}
        onClose={() => controller.setIsTagPickerVisible(false)}
        position="bottom"
        visible={controller.isTagPickerVisible}
      >
        <div className="mb-3 text-center text-base text-font-black">{t('ledger:records.tags')}</div>
        {controller.selectedTagIds.length > 0 && (
          <button className="mb-3 text-sm text-primary-deep" onClick={controller.handleClearTag} type="button">清除标签</button>
        )}
        {controller.selectedTagIds.length > 1 && (
          <div className="mb-3 text-sm text-ww-soft">
            已保留
            {controller.selectedTagIds.length}
            {' '}
            个历史标签；选择后会收敛为单标签。
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {(tags ?? []).map(tag => (
            <button
              aria-pressed={controller.selectedTagIds.includes(tag.id)}
              className={cn(
                'min-h-[36px] rounded-full border border-solid px-3 text-sm',
                controller.selectedTagIds.includes(tag.id)
                  ? 'border-primary bg-primary text-white'
                  : 'border-border-primary bg-white text-ww-mid',
              )}
              key={tag.id}
              onClick={() => controller.handleToggleTag(tag.id)}
              type="button"
            >
              {tag.name}
            </button>
          ))}
        </div>
        {canManageTags && onCreateTag && (
          <form
            className="mt-4 flex gap-2 border-t border-border-primary pt-3"
            onSubmit={(event) => {
              event.preventDefault();
              const name = newTagName.trim();
              if (!name || isCreatingTag)
                return;
              setIsCreatingTag(true);
              void onCreateTag(name)
                .then((tag) => {
                  controller.handleToggleTag(tag.id);
                  setNewTagName('');
                })
                .finally(() => setIsCreatingTag(false));
            }}
          >
            <input
              className="min-w-0 flex-1 rounded-xl border border-border-primary px-3 py-2 text-sm outline-none"
              maxLength={32}
              onChange={event => setNewTagName(event.target.value)}
              placeholder="新建标签"
              value={newTagName}
            />
            <button className="rounded-xl bg-primary px-3 text-sm font-semibold text-white disabled:opacity-50" disabled={!newTagName.trim() || isCreatingTag} type="submit">
              添加
            </button>
          </form>
        )}
      </Popup>
    </div>
  );
};

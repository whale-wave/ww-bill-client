import type { FC } from 'react';
import type { RecordEditorTag } from '../model/types';
import type { RecordEditorController } from '../model/useRecordEditorController';
import type { CategoryEntity } from '@/entities/category';
import { Button, DatePicker, ErrorBlock, Popup, SpinLoading } from 'antd-mobile';
import { Delete as BackspaceIcon, CheckCircle2, ImagePlus, Settings2, Tags, Trash2, X } from 'lucide-react';
import { m } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CategoryIcon } from '@/entities/category';
import { getRecordAttachmentContentApi } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  confirmDangerousAction,
  DesignIcon,
  IllustratedEmptyState,
  MOTION_PRESETS,
  useMotionPreference,
} from '@/shared/ui';
import { KEYPAD_LAYOUT } from '../model/constants';

export type RecordEditorCategoryState = 'error' | 'loading' | 'ready';

interface RecordEditorPresentationProps {
  canManageTags?: boolean;
  categories: CategoryEntity[];
  categoryState: RecordEditorCategoryState;
  controller: RecordEditorController;
  initialStage?: 'amount' | 'category';
  onArchiveTag?: (tagId: string) => Promise<void>;
  onCancel: () => void;
  onManageCategories?: () => void;
  onManageTags?: () => void;
  onRetryCategories?: () => void;
  onCreateTag?: (name: string) => Promise<{ id: string; name: string }>;
  remarkHistory?: string[];
  isSaveSucceeded?: boolean;
  tags?: RecordEditorTag[];
}

export const RecordEditorPresentation: FC<RecordEditorPresentationProps> = ({
  categories,
  canManageTags = false,
  categoryState,
  controller,
  initialStage,
  onArchiveTag,
  onCancel,
  onManageCategories,
  onManageTags,
  onRetryCategories,
  onCreateTag,
  remarkHistory = [],
  isSaveSucceeded = false,
  tags,
}) => {
  const { t } = useTranslation(['record', 'ledger', 'common']);
  const { handleReconcileTags, shouldReconcileTags } = controller;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentUrlRef = useRef<string>();
  const previewRequestRef = useRef(0);
  const [stage, setStage] = useState<'amount' | 'category'>(
    initialStage ?? (controller.selectedCategory ? 'amount' : 'category'),
  );
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>();
  const [contentUrl, setContentUrl] = useState<string>();
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isImagePreviewLoading, setIsImagePreviewLoading] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState<number>();
  const hasReconciledTagsRef = useRef(false);
  const categoryTransitionTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const { isMotionEnabled } = useMotionPreference();
  const attachmentId = controller.initialAttachment?.id;

  useEffect(() => {
    if (!shouldReconcileTags || tags === undefined || hasReconciledTagsRef.current)
      return;
    hasReconciledTagsRef.current = true;
    handleReconcileTags(tags.map(tag => tag.id));
  }, [handleReconcileTags, shouldReconcileTags, tags]);

  const clearContentUrl = useCallback(() => {
    previewRequestRef.current += 1;
    if (contentUrlRef.current)
      URL.revokeObjectURL(contentUrlRef.current);
    contentUrlRef.current = undefined;
    setContentUrl(undefined);
  }, []);

  useEffect(() => {
    if (!attachmentId)
      return;
    let active = true;
    let url: string | undefined;
    void getRecordAttachmentContentApi(attachmentId, 'thumbnail')
      .then((blob) => {
        if (!active)
          return;
        url = URL.createObjectURL(blob);
        setThumbnailUrl(url);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (url)
        URL.revokeObjectURL(url);
    };
  }, [attachmentId]);

  useEffect(() => clearContentUrl, [clearContentUrl]);

  useEffect(() => () => {
    if (categoryTransitionTimerRef.current)
      clearTimeout(categoryTransitionTimerRef.current);
  }, []);

  const closeImagePreview = useCallback(() => {
    setIsImagePreviewOpen(false);
    clearContentUrl();
  }, [clearContentUrl]);

  const openImagePreview = useCallback(async () => {
    setIsImagePreviewOpen(true);
    if (controller.imagePreviewUrl || !attachmentId || contentUrl)
      return;
    const request = ++previewRequestRef.current;
    setIsImagePreviewLoading(true);
    try {
      const blob = await getRecordAttachmentContentApi(attachmentId, 'content');
      if (request !== previewRequestRef.current)
        return;
      const url = URL.createObjectURL(blob);
      contentUrlRef.current = url;
      setContentUrl(url);
    }
    catch {
      if (request === previewRequestRef.current)
        setIsImagePreviewOpen(false);
    }
    finally {
      if (request === previewRequestRef.current)
        setIsImagePreviewLoading(false);
    }
  }, [attachmentId, contentUrl, controller.imagePreviewUrl]);
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
  const handleArchiveTag = useCallback(async (tagId: string, name: string) => {
    if (!onArchiveTag)
      return;
    const confirmed = await confirmDangerousAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('ledger:tags.delete'),
      description: t('ledger:tags.deleteDescription', { name }),
      title: t('ledger:tags.deleteTitle'),
    });
    if (!confirmed)
      return;
    await onArchiveTag(tagId);
    controller.handleRemoveTag(tagId);
  }, [controller, onArchiveTag, t]);
  const showNumericKeypad = stage === 'amount' && !controller.isNoteFocused;
  const showOperatorControls = Number.parseFloat(controller.calculator.totals) > 0;

  const handleBack = () => {
    onCancel();
  };

  const handleSelectCategory = useCallback((category: CategoryEntity) => {
    if (pendingCategoryId)
      return;
    controller.handleSelectCategory(category);
    if (!isMotionEnabled) {
      setStage('amount');
      return;
    }
    setPendingCategoryId(category.id);
    categoryTransitionTimerRef.current = setTimeout(() => {
      setPendingCategoryId(undefined);
      setStage('amount');
    }, 180);
  }, [controller, isMotionEnabled, pendingCategoryId]);

  const stageMotionProps = isMotionEnabled
    ? {
        animate: MOTION_PRESETS.contentSwap.animate,
        exit: MOTION_PRESETS.contentSwap.exit,
        initial: MOTION_PRESETS.contentSwap.initial,
        transition: MOTION_PRESETS.contentSwap.transition,
      }
    : { initial: false };

  return (
    <div
      className="page relative select-none pt-[max(8px,env(safe-area-inset-top))] [-webkit-touch-callout:none]"
      data-record-editor-presentation
      data-record-editor-stage={stage}
    >
      <header
        className={cn(
          'flex shrink-0 items-start justify-between gap-3',
          stage === 'category'
            ? 'h-[60px] px-5 pb-[14px] pt-1'
            : 'h-[60px] px-[22px] pb-4',
        )}
        data-record-editor-header
      >
        <button
          aria-label={t('common:nav.cancel')}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border-primary bg-white/90 text-ww-mid shadow-ww-xs"
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
                      'min-h-11 rounded-[10px] px-[22px] py-[7px] text-[13px] font-bold leading-[19.5px] transition',
                      controller.recordType === item.type
                        ? item.type === 'sub'
                          ? 'bg-[linear-gradient(154.093deg,#f0a0b8_0%,#d06080_100%)] text-white shadow-ww-xs'
                          : 'ww-theme-primary-action'
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
              <button
                aria-label="选择分类"
                className="flex h-11 items-center rounded-full border-0 bg-primary-light px-[14px] text-[13px] font-bold leading-[19.5px] text-primary-deep"
                data-record-editor-category-trigger
                onClick={() => {
                  controller.setIsNoteFocused(false);
                  setStage('category');
                }}
                type="button"
              >
                {controller.selectedCategory?.name}
              </button>
            )}
        <span className="h-11 w-11" />
      </header>

      {stage === 'category'
        ? (
            <m.main key="category" {...stageMotionProps} className="min-h-0 flex-grow overflow-auto px-[14px] pb-5" data-record-editor-categories>
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
              {categoryState === 'ready' && (categories.length > 0 || onManageCategories) && (
                <div className="grid grid-cols-4 gap-[9px]">
                  {categories.map(category => (
                    <m.button
                      aria-pressed={controller.selectedCategory?.id === category.id}
                      animate={isMotionEnabled && pendingCategoryId === category.id
                        ? { scale: [...MOTION_PRESETS.selection.scale] }
                        : { scale: 1 }}
                      aria-busy={pendingCategoryId === category.id || undefined}
                      className={cn(
                        'flex h-[92.5px] min-w-0 flex-col items-center gap-[7px] rounded-[18px] border border-border-primary bg-white/80 px-1 pb-[10px] pt-[13px] shadow-ww-xs',
                        pendingCategoryId === category.id && 'border-primary bg-primary-light/45',
                      )}
                      data-record-editor-category={category.id}
                      disabled={Boolean(pendingCategoryId)}
                      key={category.id}
                      onClick={() => handleSelectCategory(category)}
                      transition={isMotionEnabled ? MOTION_PRESETS.selection.transition : { duration: 0 }}
                      type="button"
                      whileTap={isMotionEnabled ? MOTION_PRESETS.press : undefined}
                    >
                      <span className={cn(
                        'ww-category-choice-icon flex h-11 w-11 items-center justify-center rounded-full',
                      )}
                      >
                        <CategoryIcon categoryName={category.name} iconKey={category.icon} size={24} />
                      </span>
                      <span className="w-full truncate text-[11px] font-semibold leading-[16.5px] text-ww-mid">{category.name}</span>
                    </m.button>
                  ))}
                  {onManageCategories && (
                    <m.button
                      aria-label={t('record:bookkeeping.categorySettings')}
                      className="flex h-[92.5px] min-w-0 flex-col items-center gap-[7px] rounded-[18px] border border-dashed border-primary/35 bg-primary-light/25 px-1 pb-[10px] pt-[13px] text-primary-deep shadow-ww-xs"
                      data-record-editor-category-settings
                      onClick={onManageCategories}
                      type="button"
                      whileTap={isMotionEnabled ? MOTION_PRESETS.press : undefined}
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80">
                        <Settings2 aria-hidden="true" size={22} strokeWidth={1.9} />
                      </span>
                      <span className="w-full truncate text-[11px] font-semibold leading-[16.5px]">
                        {t('record:bookkeeping.categorySettings')}
                      </span>
                    </m.button>
                  )}
                </div>
              )}
            </m.main>
          )
        : (
            <m.main key="amount" {...stageMotionProps} className="flex min-h-0 flex-grow flex-col" data-record-editor-amount>
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
                    className="min-h-11 shrink-0 border-0 bg-transparent px-1 text-[13px] font-semibold text-primary-deep"
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
                  className="ml-1 flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent p-1 text-primary-deep"
                  onClick={() => imageInputRef.current?.click()}
                  type="button"
                >
                  <ImagePlus size={18} />
                </button>
              </label>
              {controller.isNoteFocused && remarkHistory.length > 0 && (
                <section
                  aria-label={t('record:bookkeeping.remarkHistory')}
                  className="mx-[22px] mt-2 max-h-48 shrink-0 overflow-y-auto rounded-[14px] border border-border-primary bg-white/[0.96] p-2 shadow-ww-xs"
                  data-record-editor-remark-history
                >
                  <h2 className="px-2 pb-1 text-[12px] font-semibold leading-5 text-ww-soft">
                    {t('record:bookkeeping.remarkHistory')}
                  </h2>
                  <div className="flex flex-col gap-1">
                    {remarkHistory.map(remark => (
                      <button
                        aria-label={t('record:bookkeeping.selectRemarkHistory', { remark })}
                        className="min-h-11 truncate rounded-[10px] px-2 text-left text-[14px] leading-5 text-ww-ink active:bg-primary-light"
                        data-record-editor-remark-history-item={remark}
                        key={remark}
                        onClick={() => controller.setRemark(remark)}
                        onMouseDown={event => event.preventDefault()}
                        type="button"
                      >
                        {remark}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {(controller.imagePreviewUrl || controller.hasInitialImage) && (
                <div className="mx-[22px] mt-2 flex items-center gap-2 text-xs text-ww-soft" data-record-editor-image>
                  <button
                    aria-label="预览凭证图片"
                    className="shrink-0 rounded-lg border-0 bg-transparent p-0"
                    data-record-editor-image-preview
                    onClick={() => void openImagePreview()}
                    type="button"
                  >
                    {controller.imagePreviewUrl
                      ? <img alt="待上传凭证" className="h-11 w-11 rounded-lg object-cover" src={controller.imagePreviewUrl} />
                      : thumbnailUrl
                        ? <img alt="已添加凭证图片" className="h-11 w-11 rounded-lg object-cover" src={thumbnailUrl} />
                        : <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light"><ImagePlus size={18} /></span>}
                  </button>
                  <span>{controller.isImageUploading ? '正在上传图片…' : controller.imageUploadError ? '上传失败，可重新选择' : '已添加凭证图片'}</span>
                  <button
                    aria-label="移除图片"
                    className="ml-auto flex h-11 w-11 items-center justify-center p-1 text-ww-mid"
                    onClick={() => {
                      closeImagePreview();
                      controller.handleRemoveImage();
                    }}
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="relative flex min-h-0 flex-grow flex-col items-center justify-center text-center">
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
                          'flex h-11 w-11 items-center justify-center rounded-[10px] border border-border-primary bg-white/80 font-number text-lg font-bold text-primary-deep shadow-ww-xs',
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
                className="shrink-0 border-t border-solid border-border-primary bg-white/70 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
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
                  <m.button
                    className="ww-theme-primary-action h-[50px] rounded-[16px] px-4 text-[15px] font-extrabold leading-[22.5px] disabled:opacity-50"
                    disabled={controller.isSubmitting || controller.isImageUploading}
                    onClick={() => void controller.handleSubmit()}
                    type="button"
                    whileTap={isMotionEnabled ? MOTION_PRESETS.press : undefined}
                  >
                    {controller.calculator.completeText}
                  </m.button>
                </div>
                {showNumericKeypad && (
                  <div className="mt-[10px] grid grid-cols-3 gap-2">
                    {KEYPAD_LAYOUT.map((item, index) => (
                      <m.button
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
                        whileTap={isMotionEnabled ? MOTION_PRESETS.press : undefined}
                      >
                        {item.keys === 'x'
                          ? (
                              <>
                                <BackspaceIcon aria-hidden="true" size={20} strokeWidth={1.8} />
                                <span>{t('record:bookkeeping.backspace')}</span>
                              </>
                            )
                          : item.keys}
                      </m.button>
                    ))}
                  </div>
                )}
              </section>
            </m.main>
          )}

      {isSaveSucceeded && (
        <m.div
          animate={MOTION_PRESETS.success.animate}
          aria-live="polite"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white/35 px-6 backdrop-blur-sm"
          initial={isMotionEnabled ? MOTION_PRESETS.success.initial : false}
          role="status"
          transition={isMotionEnabled ? MOTION_PRESETS.success.transition : { duration: 0 }}
        >
          <div className="flex min-w-[176px] flex-col items-center gap-2 rounded-[24px] border border-white/85 bg-white/95 px-7 py-6 text-center text-ww-ink shadow-ww-floating">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary-deep">
              <CheckCircle2 aria-hidden="true" size={30} strokeWidth={2.2} />
            </span>
            <span className="text-[15px] font-extrabold">{t('record:bookkeeping.saveSuccess')}</span>
          </div>
        </m.div>
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
        <div className="mb-3 flex items-center justify-between">
          <span className="w-10" aria-hidden="true" />
          <div className="text-center text-base text-font-black">{t('ledger:records.tags')}</div>
          {onManageTags
            ? (
                <button
                  aria-label="标签设置"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-0 bg-primary-light/45 text-primary-deep active:bg-primary-light disabled:opacity-45"
                  disabled={controller.isImageUploading}
                  onClick={onManageTags}
                  type="button"
                >
                  <Settings2 size={18} strokeWidth={1.9} />
                </button>
              )
            : <span className="w-10" aria-hidden="true" />}
        </div>
        {controller.selectedTagIds.length > 0 && (
          <section className="mb-4 rounded-[18px] border border-primary-light/80 bg-primary-light/25 p-3" data-record-editor-selected-tags>
            <div className="mb-2 text-[12px] font-extrabold text-primary-deep">已选标签</div>
            <div className="flex flex-wrap gap-2">
              {(tags ?? []).filter(tag => controller.selectedTagIds.includes(tag.id)).map(tag => (
                <span className="inline-flex min-h-11 items-center gap-1 rounded-full border border-primary/25 bg-white px-2 pl-3 text-[13px] font-bold text-primary-deep shadow-ww-xs" key={tag.id}>
                  #
                  {tag.name}
                  <button
                    aria-label={`移除标签 ${tag.name}`}
                    className="ml-0.5 flex h-11 w-11 items-center justify-center rounded-full text-primary-deep transition active:bg-primary-light"
                    onClick={() => controller.handleRemoveTag(tag.id)}
                    type="button"
                  >
                    <X aria-hidden="true" size={14} strokeWidth={2.4} />
                  </button>
                </span>
              ))}
            </div>
          </section>
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
            <div className="inline-flex overflow-hidden rounded-full" key={tag.id}>
              <button
                aria-pressed={controller.selectedTagIds.includes(tag.id)}
                className={cn(
                  'min-h-11 rounded-l-full border border-solid border-r-0 px-3 text-sm',
                  controller.selectedTagIds.includes(tag.id)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border-primary bg-white text-ww-mid',
                )}
                onClick={() => controller.handleToggleTag(tag.id)}
                type="button"
              >
                {tag.name}
              </button>
              {onArchiveTag && (
                <button
                  aria-label={`${t('ledger:tags.delete')} ${tag.name}`}
                  className={cn(
                    'flex min-h-11 w-11 items-center justify-center border border-solid border-l border-l-white/35 transition disabled:opacity-45',
                    controller.selectedTagIds.includes(tag.id)
                      ? 'border-primary bg-primary text-white active:bg-primary-deep'
                      : 'border-border-primary bg-white text-feedback-danger active:bg-feedback-danger-surface',
                  )}
                  data-record-editor-tag-delete={tag.id}
                  disabled={controller.isImageUploading}
                  onClick={() => void handleArchiveTag(tag.id, tag.name)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={15} strokeWidth={2} />
                </button>
              )}
            </div>
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
            <button className="min-h-11 rounded-xl bg-primary px-3 text-sm font-semibold text-white disabled:opacity-50" disabled={!newTagName.trim() || isCreatingTag} type="submit">
              添加
            </button>
          </form>
        )}
      </Popup>
      {isImagePreviewOpen && typeof document !== 'undefined' && createPortal(
        <button
          aria-label="关闭图片预览"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5"
          onClick={closeImagePreview}
          type="button"
        >
          {controller.imagePreviewUrl || contentUrl
            ? <img alt="凭证图片预览" className="max-h-full max-w-full rounded-xl object-contain" src={controller.imagePreviewUrl ?? contentUrl} />
            : isImagePreviewLoading && <SpinLoading color="white" />}
        </button>,
        document.body,
      )}
    </div>
  );
};

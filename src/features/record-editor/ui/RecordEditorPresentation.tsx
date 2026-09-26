import type { FC } from 'react';
import type { RecordEditorTag } from '../model/types';
import type { RecordEditorController } from '../model/useRecordEditorController';
import type { Asset, AssetGroup } from '@/entities/asset';
import type { CategoryEntity } from '@/entities/category';
import { SpinLoading } from 'antd-mobile';
import {
  Delete as BackspaceIcon,
  Banknote,
  Check,
  CheckCircle2,
  CircleAlert,
  History,
  MapPin,
  Settings2,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getAssetAccountTypeLabel } from '@/entities/asset';
import { CategoryIcon } from '@/entities/category';
import {
  formatRecordLocationLabel,
  postRecordLocationCandidatesApi,
} from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { cn, money } from '@/shared/lib';
import {
  AppButton,
  AppDatePicker,
  AppSheet,
  confirmDangerousAction,
  DesignIcon,
  IllustratedEmptyState,
  MOTION_PRESETS,
  SheetHeader,
  useMotionPreference,
} from '@/shared/ui';
import { KEYPAD_LAYOUT } from '../model/constants';
import { RecordEditorImagesPanel } from './RecordEditorImagesPanel';
import { RecordLocationPicker } from './RecordLocationPicker';
import './record-editor-presentation.scss';

export type RecordEditorCategoryState = 'error' | 'loading' | 'ready';

interface RecordEditorPresentationProps {
  canManageTags?: boolean;
  assetAccounts?: Asset[];
  assetGroups?: AssetGroup[];
  categories: CategoryEntity[];
  categoryState: RecordEditorCategoryState;
  controller: RecordEditorController;
  onArchiveTag?: (tagId: string) => Promise<void>;
  onCancel: () => void;
  onManageCategories?: () => void;
  onManageTags?: (tagPickerDraftIds: string[]) => void;
  onRetryCategories?: () => void;
  onCreateTag?: (name: string) => Promise<{ id: string; name: string }>;
  remarkHistory?: string[];
  isSaveSucceeded?: boolean;
  tags?: RecordEditorTag[];
}

export const RecordEditorPresentation: FC<RecordEditorPresentationProps> = ({
  categories,
  assetAccounts,
  assetGroups = [],
  canManageTags = false,
  categoryState,
  controller,
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

  const noteInputRef = useRef<HTMLInputElement>(null);
  const amountDigitsRef = useRef<HTMLSpanElement>(null);
  const editorPageRef = useRef<HTMLDivElement>(null);
  const categoryViewportRef = useRef<HTMLElement>(null);
  const actionStripRef = useRef<HTMLDivElement>(null);
  const [newTagName, setNewTagName] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [draftTagIds, setDraftTagIds] = useState<string[]>(() => controller.tagPickerDraftIds ?? controller.selectedTagIds);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number>();
  useEffect(() => {
    if (!controller.isNoteFocused) {
      editorPageRef.current?.style.removeProperty('height');
      editorPageRef.current?.style.removeProperty('top');
      return;
    }
    const updateViewport = () => {
      const viewport = window.visualViewport;
      const page = editorPageRef.current;
      if (!page)
        return;
      page.style.height = `${viewport?.height ?? window.innerHeight}px`;
      page.style.top = `${viewport?.offsetTop ?? 0}px`;
    };
    updateViewport();
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, [controller.isNoteFocused]);
  const rootCategories = useMemo(
    () => categories.filter(category => !category.parentId),
    [categories],
  );
  const childCategoriesByParent = useMemo(() => categories.reduce<Map<number, CategoryEntity[]>>((groups, category) => {
    if (!category.parentId)
      return groups;
    const siblings = groups.get(category.parentId) ?? [];
    siblings.push(category);
    groups.set(category.parentId, siblings);
    return groups;
  }, new Map()), [categories]);
  const expandedCategory = rootCategories.find(category => category.id === expandedCategoryId);
  const expandedChildren = expandedCategoryId ? childCategoriesByParent.get(expandedCategoryId) ?? [] : [];
  const expandedCategoryIndex = rootCategories.findIndex(category => category.id === expandedCategoryId);
  const expandedRowEndIndex = expandedCategoryIndex < 0
    ? -1
    : Math.min(rootCategories.length - 1, Math.floor(expandedCategoryIndex / 5) * 5 + 4);
  const selectedCategory = categories.find(category => category.id === controller.selectedCategory?.id)
    ?? (categoryState === 'ready' ? undefined : controller.selectedCategory);
  const hasValidSelectedCategory = categoryState === 'ready' && Boolean(selectedCategory);
  const selectedParentName = selectedCategory?.parentId
    ? categories.find(category => category.id === selectedCategory.parentId)?.name
    : undefined;
  const selectedCategoryPath = selectedCategory?.path
    ?? (selectedParentName
      ? `${selectedParentName} / ${selectedCategory?.name}`
      : selectedCategory?.name);
  const openTagPicker = () => {
    setDraftTagIds(controller.selectedTagIds);
    setTagSearch('');
    controller.setIsTagPickerVisible(true);
  };
  const toggleDraftTag = (tagId: string) => setDraftTagIds(current => current.includes(tagId)
    ? current.filter(id => id !== tagId)
    : current.length < 20 ? [...current, tagId] : current);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isAssetPickerVisible, setIsAssetPickerVisible] = useState(false);
  const { isMotionEnabled } = useMotionPreference();
  useEffect(() => {
    if (!expandedCategoryId)
      return;
    const revealExpandedGroup = () => {
      const viewport = categoryViewportRef.current;
      const group = viewport?.querySelector<HTMLElement>(`#record-editor-subcategories-${expandedCategoryId}`);
      if (!viewport || !group)
        return;
      const groupBounds = group.getBoundingClientRect();
      const viewportBounds = viewport.getBoundingClientRect();
      const visibleBottom = Math.min(
        viewportBounds.bottom,
        (actionStripRef.current?.getBoundingClientRect().top ?? viewportBounds.bottom) - 8,
      );
      const visibleHeight = visibleBottom - viewportBounds.top;
      const scrollDelta = groupBounds.height > visibleHeight
        ? groupBounds.top - viewportBounds.top
        : groupBounds.bottom > visibleBottom
          ? groupBounds.bottom - visibleBottom
          : groupBounds.top < viewportBounds.top
            ? groupBounds.top - viewportBounds.top
            : 0;
      if (!scrollDelta)
        return;
      viewport.scrollTo({
        behavior: isMotionEnabled ? 'smooth' : 'auto',
        top: viewport.scrollTop + scrollDelta,
      });
    };
    const timeout = window.setTimeout(revealExpandedGroup, isMotionEnabled ? 220 : 0);
    return () => window.clearTimeout(timeout);
  }, [expandedCategoryId, isMotionEnabled]);
  const linkedAsset = assetAccounts?.find(
    asset => asset.id === controller.linkedAssetId,
  );
  const linkedAssetLabel = linkedAsset?.comment?.trim() || linkedAsset?.name;
  const firstSelectedTag = tags?.find(tag => controller.selectedTagIds.includes(tag.id));
  const tagSummary = firstSelectedTag
    ? `#${firstSelectedTag.name}${controller.selectedTagIds.length > 1 ? ` +${controller.selectedTagIds.length - 1}` : ''}`
    : t('ledger:records.tags');
  const filteredRemarkHistory = useMemo(() => {
    const keyword = controller.remark.trim().toLocaleLowerCase();
    if (!keyword)
      return remarkHistory;
    return remarkHistory.filter(remark =>
      remark.toLocaleLowerCase().includes(keyword),
    );
  }, [controller.remark, remarkHistory]);

  const detailChipClassName = 'record-editor-detail-chip pointer-events-auto inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap px-3 text-[13px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep';
  const selectedChipClassName = 'record-editor-detail-chip--selected';
  const renderDateLabel = useCallback((type: string, value: number) => {
    return type === 'year' ? String(value) : String(value).padStart(2, '0');
  }, []);
  const handleArchiveTag = useCallback(
    async (tagId: string, name: string) => {
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
      setDraftTagIds(current => current.filter(id => id !== tagId));
    },
    [onArchiveTag, t],
  );
  const showOperatorControls
    = Number.parseFloat(controller.calculator.totals) > 0;
  const amountLength = controller.calculator.totals.length;
  const isCalculationPending = controller.calculator.completeText === '=';

  useLayoutEffect(() => {
    const digits = amountDigitsRef.current;
    if (!digits)
      return;
    const showLatestDigits = () => {
      digits.scrollLeft = digits.scrollWidth;
    };
    showLatestDigits();
    window.addEventListener('resize', showLatestDigits);
    return () => window.removeEventListener('resize', showLatestDigits);
  }, [controller.calculator.totals]);

  const handleBack = () => {
    onCancel();
  };

  const handleSelectCategory = useCallback(
    (category: CategoryEntity) => {
      controller.handleSelectCategory(category);
      setExpandedCategoryId(undefined);
    },
    [controller],
  );

  return (
    <div
      className={cn(
        'page relative select-none pt-[max(8px,var(--ww-safe-area-top))] [-webkit-touch-callout:none]',
        controller.isNoteFocused && 'record-editor-note-mode',
      )}
      data-record-editor-presentation
      ref={editorPageRef}
    >
      <header
        className="record-editor-header flex h-[60px] shrink-0 items-start justify-between gap-3 px-5 pb-[14px] pt-1"
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
        <div className="flex rounded-[14px] border border-border-primary bg-white/[0.85] p-1 shadow-ww-xs">
          {(
            [
              { label: t('record:bookkeeping.expend'), type: 'sub' },
              { label: t('record:bookkeeping.income'), type: 'add' },
            ] as const
          ).map(item => (
            <button
              aria-pressed={controller.recordType === item.type}
              className={cn(
                'min-h-11 rounded-[10px] px-[22px] py-[7px] text-[13px] font-bold leading-[19.5px] transition',
                controller.recordType === item.type
                  ? item.type === 'sub'
                    ? 'bg-finance-expense text-white shadow-ww-xs'
                    : 'ww-theme-primary-action'
                  : 'text-ww-soft',
              )}
              key={item.type}
              onClick={() => {
                controller.handleRecordTypeChange(item.type);
                controller.setIsNoteFocused(false);
                setExpandedCategoryId(undefined);
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        {onManageCategories
          ? (
              <button
                aria-label={t('record:bookkeeping.categorySettings')}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-primary bg-white/90 text-ww-mid shadow-ww-xs"
                data-record-editor-category-settings
                onClick={onManageCategories}
                type="button"
              >
                <Settings2 aria-hidden="true" size={20} strokeWidth={1.9} />
              </button>
            )
          : <span className="h-11 w-11" />}
      </header>

      <m.main
        className="flex min-h-0 flex-grow flex-col"
        data-record-editor-amount
      >
        <div className="record-editor-category-stage relative min-h-0 flex-1 bg-ww-surface" data-record-editor-category-stage>
          <section
            aria-label={t('record:bookkeeping.selectCategory')}
            className="record-editor-categories h-full overflow-y-auto overscroll-contain px-[18px] pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            data-record-editor-categories
            ref={categoryViewportRef}
          >
            {categoryState === 'loading' && (
              <div className="flex min-h-full items-center justify-center">
                <SpinLoading />
              </div>
            )}
            {categoryState === 'error' && (
              <div className="flex min-h-full flex-col items-center justify-center gap-2 py-2 text-center">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold leading-5 text-ww-mid" role="alert">
                  <CircleAlert aria-hidden="true" size={17} strokeWidth={1.8} />
                  <span>{t('common:error.loadFail')}</span>
                </div>
                {onRetryCategories && (
                  <button className="min-h-11 rounded-full border border-border-primary bg-white px-5 text-[13px] font-semibold text-primary-deep shadow-ww-xs" onClick={onRetryCategories} type="button">
                    {t('common:retry')}
                  </button>
                )}
              </div>
            )}
            {categoryState === 'ready' && categories.length === 0 && (
              <IllustratedEmptyState
                className="record-editor-empty-state min-h-full"
                description={t('record:bookkeeping.emptyCategoryDescription')}
                icon={<Tags className="text-primary-deep" size={30} strokeWidth={1.5} />}
                testId="record-editor-empty-state"
                title={t('record:bookkeeping.emptyCategoryTitle')}
              />
            )}
            {categoryState === 'ready' && rootCategories.length > 0 && (
              <div className="grid grid-cols-5 gap-x-1 gap-y-2" data-record-editor-category-grid>
                {rootCategories.map((category, index) => {
                  const children = childCategoriesByParent.get(category.id) ?? [];
                  const isExpanded = expandedCategoryId === category.id;
                  const isSelectedRoot = selectedCategory?.id === category.id || selectedCategory?.parentId === category.id;
                  return (
                    <Fragment key={category.id}>
                      <m.button
                        aria-controls={children.length ? `record-editor-subcategories-${category.id}` : undefined}
                        aria-expanded={children.length ? isExpanded : undefined}
                        aria-label={children.length
                          ? t('record:bookkeeping.categoryWithChildren', {
                              count: children.length,
                              name: category.name,
                            })
                          : category.name}
                        aria-pressed={isSelectedRoot}
                        className={cn(
                          'record-editor-category-choice relative flex min-w-0 flex-col items-center gap-0.5 rounded-xl border-0 bg-transparent px-0.5 py-1 text-center active:bg-primary-light/50',
                          isSelectedRoot && 'record-editor-category-choice--selected text-primary-deep',
                        )}
                        data-record-editor-category={category.id}
                        onClick={() => children.length
                          ? setExpandedCategoryId(current => current === category.id ? undefined : category.id)
                          : handleSelectCategory(category)}
                        type="button"
                        whileTap={isMotionEnabled ? MOTION_PRESETS.press : undefined}
                      >
                        <span className="record-editor-category-icon ww-category-choice-icon flex h-11 w-11 items-center justify-center rounded-full">
                          <CategoryIcon
                            categoryName={category.name}
                            iconKey={category.icon}
                            iconType={category.iconType}
                            textIconEnabled={category.textIconEnabled}
                            textIconIndex={category.textIconIndex}
                            size={24}
                          />
                        </span>
                        <span className="record-editor-category-label line-clamp-2 w-full text-[11px] font-semibold leading-4 text-ww-mid">{category.name}</span>
                        {isSelectedRoot && (
                          <span aria-hidden="true" className="record-editor-category-check absolute flex items-center justify-center rounded-full bg-primary-deep text-white" data-record-editor-category-check>
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                        {children.length > 0 && (
                          <span aria-hidden="true" className="absolute right-0.5 top-[34px] flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-deep px-1 text-[8px] font-black tracking-[-1px] text-white shadow-ww-xs">•••</span>
                        )}
                      </m.button>
                      {(index % 5 === 4 || index === rootCategories.length - 1) && (
                        <AnimatePresence initial={false}>
                          {index === expandedRowEndIndex && expandedCategory && (
                            <m.div
                              animate={{ height: 'auto', opacity: 1 }}
                              aria-label={t('record:bookkeeping.subcategoryGroup', { name: expandedCategory.name })}
                              className="col-span-5 overflow-hidden rounded-[16px] bg-ww-surface-tint"
                              exit={{ height: 0, opacity: 0 }}
                              id={`record-editor-subcategories-${expandedCategory.id}`}
                              initial={isMotionEnabled ? { height: 0, opacity: 0 } : false}
                              key={expandedCategory.id}
                              role="group"
                              transition={{ duration: isMotionEnabled ? 0.2 : 0, ease: 'easeOut' }}
                            >
                              <div className="grid grid-cols-5 gap-x-1 gap-y-2 px-1.5 py-2">
                                <button
                                  aria-pressed={selectedCategory?.id === expandedCategory.id}
                                  className={cn(
                                    'record-editor-category-choice relative flex min-w-0 flex-col items-center gap-0.5 rounded-xl border-0 bg-transparent px-0.5 py-1 text-center active:bg-primary-light/50',
                                    selectedCategory?.id === expandedCategory.id && 'record-editor-category-choice--selected text-primary-deep',
                                  )}
                                  data-record-editor-category-direct={expandedCategory.id}
                                  onClick={() => handleSelectCategory(expandedCategory)}
                                  type="button"
                                >
                                  <span className="record-editor-category-icon flex h-11 w-11 items-center justify-center rounded-full bg-white/85">
                                    <CategoryIcon
                                      categoryName={expandedCategory.name}
                                      iconKey={expandedCategory.icon}
                                      iconType={expandedCategory.iconType}
                                      textIconEnabled={expandedCategory.textIconEnabled}
                                      textIconIndex={expandedCategory.textIconIndex}
                                      size={24}
                                    />
                                  </span>
                                  <span className="record-editor-category-label line-clamp-2 w-full text-[11px] font-semibold leading-4">{expandedCategory.name}</span>
                                  <span className="text-[9px] leading-3 text-ww-soft">{t('record:bookkeeping.directEntry')}</span>
                                  {selectedCategory?.id === expandedCategory.id && (
                                    <span aria-hidden="true" className="record-editor-category-check absolute flex items-center justify-center rounded-full bg-primary-deep text-white" data-record-editor-category-check>
                                      <Check size={10} strokeWidth={3} />
                                    </span>
                                  )}
                                </button>
                                {expandedChildren.map(child => (
                                  <button
                                    aria-pressed={selectedCategory?.id === child.id}
                                    className={cn(
                                      'record-editor-category-choice relative flex min-w-0 flex-col items-center gap-0.5 rounded-xl border-0 bg-transparent px-0.5 py-1 text-center active:bg-primary-light/50',
                                      selectedCategory?.id === child.id && 'record-editor-category-choice--selected text-primary-deep',
                                    )}
                                    data-record-editor-category={child.id}
                                    key={child.id}
                                    onClick={() => handleSelectCategory(child)}
                                    type="button"
                                  >
                                    <span className="record-editor-category-icon flex h-11 w-11 items-center justify-center rounded-full bg-white/85">
                                      <CategoryIcon
                                        categoryName={child.name}
                                        iconKey={child.icon}
                                        iconType={child.iconType}
                                        textIconEnabled={child.textIconEnabled}
                                        textIconIndex={child.textIconIndex}
                                        size={24}
                                      />
                                    </span>
                                    <span className="record-editor-category-label line-clamp-2 w-full text-[11px] font-semibold leading-4 text-ww-mid">{child.name}</span>
                                    {selectedCategory?.id === child.id && (
                                      <span aria-hidden="true" className="record-editor-category-check absolute flex items-center justify-center rounded-full bg-primary-deep text-white" data-record-editor-category-check>
                                        <Check size={10} strokeWidth={3} />
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </m.div>
                          )}
                        </AnimatePresence>
                      )}
                    </Fragment>
                  );
                })}
              </div>
            )}
          </section>
          {controller.isNoteFocused && filteredRemarkHistory.length > 0 && (
            <section
              aria-label={t('record:bookkeeping.remarkHistory')}
              className="record-editor-remark-history absolute inset-x-[14px] z-20 min-h-0 overflow-y-auto"
              data-record-editor-remark-history
            >
              <h2 className="record-editor-remark-heading flex items-center gap-1.5 text-[12px] font-semibold leading-5 text-ww-mid">
                <History aria-hidden="true" size={14} strokeWidth={1.8} />
                {t('record:bookkeeping.remarkHistory')}
              </h2>
              <div className="flex flex-col">
                {filteredRemarkHistory.map(remark => (
                  <button
                    aria-label={t('record:bookkeeping.selectRemarkHistory', { remark })}
                    className="record-editor-remark-option min-h-11 w-full truncate rounded-[10px] px-2 text-left text-[14px] leading-5 text-ww-ink active:bg-primary-light"
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

          <div aria-hidden="true" className="record-editor-control-dock absolute inset-x-0 bottom-0 z-[5]" data-record-editor-control-dock />
          <div
            aria-label={t('record:bookkeeping.moreDetails')}
            className={cn(
              'record-editor-action-strip absolute inset-x-0 z-10 flex h-11 items-center gap-1 overflow-x-auto overscroll-x-contain px-[14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              controller.isNoteFocused && 'hidden',
            )}
            data-record-editor-action-strip
            ref={actionStripRef}
            role="group"
          >
            {assetAccounts !== undefined && (
              <button
                aria-label={linkedAssetLabel ?? t('record:bookkeeping.noLinkedAsset')}
                className={cn(detailChipClassName, linkedAsset && selectedChipClassName)}
                data-record-editor-asset-trigger
                onClick={() => setIsAssetPickerVisible(true)}
                type="button"
              >
                <Banknote aria-hidden="true" size={17} strokeWidth={1.8} />
                <span className="max-w-[112px] truncate">{linkedAssetLabel ?? t('record:bookkeeping.noLinkedAsset')}</span>
              </button>
            )}
            {tags !== undefined && (
              <button
                aria-label={t('record:bookkeeping.selectTagsWithCount', { count: controller.selectedTagIds.length })}
                className={cn(detailChipClassName, controller.selectedTagIds.length > 0 && selectedChipClassName)}
                data-record-editor-tag-trigger
                onClick={openTagPicker}
                type="button"
              >
                <Tags aria-hidden="true" size={17} strokeWidth={1.8} />
                <span className="max-w-[125px] truncate">{tagSummary}</span>
              </button>
            )}
            <button
              aria-label={controller.location ? t('record:location.change') : t('record:location.add')}
              className={cn(detailChipClassName, controller.location && selectedChipClassName)}
              data-record-editor-location-trigger
              onClick={() => controller.setIsLocationPickerVisible(true)}
              type="button"
            >
              <MapPin aria-hidden="true" size={17} strokeWidth={1.8} />
              <span className="max-w-[132px] truncate">
                {controller.location ? formatRecordLocationLabel(controller.location) : t('record:location.add')}
              </span>
            </button>
            <button
              aria-label={`${t('record:bookkeeping.selectTime')}：${controller.formattedDate}`}
              className={detailChipClassName}
              data-record-editor-date-trigger
              onClick={() => controller.setIsDatePickerVisible(true)}
              type="button"
            >
              <DesignIcon name="editor-date" size={17} />
              <span>{controller.isToday ? t('common:time.today') : controller.formattedDate}</span>
            </button>
            <RecordEditorImagesPanel
              canAddImages={controller.canAddImages}
              chipClassName={detailChipClassName}
              hasImageUploadError={controller.hasImageUploadError}
              images={controller.images}
              onRemoveImage={controller.handleRemoveImage}
              onRetryImage={controller.handleRetryImage}
              onSelectImages={controller.handleSelectImages}
            />
          </div>

          <div
            className="record-editor-entry-row absolute inset-x-[14px] z-10 flex items-center gap-2 px-3"
            data-record-editor-entry-row
          >
            <label className="flex h-full min-w-0 flex-1 flex-col justify-center" data-record-editor-note>
              <div className="record-editor-amount-caption truncate text-[10px] font-semibold leading-4 text-primary-deep">
                {selectedCategoryPath
                  ? `${selectedCategoryPath} · ${controller.recordType === 'sub' ? t('record:bookkeeping.expend') : t('record:bookkeeping.income')}`
                  : t('record:bookkeeping.chooseCategory')}
              </div>
              <input
                ref={noteInputRef}
                aria-label={t('record:bookkeeping.note')}
                className="min-w-0 w-full select-text border-0 bg-transparent py-1 text-[13px] leading-5 text-ww-ink outline-none placeholder:text-ww-mid [-webkit-user-select:text]"
                autoComplete="off"
                enterKeyHint="done"
                onBlur={() => controller.setIsNoteFocused(false)}
                onChange={event => controller.setRemark(event.target.value)}
                onFocus={() => controller.setIsNoteFocused(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && hasValidSelectedCategory && !controller.isSubmitting && !controller.isImageUploading && !controller.hasImageUploadError) {
                    event.stopPropagation();
                    void controller.handleSubmit();
                  }
                }}
                placeholder={t('record:bookkeeping.notePlaceholder')}
                type="text"
                value={controller.remark}
              />
            </label>
            <button
              aria-label={`${t('record:bookkeeping.amount')}：${controller.calculator.totals}`}
              className="flex min-h-11 min-w-0 max-w-[72%] items-center justify-end text-right"
              onClick={() => {
                noteInputRef.current?.blur();
                controller.setIsNoteFocused(false);
              }}
              type="button"
            >
              <span
                className={cn(
                  'record-editor-total flex max-w-full min-w-0 items-center whitespace-nowrap font-number font-black leading-[44px] tracking-[-1px] text-ww-ink',
                  amountLength > 11 ? 'text-[23px]' : amountLength > 8 ? 'text-[28px]' : 'text-[34px]',
                )}
                data-record-editor-total
              >
                <span className="mr-0.5 shrink-0 text-[18px] font-bold tracking-normal text-ww-soft">¥</span>
                <span
                  className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  data-record-editor-amount-digits
                  ref={amountDigitsRef}
                >
                  {controller.calculator.totals}
                </span>
              </span>
            </button>
          </div>
        </div>

        <section
          className={cn('record-editor-keypad shrink-0 border-t border-solid px-4', controller.isNoteFocused && 'hidden')}
          data-record-editor-keypad
        >
          <div className="grid grid-cols-3 gap-[var(--record-editor-keypad-gap)]">
            <div className="contents" data-record-editor-operators>
              {['+', '-'].map((operator, index) => (
                <button
                  aria-label={operator === '+' ? t('record:bookkeeping.addAmount') : t('record:bookkeeping.subtractAmount')}
                  className={cn(
                    'record-editor-keypad__action record-editor-keypad__operator flex w-full items-center justify-center border-0 font-number text-lg font-bold disabled:opacity-45',
                    controller.activeSideIndex === index + 1 && 'record-editor-keypad__operator--active',
                  )}
                  disabled={!showOperatorControls || controller.isNoteFocused}
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
            <m.button
              aria-label={isCalculationPending ? t('record:bookkeeping.calculateResult') : t('record:bookkeeping.complete')}
              className="record-editor-keypad__action ww-theme-primary-action w-full text-[15px] font-extrabold leading-[22.5px] disabled:opacity-50"
              data-record-editor-submit
              disabled={
                isCalculationPending
                  ? !controller.calculator.canCalculate() || controller.isSubmitting
                  : !hasValidSelectedCategory
                    || controller.isSubmitting
                    || controller.isImageUploading
                    || controller.hasImageUploadError
              }
              onClick={() => {
                if (isCalculationPending)
                  controller.calculator.resolveAmount();
                else
                  void controller.handleSubmit();
              }}
              type="button"
              whileTap={isMotionEnabled ? MOTION_PRESETS.press : undefined}
            >
              {isCalculationPending ? '=' : t('record:bookkeeping.complete')}
            </m.button>
          </div>
          <div
            aria-hidden={controller.isNoteFocused}
            className={cn(
              'record-editor-keypad__keys grid grid-cols-3',
              controller.isNoteFocused && 'pointer-events-none invisible',
            )}
            data-record-editor-numeric-keys
          >
            {KEYPAD_LAYOUT.map((item, index) => (
              <m.button
                aria-label={
                  item.keys === 'x'
                    ? t('record:bookkeeping.backspace')
                    : undefined
                }
                className={cn(
                  'record-editor-keypad__key flex items-center justify-center font-number text-[21px] font-bold leading-[31.5px] text-ww-ink',
                  item.keys === 'x'
                  && 'gap-1.5 font-sans text-[12px] text-primary-deep',
                  (item.keys === 'x' || controller.activeKeyIndex === index) && 'record-editor-keypad__key--active',
                )}
                disabled={controller.isNoteFocused}
                key={String(item.keys)}
                onClick={() => controller.handleKeyClick(item.keys)}
                onTouchMove={controller.handleKeyTouchMove}
                onTouchStart={() => controller.handleKeyTouchStart(index)}
                type="button"
                whileTap={
                  isMotionEnabled ? MOTION_PRESETS.press : undefined
                }
              >
                {item.keys === 'x'
                  ? (
                      <>
                        <BackspaceIcon
                          aria-hidden="true"
                          size={20}
                          strokeWidth={1.8}
                        />
                        <span>{t('record:bookkeeping.backspace')}</span>
                      </>
                    )
                  : (
                      item.keys
                    )}
              </m.button>
            ))}
          </div>
        </section>
      </m.main>

      {isSaveSucceeded && (
        <m.div
          animate={MOTION_PRESETS.success.animate}
          aria-live="polite"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white/35 px-6 backdrop-blur-sm"
          initial={isMotionEnabled ? MOTION_PRESETS.success.initial : false}
          role="status"
          transition={
            isMotionEnabled
              ? MOTION_PRESETS.success.transition
              : { duration: 0 }
          }
        >
          <div className="flex min-w-[176px] flex-col items-center gap-2 rounded-[24px] border border-white/85 bg-white/95 px-7 py-6 text-center text-ww-ink shadow-ww-floating">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary-deep">
              <CheckCircle2 aria-hidden="true" size={30} strokeWidth={2.2} />
            </span>
            <span className="text-[15px] font-extrabold">
              {t('record:bookkeeping.saveSuccess')}
            </span>
          </div>
        </m.div>
      )}

      <AppDatePicker
        className="record-editor-date-picker"
        onClose={() => controller.setIsDatePickerVisible(false)}
        onConfirm={(value) => {
          controller.setDate(value);
          controller.setIsDatePickerVisible(false);
        }}
        renderLabel={renderDateLabel}
        precision="second"
        title={t('record:bookkeeping.selectTime')}
        value={controller.date}
        visible={controller.isDatePickerVisible}
      />

      {controller.isLocationPickerVisible && (
        <RecordLocationPicker
          locate={controller.locate}
          resolveCandidates={
            controller.resolveLocationCandidates
            ?? postRecordLocationCandidatesApi
          }
          onClose={() => controller.setIsLocationPickerVisible(false)}
          onConfirm={controller.handleSelectLocation}
          selectedLocation={controller.location}
          visible
        />
      )}

      <AppSheet
        bodyClassName="record-editor-asset-sheet flex flex-col overflow-hidden"
        destroyOnClose
        material="opaque"
        onMaskClick={() => setIsAssetPickerVisible(false)}
        onClose={() => setIsAssetPickerVisible(false)}
        position="bottom"
        visible={isAssetPickerVisible}
      >
        <SheetHeader
          closeLabel={t('common:nav.close')}
          onClose={() => setIsAssetPickerVisible(false)}
          title={t('record:bookkeeping.selectLinkedAsset')}
        />
        <div className="record-editor-asset-list space-y-2 overflow-y-auto overscroll-contain px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3">
          <button
            aria-pressed={controller.linkedAssetId === null}
            className={cn(
              'record-editor-asset-option flex min-h-[58px] w-full items-center gap-3 rounded-[12px] px-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep',
              controller.linkedAssetId === null
                ? 'record-editor-asset-option--selected'
                : '',
            )}
            data-record-editor-asset-option="none"
            onClick={() => {
              controller.handleSelectLinkedAsset(null);
              setIsAssetPickerVisible(false);
            }}
            type="button"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-surface-subtle text-ww-soft">
              <X size={17} />
            </span>
            <span className="min-w-0 flex-1 text-[14px] font-extrabold text-ww-ink">
              {t('record:bookkeeping.noLinkedAsset')}
            </span>
            {controller.linkedAssetId === null && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-deep">
                <Check aria-hidden="true" size={14} strokeWidth={2.5} />
              </span>
            )}
          </button>
          {(assetAccounts ?? []).map((asset) => {
            const isCreditAsset = Boolean(asset.creditLimit?.trim())
              || asset.assetGroup.assetType === 'credit';
            const assetDebt = money.formatNatural(asset.amount);
            const availableCreditLimit = asset.creditLimit
              ? money.formatNatural(money.subtract(asset.creditLimit, asset.amount))
              : undefined;

            return (
              <button
                aria-pressed={controller.linkedAssetId === asset.id}
                className={cn(
                  'record-editor-asset-option flex min-h-[64px] w-full items-center gap-3 rounded-[12px] px-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep',
                  controller.linkedAssetId === asset.id
                    ? 'record-editor-asset-option--selected'
                    : '',
                )}
                data-record-editor-asset-option={asset.id}
                key={asset.id}
                onClick={() => {
                  controller.handleSelectLinkedAsset(asset.id);
                  setIsAssetPickerVisible(false);
                }}
                type="button"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-primary-light text-primary-deep">
                  <Banknote size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-extrabold text-ww-ink">
                    {asset.name}
                  </span>
                  <span className="block truncate text-[11px] font-semibold text-ww-soft">
                    {[getAssetAccountTypeLabel(asset, assetGroups), asset.comment?.trim()]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <span className="shrink-0 text-right font-number">
                  {isCreditAsset
                    ? (
                        <>
                          {availableCreditLimit && (
                            <span className="block text-[10px] font-semibold text-ww-soft">
                              {t('record:bookkeeping.linkedAssetAvailableCreditLimit', {
                                amount: availableCreditLimit,
                              })}
                            </span>
                          )}
                          <span className="block text-[13px] font-bold text-ww-mid">
                            {t('record:bookkeeping.linkedAssetDebt', { amount: assetDebt })}
                          </span>
                        </>
                      )
                    : (
                        <span className="block text-[13px] font-bold text-ww-mid">
                          {t('record:bookkeeping.linkedAssetBalance', {
                            amount: assetDebt,
                          })}
                        </span>
                      )}
                </span>
                {controller.linkedAssetId === asset.id && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-deep">
                    <Check aria-hidden="true" size={14} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </AppSheet>

      <AppSheet
        bodyClassName="record-editor-tag-sheet flex flex-col overflow-hidden px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3"
        destroyOnClose
        onMaskClick={() => controller.setIsTagPickerVisible(false)}
        onClose={() => controller.setIsTagPickerVisible(false)}
        position="bottom"
        visible={controller.isTagPickerVisible}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="w-10" aria-hidden="true" />
          <div className="text-center text-base text-font-black">
            {t('ledger:records.tags')}
          </div>
          {onManageTags
            ? (
                <button
                  aria-label="标签设置"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-0 bg-primary-light/45 text-primary-deep active:bg-primary-light disabled:opacity-45"
                  disabled={controller.isImageUploading}
                  onClick={() => onManageTags(draftTagIds)}
                  type="button"
                >
                  <Settings2 size={18} strokeWidth={1.9} />
                </button>
              )
            : (
                <span className="w-10" aria-hidden="true" />
              )}
        </div>
        {draftTagIds.length > 0 && (
          <section
            className="record-editor-selected-tags mb-3 max-h-[104px] shrink-0 overflow-y-auto rounded-[12px] p-3"
            data-record-editor-selected-tags
          >
            <div className="mb-2 text-[12px] font-extrabold text-primary-deep">
              已选标签
            </div>
            <div className="flex flex-wrap gap-2">
              {(tags ?? [])
                .filter(tag => draftTagIds.includes(tag.id))
                .map(tag => (
                  <span
                    className="record-editor-selected-tag inline-flex min-h-11 items-center gap-1 rounded-full pl-3 text-[12px] font-semibold text-primary-deep"
                    key={tag.id}
                  >
                    #
                    {tag.name}
                    {tag.status === 'ARCHIVED' && <span className="text-xs text-ww-soft">（已归档）</span>}
                    <button
                      aria-label={`移除标签 ${tag.name}`}
                      className="ml-0.5 flex h-11 w-11 items-center justify-center rounded-full text-primary-deep transition active:bg-primary-light"
                      onClick={() => toggleDraftTag(tag.id)}
                      type="button"
                    >
                      <X aria-hidden="true" size={14} strokeWidth={2.4} />
                    </button>
                  </span>
                ))}
            </div>
          </section>
        )}
        <input aria-label="搜索标签" className="ww-sheet-control mb-2 min-h-11 w-full shrink-0 rounded-xl px-3" value={tagSearch} onChange={event => setTagSearch(event.target.value)} placeholder="搜索标签" />
        <p className="mb-2 shrink-0 text-xs text-ww-soft">
          已选
          {draftTagIds.length}
          {' '}
          / 20；标签在本账本内通用
        </p>
        <div className="record-editor-tag-list flex min-h-0 flex-1 flex-wrap content-start gap-2 overflow-y-auto overscroll-contain pb-2">
          {(tags ?? []).filter(tag => tag.status !== 'ARCHIVED' && tag.name.includes(tagSearch.trim())).map(tag => (
            <div
              className="inline-flex overflow-hidden rounded-full"
              key={tag.id}
            >
              <button
                aria-pressed={draftTagIds.includes(tag.id)}
                className={cn(
                  'record-editor-tag-option min-h-11 rounded-l-full px-3 text-[13px] font-semibold',
                  draftTagIds.includes(tag.id)
                    ? 'record-editor-tag-option--selected'
                    : 'text-ww-mid',
                )}
                onClick={() => toggleDraftTag(tag.id)}
                disabled={!draftTagIds.includes(tag.id) && draftTagIds.length >= 20}
                type="button"
              >
                {tag.name}
              </button>
              {onArchiveTag && (
                <button
                  aria-label={`${t('ledger:tags.delete')} ${tag.name}`}
                  className="record-editor-tag-delete flex min-h-11 w-11 items-center justify-center text-ww-soft transition-colors active:text-feedback-danger focus-visible:text-feedback-danger disabled:opacity-45"
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
            className="mt-2 flex shrink-0 gap-2 border-t border-border-primary pt-2"
            onSubmit={(event) => {
              event.preventDefault();
              const name = newTagName.trim();
              if (!name || isCreatingTag)
                return;
              setIsCreatingTag(true);
              void onCreateTag(name)
                .then((tag) => {
                  toggleDraftTag(tag.id);
                  setNewTagName('');
                })
                .finally(() => setIsCreatingTag(false));
            }}
          >
            <input
              className="ww-sheet-control min-w-0 flex-1 rounded-xl border border-border-primary px-3 py-2 text-sm outline-none"
              maxLength={20}
              onChange={event => setNewTagName(event.target.value)}
              placeholder="新建标签"
              value={newTagName}
            />
            <button
              className="min-h-11 rounded-xl bg-primary px-3 text-sm font-semibold text-white disabled:opacity-50"
              disabled={!newTagName.trim() || isCreatingTag}
              type="submit"
            >
              添加
            </button>
          </form>
        )}
        <div className="mt-2 flex shrink-0 gap-2 border-t border-border-primary pt-2">
          <AppButton variant="secondary" onClick={() => setDraftTagIds([])}>清空</AppButton>
          <AppButton data-record-editor-tag-cancel variant="secondary" onClick={() => controller.setIsTagPickerVisible(false)}>取消</AppButton>
          <AppButton
            data-record-editor-tag-confirm
            className="flex-1"
            onClick={() => {
              controller.handleSetTags(draftTagIds);
              controller.setIsTagPickerVisible(false);
            }}
          >
            完成
          </AppButton>
        </div>
      </AppSheet>
    </div>
  );
};

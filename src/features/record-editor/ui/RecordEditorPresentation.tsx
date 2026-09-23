import type { FC } from 'react';
import type { RecordEditorTag } from '../model/types';
import type { RecordEditorController } from '../model/useRecordEditorController';
import type { Asset, AssetGroup } from '@/entities/asset';
import type { CategoryEntity } from '@/entities/category';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import {
  Delete as BackspaceIcon,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  MapPin,
  Settings2,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAssetAccountTypeLabel } from '@/entities/asset';
import { CategoryIcon } from '@/entities/category';
import {
  formatRecordLocationLabel,
  getRecordAttachmentContentApi,
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
  ImagePreview,
  MOTION_PRESETS,
  SheetHeader,
  useMotionPreference,
} from '@/shared/ui';
import { KEYPAD_LAYOUT } from '../model/constants';
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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentUrlRef = useRef<string>();
  const previewRequestRef = useRef(0);
  const [newTagName, setNewTagName] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [draftTagIds, setDraftTagIds] = useState<string[]>(() => controller.tagPickerDraftIds ?? controller.selectedTagIds);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number>();
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
  const [thumbnailUrl, setThumbnailUrl] = useState<string>();
  const [contentUrl, setContentUrl] = useState<string>();
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isImagePreviewLoading, setIsImagePreviewLoading] = useState(false);
  const [isAssetPickerVisible, setIsAssetPickerVisible] = useState(false);
  const { isMotionEnabled } = useMotionPreference();
  const attachmentId = controller.initialAttachment?.id;
  const linkedAsset = assetAccounts?.find(
    asset => asset.id === controller.linkedAssetId,
  );
  const isLinkedCreditAsset = Boolean(linkedAsset?.creditLimit?.trim())
    || linkedAsset?.assetGroup.assetType === 'credit';
  const linkedAssetSummary = linkedAsset && [
    linkedAsset.comment?.trim(),
    ...(!isLinkedCreditAsset
      ? [t('record:bookkeeping.linkedAssetBalance', {
          amount: linkedAsset.amount,
        })]
      : []),
  ].filter(Boolean).join(' · ');
  const linkedCreditSummary = linkedAsset && isLinkedCreditAsset
    ? [
        ...(linkedAsset.creditLimit
          ? [t('record:bookkeeping.linkedAssetAvailableCreditLimit', {
              amount: money.formatNatural(money.subtract(linkedAsset.creditLimit, linkedAsset.amount)),
            })]
          : []),
        t('record:bookkeeping.linkedAssetDebt', {
          amount: money.formatNatural(linkedAsset.amount),
        }),
      ]
    : [];
  const filteredRemarkHistory = useMemo(() => {
    const keyword = controller.remark.trim().toLocaleLowerCase();
    if (!keyword)
      return remarkHistory;
    return remarkHistory.filter(remark =>
      remark.toLocaleLowerCase().includes(keyword),
    );
  }, [controller.remark, remarkHistory]);

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
      className="page relative select-none pt-[max(8px,env(safe-area-inset-top))] [-webkit-touch-callout:none]"
      data-record-editor-presentation
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
                    ? 'bg-[linear-gradient(154.093deg,#f0a0b8_0%,#d06080_100%)] text-white shadow-ww-xs'
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
        <section
          aria-label={t('record:bookkeeping.selectCategory')}
          className="record-editor-categories mx-[14px] mb-2 h-[clamp(84px,20.8dvh,220px)] shrink-0 overflow-y-auto overscroll-contain rounded-[18px] bg-white/55 px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          data-record-editor-categories
        >
          {categoryState === 'loading' && (
            <div className="flex min-h-full items-center justify-center">
              <SpinLoading />
            </div>
          )}
          {categoryState === 'error' && (
            <div className="flex min-h-full flex-col items-center justify-center py-2">
              <ErrorBlock description={t('common:error.loadFail')} />
              {onRetryCategories && (
                <Button onClick={onRetryCategories} size="small">
                  {t('common:retry')}
                </Button>
              )}
            </div>
          )}
          {categoryState === 'ready' && categories.length === 0 && (
            <IllustratedEmptyState
              className="min-h-full"
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
                        'relative flex min-h-[76px] min-w-0 flex-col items-center gap-1 rounded-xl border-0 bg-transparent px-0.5 py-1 text-center active:bg-primary-light/50',
                        isSelectedRoot && 'bg-primary-light/55 text-primary-deep',
                      )}
                      data-record-editor-category={category.id}
                      onClick={() => children.length
                        ? setExpandedCategoryId(current => current === category.id ? undefined : category.id)
                        : handleSelectCategory(category)}
                      type="button"
                      whileTap={isMotionEnabled ? MOTION_PRESETS.press : undefined}
                    >
                      <span className="ww-category-choice-icon flex h-11 w-11 items-center justify-center rounded-full">
                        <CategoryIcon
                          categoryName={category.name}
                          iconKey={category.icon}
                          iconType={category.iconType}
                          textIconEnabled={category.textIconEnabled}
                          textIconIndex={category.textIconIndex}
                          size={24}
                        />
                      </span>
                      <span className="line-clamp-2 w-full text-[11px] font-semibold leading-4 text-ww-mid">{category.name}</span>
                      {isSelectedRoot && (
                        <span aria-hidden="true" className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-deep text-white shadow-ww-xs" data-record-editor-category-check>
                          <Check size={12} strokeWidth={3} />
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
                                  'relative flex min-h-[76px] min-w-0 flex-col items-center gap-1 rounded-xl border-0 bg-transparent px-0.5 py-1 text-center active:bg-primary-light/50',
                                  selectedCategory?.id === expandedCategory.id && 'bg-primary-light/60 text-primary-deep',
                                )}
                                data-record-editor-category-direct={expandedCategory.id}
                                onClick={() => handleSelectCategory(expandedCategory)}
                                type="button"
                              >
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85">
                                  <CategoryIcon
                                    categoryName={expandedCategory.name}
                                    iconKey={expandedCategory.icon}
                                    iconType={expandedCategory.iconType}
                                    textIconEnabled={expandedCategory.textIconEnabled}
                                    textIconIndex={expandedCategory.textIconIndex}
                                    size={24}
                                  />
                                </span>
                                <span className="line-clamp-2 w-full text-[11px] font-semibold leading-4">{expandedCategory.name}</span>
                                <span className="text-[9px] leading-3 text-ww-soft">{t('record:bookkeeping.directEntry')}</span>
                                {selectedCategory?.id === expandedCategory.id && (
                                  <span aria-hidden="true" className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-deep text-white shadow-ww-xs" data-record-editor-category-check>
                                    <Check size={12} strokeWidth={3} />
                                  </span>
                                )}
                              </button>
                              {expandedChildren.map(child => (
                                <button
                                  aria-pressed={selectedCategory?.id === child.id}
                                  className={cn(
                                    'relative flex min-h-[76px] min-w-0 flex-col items-center gap-1 rounded-xl border-0 bg-transparent px-0.5 py-1 text-center active:bg-primary-light/50',
                                    selectedCategory?.id === child.id && 'bg-primary-light/60 text-primary-deep',
                                  )}
                                  data-record-editor-category={child.id}
                                  key={child.id}
                                  onClick={() => handleSelectCategory(child)}
                                  type="button"
                                >
                                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85">
                                    <CategoryIcon
                                      categoryName={child.name}
                                      iconKey={child.icon}
                                      iconType={child.iconType}
                                      textIconEnabled={child.textIconEnabled}
                                      textIconIndex={child.textIconIndex}
                                      size={24}
                                    />
                                  </span>
                                  <span className="line-clamp-2 w-full text-[11px] font-semibold leading-4 text-ww-mid">{child.name}</span>
                                  {selectedCategory?.id === child.id && (
                                    <span aria-hidden="true" className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-deep text-white shadow-ww-xs" data-record-editor-category-check>
                                      <Check size={12} strokeWidth={3} />
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
        {assetAccounts !== undefined && (
          <button
            className="record-editor-asset mx-[22px] mb-2 flex h-[50px] shrink-0 items-center gap-3 rounded-[14px] border border-border-primary bg-white/[0.84] px-4 text-left shadow-ww-xs"
            data-record-editor-asset-trigger
            onClick={() => setIsAssetPickerVisible(true)}
            type="button"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-primary-light text-primary-deep">
              <Banknote size={17} strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-extrabold text-ww-ink">
                {linkedAsset?.name ?? t('record:bookkeeping.noLinkedAsset')}
              </span>
              <span className="block truncate text-[10px] font-semibold text-ww-soft">
                {linkedAsset
                  ? linkedAssetSummary || linkedAsset.assetGroup.name
                  : t('record:bookkeeping.linkedAssetHint')}
              </span>
            </span>
            {isLinkedCreditAsset && (
              <span className="flex shrink-0 flex-col items-end whitespace-nowrap font-number text-[10px] font-semibold leading-4 text-ww-soft">
                {linkedCreditSummary.map(item => <span key={item}>{item}</span>)}
              </span>
            )}
            <ChevronDown className="text-ww-soft" size={17} strokeWidth={2} />
          </button>
        )}
        <label
          className="record-editor-note mx-[22px] flex h-[50px] shrink-0 items-center rounded-[14px] border border-border-primary bg-white/[0.84] px-4 shadow-ww-xs"
          data-record-editor-note
        >
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
              onClick={openTagPicker}
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
          {assetAccounts !== undefined && (
            <button
              aria-label={linkedAsset?.name ?? t('record:bookkeeping.noLinkedAsset')}
              className={cn(
                'record-editor-asset-compact ml-1 h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 p-1',
                linkedAsset
                  ? 'bg-primary-light text-primary-deep'
                  : 'bg-transparent text-primary-deep',
              )}
              data-record-editor-asset-compact-trigger
              onClick={() => setIsAssetPickerVisible(true)}
              type="button"
            >
              <Banknote aria-hidden="true" size={18} strokeWidth={2} />
            </button>
          )}
          <button
            aria-label={
              controller.location
                ? t('record:location.change')
                : t('record:location.add')
            }
            className={cn(
              'record-editor-location-compact ml-1 h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 p-1',
              controller.location
                ? 'bg-primary-light text-primary-deep'
                : 'bg-transparent text-primary-deep',
            )}
            data-record-editor-location-compact-trigger
            onClick={() => controller.setIsLocationPickerVisible(true)}
            type="button"
          >
            <MapPin aria-hidden="true" size={18} strokeWidth={2} />
          </button>
          <button
            aria-label="选择图片"
            className="ml-1 flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent p-1 text-primary-deep"
            onClick={() => imageInputRef.current?.click()}
            type="button"
          >
            <ImagePlus size={18} />
          </button>
        </label>
        <div
          className="record-editor-location mx-[22px] mt-1 flex min-h-11 items-center"
          data-record-editor-location
        >
          <AppButton
            aria-label={
              controller.location
                ? t('record:location.change')
                : t('record:location.add')
            }
            data-record-editor-location-trigger
            onClick={() => controller.setIsLocationPickerVisible(true)}
            size="compact"
            variant={controller.location ? 'primary' : 'secondary'}
          >
            <MapPin aria-hidden="true" size={15} strokeWidth={2} />
            <span className="max-w-[240px] truncate">
              {controller.location
                ? formatRecordLocationLabel(controller.location)
                : t('record:location.add')}
            </span>
          </AppButton>
        </div>
        {controller.isNoteFocused && filteredRemarkHistory.length > 0 && (
          <section
            aria-label={t('record:bookkeeping.remarkHistory')}
            className="mx-[22px] mt-2 max-h-48 shrink-0 overflow-y-auto rounded-[14px] border border-border-primary bg-white/[0.96] p-2 shadow-ww-xs"
            data-record-editor-remark-history
          >
            <h2 className="px-2 pb-1 text-[12px] font-semibold leading-5 text-ww-soft">
              {t('record:bookkeeping.remarkHistory')}
            </h2>
            <div className="flex flex-col gap-1">
              {filteredRemarkHistory.map(remark => (
                <button
                  aria-label={t('record:bookkeeping.selectRemarkHistory', {
                    remark,
                  })}
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
          <div
            className="mx-[22px] mt-2 flex items-center gap-2 text-xs text-ww-soft"
            data-record-editor-image
          >
            <button
              aria-label="预览凭证图片"
              className="shrink-0 rounded-lg border-0 bg-transparent p-0"
              data-record-editor-image-preview
              onClick={() => void openImagePreview()}
              type="button"
            >
              {controller.imagePreviewUrl
                ? (
                    <img
                      alt="待上传凭证"
                      className="h-11 w-11 rounded-lg object-cover"
                      src={controller.imagePreviewUrl}
                    />
                  )
                : thumbnailUrl
                  ? (
                      <img
                        alt="已添加凭证图片"
                        className="h-11 w-11 rounded-lg object-cover"
                        src={thumbnailUrl}
                      />
                    )
                  : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light">
                        <ImagePlus size={18} />
                      </span>
                    )}
            </button>
            <span>
              {controller.isImageUploading
                ? '正在上传图片…'
                : controller.imageUploadError
                  ? '上传失败，可重新选择'
                  : '已添加凭证图片'}
            </span>
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

        <div className="record-editor-amount-display relative flex min-h-0 flex-grow flex-col items-center justify-center text-center">
          <div className="record-editor-amount-caption pb-2 text-[11px] font-semibold leading-[16.5px] tracking-[0.5px] text-ww-soft">
            {selectedCategoryPath && (
              <>
                <span className="text-primary-deep">{selectedCategoryPath}</span>
                <span aria-hidden="true"> · </span>
              </>
            )}
            {controller.recordType === 'sub'
              ? t('record:bookkeeping.expend')
              : t('record:bookkeeping.income')}
            {t('record:bookkeeping.amount')}
          </div>
          <div
            className="record-editor-total h-[81px] max-w-full overflow-x-auto whitespace-nowrap font-number text-[54px] font-black leading-[81px] tracking-[-1.5px] text-ww-ink [&::-webkit-scrollbar]:hidden"
            data-record-editor-total
          >
            <span className="mr-1 text-[26px] font-bold leading-[39px] tracking-normal text-ww-soft">
              ¥
            </span>
            {controller.calculator.totals}
          </div>
          <span className="record-editor-amount-underline mt-[10px] h-[2.5px] w-10 rounded-sm bg-primary opacity-70" />
          {showOperatorControls && (
            <div
              className="absolute bottom-3 flex gap-2"
              data-record-editor-operators
            >
              {['+', '-'].map((operator, index) => (
                <button
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-[10px] border border-border-primary bg-white/80 font-number text-lg font-bold text-primary-deep shadow-ww-xs',
                    controller.activeSideIndex === index + 1
                    && 'bg-primary-light',
                  )}
                  key={operator}
                  onClick={() => controller.handleOperatorClick(operator)}
                  onTouchMove={controller.handleKeyTouchMove}
                  onTouchStart={() =>
                    controller.handleKeyTouchStart(index + 1)}
                  type="button"
                >
                  {operator}
                </button>
              ))}
            </div>
          )}
        </div>

        <section
          className="record-editor-keypad shrink-0 border-t border-solid border-border-primary bg-white/70 px-4 backdrop-blur-xl"
          data-record-editor-keypad
        >
          <div className="grid grid-cols-[1fr_1fr] gap-[10px]">
            <button
              className="record-editor-keypad__action flex items-center justify-center border border-border-primary bg-white/80 px-2 text-[14px] font-bold leading-[21px] text-ww-mid active:bg-primary-light"
              data-record-editor-date-trigger
              onClick={() => controller.setIsDatePickerVisible(true)}
              type="button"
            >
              <DesignIcon className="mr-1" name="editor-date" size={16} />
              {controller.isToday
                ? t('common:time.today')
                : controller.formattedDate}
            </button>
            <m.button
              className="record-editor-keypad__action ww-theme-primary-action px-4 text-[15px] font-extrabold leading-[22.5px] disabled:opacity-50"
              data-record-editor-submit
              disabled={
                !hasValidSelectedCategory
                || controller.isSubmitting
                || controller.isImageUploading
              }
              onClick={() => void controller.handleSubmit()}
              type="button"
              whileTap={isMotionEnabled ? MOTION_PRESETS.press : undefined}
            >
              {controller.calculator.completeText}
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
                  'record-editor-keypad__key flex items-center justify-center border border-border-primary bg-white/90 font-number text-[21px] font-bold leading-[31.5px] text-ww-ink shadow-ww-xs',
                  item.keys === 'x'
                  && 'gap-1.5 border-primary-light bg-primary-light/55 font-sans text-[12px] text-primary-deep',
                  controller.activeKeyIndex === index && 'bg-primary-light',
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
        bodyClassName="flex max-h-[62vh] flex-col overflow-hidden"
        destroyOnClose
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
        <div className="space-y-2 overflow-auto px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3">
          <button
            aria-pressed={controller.linkedAssetId === null}
            className={cn(
              'flex min-h-[58px] w-full items-center gap-3 rounded-[16px] border bg-white px-3 text-left transition-colors active:bg-primary-light/25 focus-visible:border-primary',
              controller.linkedAssetId === null
                ? 'border-primary'
                : 'border-transparent',
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
                  'flex min-h-[64px] w-full items-center gap-3 rounded-[16px] border bg-white px-3 text-left transition-colors active:bg-primary-light/25 focus-visible:border-primary',
                  controller.linkedAssetId === asset.id
                    ? 'border-primary'
                    : 'border-transparent',
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
        bodyClassName="max-h-[55vh] overflow-auto px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4"
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
            className="mb-4 rounded-[18px] border border-primary-light/80 bg-primary-light/25 p-3"
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
                    className="inline-flex min-h-11 items-center gap-1 rounded-full border border-primary/25 bg-white px-2 pl-3 text-[13px] font-bold text-primary-deep shadow-ww-xs"
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
        <input aria-label="搜索标签" className="ww-sheet-control mb-3 min-h-11 w-full rounded-xl px-3" value={tagSearch} onChange={event => setTagSearch(event.target.value)} placeholder="搜索标签" />
        <p className="mb-3 text-xs text-ww-soft">
          已选
          {draftTagIds.length}
          {' '}
          / 20；标签在本账本内通用
        </p>
        <div className="flex flex-wrap gap-2">
          {(tags ?? []).filter(tag => tag.status !== 'ARCHIVED' && tag.name.includes(tagSearch.trim())).map(tag => (
            <div
              className="inline-flex overflow-hidden rounded-full"
              key={tag.id}
            >
              <button
                aria-pressed={draftTagIds.includes(tag.id)}
                className={cn(
                  'min-h-11 rounded-l-full border border-solid border-r-0 px-3 text-sm',
                  draftTagIds.includes(tag.id)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border-primary bg-white text-ww-mid',
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
                  className={cn(
                    'flex min-h-11 w-11 items-center justify-center border border-solid border-l border-l-white/35 transition disabled:opacity-45',
                    draftTagIds.includes(tag.id)
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
        <div className="mt-4 flex gap-3">
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
      <ImagePreview
        image={controller.imagePreviewUrl ?? contentUrl}
        onClose={closeImagePreview}
        placeholder={
          isImagePreviewLoading ? <SpinLoading color="white" /> : null
        }
        visible={isImagePreviewOpen}
      />
    </div>
  );
};

import type { TouchEvent } from 'react';
import type {
  RecordDraft,
  RecordEditorSeed,
  RecordEditorValidationError,
} from './types';
import type { CategoryAmountType, CategoryEntity } from '@/entities/category';
import type {
  CurrentLocationFix,
  RecordLocation,
  RecordLocationCandidatesResult,
} from '@/entities/record';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { money } from '@/shared/lib';
import { requestCurrentLocationFix } from './record-location';
import { useCalculator } from './useCalculator';
import { MAX_RECORD_IMAGES, useRecordEditorImages } from './useRecordEditorImages';

interface RecordEditorControllerOptions {
  onSubmit: (draft: RecordDraft) => Promise<void>;
  onValidationError?: (error: RecordEditorValidationError) => void;
  seed: RecordEditorSeed;
  supportsAssetLink?: boolean;
  supportsTags?: boolean;
  isEditing?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
  locate?: () => Promise<CurrentLocationFix | RecordLocation>;
  resolveLocationCandidates?: (
    location: Pick<CurrentLocationFix, 'latitude' | 'longitude'>,
  ) => Promise<RecordLocationCandidatesResult>;
}

export function useRecordEditorController({
  onSubmit,
  onValidationError,
  seed,
  supportsAssetLink = false,
  supportsTags = false,
  isEditing = false,
  onUploadImage,
  locate = requestCurrentLocationFix,
  resolveLocationCandidates,
}: RecordEditorControllerOptions) {
  const calculator = useCalculator({
    initialAmount: seed.amount,
    initialState: seed.calculator,
  });
  const [recordType, setRecordType] = useState<CategoryAmountType>(
    seed.recordType,
  );
  const [selectedCategory, setSelectedCategory] = useState(seed.category);
  const [remark, setRemark] = useState(seed.remark ?? '');
  const [date, setDate] = useState(() => {
    const initialDate = dayjs(seed.time);
    return initialDate.isValid() ? initialDate.toDate() : new Date();
  });
  const [selectedTagIds, setSelectedTagIds] = useState(seed.tagIds ?? []);
  const [tagSelectionDirty, setTagSelectionDirty] = useState(Boolean(seed.tagSelectionDirty));
  const [linkedAssetId, setLinkedAssetId] = useState<string | null>(
    seed.linkedAssetId ?? null,
  );
  const [location, setLocation] = useState<RecordLocation | null>(
    seed.location ?? null,
  );
  const [locationSelectionDirty, setLocationSelectionDirty] = useState(
    Boolean(seed.locationSelectionDirty),
  );
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);
  const [assetSelectionDirty, setAssetSelectionDirty] = useState(false);
  const {
    handleRemoveImage,
    handleRetryImage,
    handleSelectImages,
    getImageDraftState,
    hasImageUploadError,
    images,
    isImageSelectionDirty,
    isImageUploading,
    waitForImageUploads,
  } = useRecordEditorImages({
    attachments: seed.attachments ?? (seed.imageAssetId !== undefined || !seed.attachment ? [] : [seed.attachment]),
    pendingImages: seed.pendingImages ?? (seed.imagePreviewFile
      ? [{ assetId: typeof seed.imageAssetId === 'string' ? seed.imageAssetId : undefined, file: seed.imagePreviewFile, id: 'legacy-image' }]
      : []),
    initiallyDirty: seed.imageSelectionDirty ?? seed.imageAssetId !== undefined,
    onUploadImage,
  });
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTagPickerVisible, setIsTagPickerVisible] = useState(
    Boolean(seed.isTagPickerVisible),
  );
  const [activeKeyIndex, setActiveKeyIndex] = useState(-1);
  const [activeSideIndex, setActiveSideIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const hasAppliedInitialCategoryRef = useRef(Boolean(seed.category));

  useEffect(() => {
    const handleContextMenu = (event: Event) => event.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const handleRecordTypeChange = useCallback(
    (nextType: CategoryAmountType) => {
      if (nextType === recordType)
        return;
      setRecordType(nextType);
      setSelectedCategory(undefined);
      setIsTagPickerVisible(false);
    },
    [recordType],
  );

  const handleSelectCategory = useCallback(
    (category: CategoryEntity) => {
      if (selectedCategory?.id !== category.id) {
        setIsTagPickerVisible(false);
      }
      setSelectedCategory(category);
    },
    [selectedCategory?.id],
  );

  const applyInitialCategory = useCallback(
    (category?: Pick<CategoryEntity, 'icon' | 'id' | 'name' | 'type'> & { iconType?: CategoryEntity['iconType']; textIconEnabled?: boolean; textIconIndex?: number }) => {
      if (!category || selectedCategory || hasAppliedInitialCategoryRef.current)
        return;
      hasAppliedInitialCategoryRef.current = true;
      setSelectedCategory(category);
    },
    [selectedCategory],
  );

  const handleKeyTouchStart = useCallback((index: number) => {
    setActiveKeyIndex(index);
  }, []);

  const handleKeyTouchMove = useCallback((event: TouchEvent) => {
    const element = event.touches[0]?.target as HTMLElement | undefined;
    if (!element)
      return;
    const deltaY = event.touches[0]!.pageY - element.offsetTop;
    const deltaX = event.touches[0]!.pageX - element.offsetLeft;
    if (deltaY < 0 || deltaY > 46 || deltaX < 0 || deltaX > 80) {
      setActiveKeyIndex(-2);
      setActiveSideIndex(-1);
    }
  }, []);

  const handleKeyClick = useCallback(
    (key: number | string) => {
      setActiveKeyIndex(-1);
      if (activeKeyIndex === -2)
        return;
      if (typeof key === 'number')
        calculator.inputDigit(key);
      else if (key === '.')
        calculator.inputDecimal();
      else if (key === 'x')
        calculator.inputDelete();
    },
    [activeKeyIndex, calculator],
  );

  const handleOperatorClick = useCallback(
    (operator: string) => {
      setActiveSideIndex(-1);
      if (activeKeyIndex === -2) {
        setActiveKeyIndex(-1);
        return;
      }
      calculator.inputOperator(operator);
    },
    [activeKeyIndex, calculator],
  );

  const handleToggleTag = useCallback((tagId: string) => {
    setTagSelectionDirty(true);
    setSelectedTagIds(current => current.includes(tagId) ? current.filter(id => id !== tagId) : current.length < 20 ? [...current, tagId] : current);
  }, []);

  const handleSetTags = useCallback((tagIds: string[]) => {
    const next = [...new Set(tagIds)].slice(0, 20);
    if (next.length === selectedTagIds.length && next.every(id => selectedTagIds.includes(id)))
      return;
    setSelectedTagIds(next);
    setTagSelectionDirty(true);
  }, [selectedTagIds]);

  const handleClearTag = useCallback(() => {
    setTagSelectionDirty(true);
    setSelectedTagIds([]);
  }, []);

  const handleSelectLinkedAsset = useCallback((assetId: string | null) => {
    setLinkedAssetId(assetId);
    setAssetSelectionDirty(true);
  }, []);

  const applyInitialLinkedAsset = useCallback((assetId?: string) => {
    if (
      !supportsAssetLink
      || isEditing
      || assetSelectionDirty
      || linkedAssetId !== null
      || !assetId
    ) {
      return;
    }
    setLinkedAssetId(assetId);
  }, [assetSelectionDirty, isEditing, linkedAssetId, supportsAssetLink]);

  const handleSelectLocation = useCallback(
    (nextLocation: RecordLocation | null) => {
      setLocation(nextLocation);
      setLocationSelectionDirty(true);
      setIsLocationPickerVisible(false);
    },
    [],
  );

  const handleRemoveTag = useCallback((tagId: string) => {
    setTagSelectionDirty(true);
    setSelectedTagIds(current => current.filter(id => id !== tagId));
  }, []);

  const handleReconcileTags = useCallback(
    (availableTagIds: readonly string[]) => {
      const availableIds = new Set(availableTagIds);
      const nextTagIds = selectedTagIds.filter(tagId =>
        availableIds.has(tagId),
      );
      if (nextTagIds.length === selectedTagIds.length)
        return;
      setSelectedTagIds(nextTagIds);
      setTagSelectionDirty(true);
    },
    [selectedTagIds],
  );

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || isImageUploading || hasImageUploadError)
      return;
    if (!selectedCategory) {
      onValidationError?.('category');
      return;
    }
    const amount = calculator.resolveAmount();
    if (amount === undefined) {
      onValidationError?.('amount');
      return;
    }

    const draft: RecordDraft = {
      amount: money.formatNatural(amount),
      categoryId: selectedCategory.id,
      remark: remark.trim() || selectedCategory.name,
      time: dayjs(date).toISOString(),
      type: selectedCategory.type,
      ...(supportsTags && (!isEditing || tagSelectionDirty)
        ? { tagIds: selectedTagIds }
        : {}),
      ...(supportsAssetLink && (!isEditing || assetSelectionDirty)
        ? { linkedAssetId }
        : {}),
      ...((!isEditing && location) || locationSelectionDirty
        ? { location }
        : {}),
      ...(isImageSelectionDirty
        ? {
            imageAssetIds: images.flatMap(image => image.kind === 'new' && image.assetId ? [image.assetId] : []),
            ...(isEditing ? { retainedAttachmentIds: images.flatMap(image => image.kind === 'existing' ? [image.id] : []) } : {}),
          }
        : {}),
    };

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await onSubmit(draft);
    }
    finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [
    calculator,
    date,
    onSubmit,
    onValidationError,
    remark,
    selectedCategory,
    selectedTagIds,
    supportsTags,
    isEditing,
    tagSelectionDirty,
    hasImageUploadError,
    images,
    isImageSelectionDirty,
    isImageUploading,
    linkedAssetId,
    assetSelectionDirty,
    location,
    locationSelectionDirty,
    supportsAssetLink,
  ]);

  const formattedDate = useMemo(() => dayjs(date).format('YYYY/MM/DD'), [date]);
  const formattedTime = useMemo(() => dayjs(date).format('HH:mm:ss'), [date]);
  const isToday = useMemo(() => dayjs().isSame(date, 'day'), [date]);
  const getDraftSnapshot = useCallback(
    (): RecordEditorSeed => {
      const { images: currentImages, isImageSelectionDirty: currentImageSelectionDirty } = getImageDraftState();
      return {
        amount: calculator.totals,
        attachments: currentImages.flatMap(image => image.kind === 'existing' ? [image.attachment] : []),
        calculator: {
          addNum: calculator.addNum,
          addition: calculator.addition,
          completeText: calculator.completeText,
          num: calculator.num,
          totals: calculator.totals,
        },
        category: selectedCategory,
        pendingImages: currentImages.flatMap(image => image.kind === 'new'
          ? [{ assetId: image.assetId, file: image.file, id: image.id }]
          : []),
        imageSelectionDirty: currentImageSelectionDirty,
        linkedAssetId,
        location,
        locationSelectionDirty,
        isTagPickerVisible: true,
        recordType,
        remark,
        tagIds: selectedTagIds,
        ...(tagSelectionDirty ? { tagSelectionDirty } : {}),
        time: dayjs(date).toISOString(),
        shouldReconcileTags: true,
      };
    },
    [
      calculator,
      date,
      getImageDraftState,
      linkedAssetId,
      location,
      locationSelectionDirty,
      recordType,
      remark,
      selectedCategory,
      selectedTagIds,
      tagSelectionDirty,
    ],
  );

  return {
    activeKeyIndex,
    activeSideIndex,
    applyInitialCategory,
    applyInitialLinkedAsset,
    calculator,
    date,
    formattedDate,
    formattedTime,
    getDraftSnapshot,
    waitForImageUploads,
    handleKeyClick,
    handleKeyTouchMove,
    handleKeyTouchStart,
    handleOperatorClick,
    handleRecordTypeChange,
    handleSelectCategory,
    handleSubmit,
    handleToggleTag,
    handleSetTags,
    handleClearTag,
    handleRemoveTag,
    handleReconcileTags,
    handleRemoveImage,
    handleRetryImage,
    handleSelectImages,
    handleSelectLinkedAsset,
    handleSelectLocation,
    isDatePickerVisible,
    isNoteFocused,
    isSubmitting,
    isImageUploading,
    hasImageUploadError,
    images,
    canAddImages: Boolean(onUploadImage) && images.length < MAX_RECORD_IMAGES,
    locate,
    resolveLocationCandidates,
    linkedAssetId,
    location,
    isTagPickerVisible,
    isLocationPickerVisible,
    isToday,
    recordType,
    remark,
    selectedCategory,
    selectedTagIds,
    shouldReconcileTags: Boolean(seed.shouldReconcileTags),
    tagPickerDraftIds: seed.tagPickerDraftIds,
    tagSelectionDirty,
    assetSelectionDirty,
    setActiveSideIndex,
    setDate,
    setIsDatePickerVisible,
    setIsNoteFocused,
    setIsTagPickerVisible,
    setIsLocationPickerVisible,
    setRemark,
  };
}

export type RecordEditorController = ReturnType<
  typeof useRecordEditorController
>;

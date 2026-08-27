import type { TouchEvent } from 'react';
import type {
  RecordDraft,
  RecordEditorSeed,
  RecordEditorValidationError,
} from './types';
import type { CategoryAmountType, CategoryEntity } from '@/entities/category';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCalculator } from './useCalculator';

interface RecordEditorControllerOptions {
  onSubmit: (draft: RecordDraft) => Promise<void>;
  onValidationError?: (error: RecordEditorValidationError) => void;
  seed: RecordEditorSeed;
  supportsTags?: boolean;
  isEditing?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
}

export function useRecordEditorController({
  onSubmit,
  onValidationError,
  seed,
  supportsTags = false,
  isEditing = false,
  onUploadImage,
}: RecordEditorControllerOptions) {
  const calculator = useCalculator();
  const { setNum: setCalculatorNum, setTotals: setCalculatorTotals } = calculator;
  const [recordType, setRecordType] = useState<CategoryAmountType>(seed.recordType);
  const [selectedCategory, setSelectedCategory] = useState(seed.category);
  const [remark, setRemark] = useState(seed.remark ?? '');
  const [date, setDate] = useState(() => {
    const initialDate = dayjs(seed.time);
    return initialDate.isValid() ? initialDate.toDate() : new Date();
  });
  const [selectedTagIds, setSelectedTagIds] = useState(seed.tagIds ?? []);
  const [tagSelectionDirty, setTagSelectionDirty] = useState(false);
  const [imageAssetId, setImageAssetId] = useState<string | null | undefined>(undefined);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTagPickerVisible, setIsTagPickerVisible] = useState(false);
  const [activeKeyIndex, setActiveKeyIndex] = useState(-1);
  const [activeSideIndex, setActiveSideIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const imageSelectionRef = useRef(0);

  useEffect(() => {
    if (!seed.amount)
      return;
    setCalculatorNum(seed.amount);
    setCalculatorTotals(seed.amount);
  }, [seed.amount, setCalculatorNum, setCalculatorTotals]);

  useEffect(() => {
    const handleContextMenu = (event: Event) => event.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  useEffect(() => () => {
    if (imagePreviewUrl)
      URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  const handleRecordTypeChange = useCallback((nextType: CategoryAmountType) => {
    if (nextType === recordType)
      return;
    setRecordType(nextType);
    setSelectedCategory(undefined);
    setSelectedTagIds([]);
    setTagSelectionDirty(true);
    setIsTagPickerVisible(false);
  }, [recordType]);

  const handleSelectCategory = useCallback((category: CategoryEntity) => {
    if (selectedCategory?.id !== category.id) {
      setSelectedTagIds([]);
      setTagSelectionDirty(true);
      setIsTagPickerVisible(false);
    }
    setSelectedCategory(category);
  }, [selectedCategory?.id]);

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

  const handleKeyClick = useCallback((key: number | string) => {
    setActiveKeyIndex(-1);
    if (activeKeyIndex === -2)
      return;
    if (typeof key === 'number')
      calculator.inputDigit(key);
    else if (key === '.')
      calculator.inputDecimal();
    else if (key === 'x')
      calculator.inputDelete();
  }, [activeKeyIndex, calculator]);

  const handleOperatorClick = useCallback((operator: string) => {
    setActiveSideIndex(-1);
    if (activeKeyIndex === -2) {
      setActiveKeyIndex(-1);
      return;
    }
    calculator.inputOperator(operator);
  }, [activeKeyIndex, calculator]);

  const handleToggleTag = useCallback((tagId: string) => {
    setTagSelectionDirty(true);
    // A historical record can start with multiple tags. Choosing its primary
    // tag is still an explicit single-selection mutation, not a clear action.
    setSelectedTagIds([tagId]);
  }, []);

  const handleClearTag = useCallback(() => {
    setTagSelectionDirty(true);
    setSelectedTagIds([]);
  }, []);

  const handleSelectImage = useCallback(async (file: File) => {
    if (!onUploadImage)
      return;
    const selection = ++imageSelectionRef.current;
    const preview = URL.createObjectURL(file);
    setImagePreviewUrl((current) => {
      if (current)
        URL.revokeObjectURL(current);
      return preview;
    });
    setImageUploadError(false);
    setIsImageUploading(true);
    try {
      const assetId = await onUploadImage(file);
      if (selection === imageSelectionRef.current)
        setImageAssetId(assetId);
    }
    catch {
      if (selection === imageSelectionRef.current)
        setImageUploadError(true);
    }
    finally {
      if (selection === imageSelectionRef.current)
        setIsImageUploading(false);
    }
  }, [onUploadImage]);

  const handleRemoveImage = useCallback(() => {
    imageSelectionRef.current += 1;
    setImagePreviewUrl((current) => {
      if (current)
        URL.revokeObjectURL(current);
      return undefined;
    });
    setImageAssetId(null);
    setImageUploadError(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || isImageUploading)
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
      amount: String(Number(amount)),
      categoryId: selectedCategory.id,
      remark: remark.trim() || selectedCategory.name,
      time: dayjs(date).toISOString(),
      type: selectedCategory.type,
      ...(supportsTags && (!isEditing || tagSelectionDirty) ? { tagIds: selectedTagIds } : {}),
      ...(imageAssetId !== undefined ? { imageAssetId } : {}),
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
    imageAssetId,
    isImageUploading,
  ]);

  const formattedDate = useMemo(() => dayjs(date).format('YYYY/MM/DD'), [date]);
  const isToday = useMemo(() => dayjs().isSame(date, 'day'), [date]);

  return {
    activeKeyIndex,
    activeSideIndex,
    calculator,
    date,
    formattedDate,
    handleKeyClick,
    handleKeyTouchMove,
    handleKeyTouchStart,
    handleOperatorClick,
    handleRecordTypeChange,
    handleSelectCategory,
    handleSubmit,
    handleToggleTag,
    handleClearTag,
    handleRemoveImage,
    handleSelectImage,
    isDatePickerVisible,
    isNoteFocused,
    isSubmitting,
    isImageUploading,
    imagePreviewUrl,
    imageUploadError,
    initialAttachment: seed.attachment,
    hasInitialImage: Boolean(seed.attachment ?? seed.hasImage) && imageAssetId !== null,
    isTagPickerVisible,
    isToday,
    recordType,
    remark,
    selectedCategory,
    selectedTagIds,
    tagSelectionDirty,
    setActiveSideIndex,
    setDate,
    setIsDatePickerVisible,
    setIsNoteFocused,
    setIsTagPickerVisible,
    setRemark,
  };
}

export type RecordEditorController = ReturnType<typeof useRecordEditorController>;

import type { CSSProperties } from 'react';
import type {
  CategoryAmountType,
  CategoryDeleteImpact,
  CategoryEntity,
  CategoryIconCatalogItem,
} from '@/entities/category';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from 'antd-mobile';
import {
  Check,
  ChevronDown,
  ChevronRight,
  EyeOff,
  FolderInput,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CategoryIcon,
  hasCategoryGlyph,
  useCategoryIconCatalogQuery,
  useCreateLedgerCategoryMutation,
  useDeleteLedgerCategoryPermanentlyMutation,
  useLedgerCategoriesQuery,
  useMoveLedgerCategoryMutation,
  usePatchLedgerCategoryMutation,
  useReorderLedgerCategoriesMutation,
  useUploadLedgerCategoryIconMutation,
} from '@/entities/category';
import { useTranslation } from '@/shared/i18n';
import { AppButton, AppSheet, PageLoadingState, SheetHeader } from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';
import { useMotionPreference } from '@/shared/ui/motion';
import { CategoryImageCropper } from './CategoryImageCropper';

type EditorState = { category?: CategoryEntity; parentId?: number; mode: 'create' | 'edit' } | null;

const GROUP_ORDER: CategoryIconCatalogItem['group'][] = [
  'food',
  'life',
  'family',
  'social',
  'income',
  'other',
];

const CATEGORY_ERROR_KEYS: Record<string, string> = {
  CATEGORY_ARCHIVED: 'archived',
  CATEGORY_DELETE_REFERENCED: 'deleteReferenced',
  CATEGORY_DELETE_REQUIRES_MIGRATION: 'deleteRequiresMigration',
  CATEGORY_DELETE_TARGET_CONFLICT: 'deleteTargetConflict',
  CATEGORY_DELETE_TARGET_INVALID: 'deleteTargetInvalid',
  CATEGORY_DELETE_TARGET_ROOT_REQUIRED: 'deleteTargetRootRequired',
  CATEGORY_ICON_ANIMATED: 'iconAnimated',
  CATEGORY_ICON_INVALID: 'iconInvalid',
  CATEGORY_ICON_STORAGE_UNAVAILABLE: 'iconStorageUnavailable',
  CATEGORY_ICON_TOO_LARGE: 'iconTooLarge',
  CATEGORY_LAST_ACTIVE: 'lastActive',
  CATEGORY_NAME_ARCHIVED: 'nameArchived',
  CATEGORY_NAME_CONFLICT: 'nameConflict',
  CATEGORY_ORDER_CONFLICT: 'orderConflict',
  CATEGORY_SYSTEM_IMMUTABLE: 'systemImmutable',
  CATEGORY_TEXT_ICON_INDEX_INVALID: 'textIconIndexInvalid',
  CATEGORY_TYPE_MISMATCH: 'typeMismatch',
  CATEGORY_VERSION_CONFLICT: 'versionConflict',
};

function getCategoryErrorMessage(
  error: unknown,
  t: (key: string) => string,
  fallback: string,
) {
  const code = (error as { code?: unknown })?.code;
  if (typeof code === 'string' && CATEGORY_ERROR_KEYS[code])
    return t(`categories.errors.${CATEGORY_ERROR_KEYS[code]}`);
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

function SortableCategoryRow({
  category,
  canManage,
  childCount,
  onEdit,
  onToggleChildren,
  isCollapsed,
  position,
  total,
  writePending,
}: {
  canManage: boolean;
  category: CategoryEntity;
  childCount: number;
  onEdit: () => void;
  onToggleChildren?: () => void;
  isCollapsed: boolean;
  position: number;
  total: number;
  writePending: boolean;
}) {
  const { t } = useTranslation('ledger');
  const childSummary = childCount > 0
    ? t('categories.childCount', { count: childCount })
    : t('categories.noChildren');
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    disabled: !canManage || writePending,
    id: category.id,
  });
  const style: CSSProperties = {
    opacity: isDragging ? 0.35 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="flex min-h-[64px] items-center gap-2 border-b border-solid border-border-primary pl-4 pr-2 last:border-b-0"
      ref={setNodeRef}
      role="listitem"
      style={style}
    >
      <button
        type="button"
        className="flex min-h-[64px] min-w-0 flex-1 items-center gap-3 border-0 bg-transparent p-0 text-left"
        aria-label={`${category.name}，${childSummary}`}
        aria-expanded={onToggleChildren ? !isCollapsed : undefined}
        aria-controls={onToggleChildren ? `subcategory-list-${category.id}` : undefined}
        disabled={!onToggleChildren}
        onClick={onToggleChildren}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ww-surface-tint text-primary-deep" data-category-management-icon>
          <CategoryIcon categoryName={category.name} iconKey={category.icon} iconType={category.iconType} textIconEnabled={category.textIconEnabled} textIconIndex={category.textIconIndex} size={21} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-extrabold text-ww-ink">{category.name}</span>
          <span className="mt-0.5 block truncate text-[10px] font-semibold text-ww-soft">{childSummary}</span>
        </span>
        {onToggleChildren && <ChevronDown aria-hidden size={16} className={`shrink-0 text-ww-soft transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />}
      </button>
      {canManage && (
        <button
          aria-label={t('categories.edit')}
          className="flex h-11 w-11 items-center justify-center rounded-xl border-0 bg-transparent text-ww-mid disabled:cursor-not-allowed"
          disabled={writePending}
          onClick={onEdit}
          type="button"
        >
          <Pencil size={17} />
        </button>
      )}
      {canManage && (
        <button
          {...attributes}
          {...listeners}
          aria-label={t('categories.dragPosition', {
            name: category.name,
            position,
            total,
          })}
          className="flex h-11 w-11 touch-none items-center justify-center rounded-xl border-0 bg-transparent text-ww-soft"
          disabled={writePending}
          type="button"
        >
          <GripVertical size={20} />
        </button>
      )}
    </div>
  );
}

function CategoryEditorSheet({
  editor,
  iconCatalog,
  ledgerId,
  onClose,
  onRefresh,
  onSaved,
  onMove,
  onArchive,
  onDelete,
  onMoveEarlier,
  managementPending,
  type,
}: {
  editor: Exclude<EditorState, null>;
  iconCatalog: CategoryIconCatalogItem[];
  ledgerId: string;
  onClose: () => void;
  onRefresh: () => Promise<unknown>;
  onSaved: () => void;
  onMove: (category: CategoryEntity) => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onMoveEarlier?: () => void;
  managementPending?: boolean;
  type: CategoryAmountType;
}) {
  const { i18n, t } = useTranslation('ledger');
  const [createCategory, createState] = useCreateLedgerCategoryMutation();
  const [patchCategory, patchState] = usePatchLedgerCategoryMutation();
  const [uploadIcon, uploadState] = useUploadLedgerCategoryIconMutation();
  const availableIcons = useMemo(
    () => iconCatalog.filter(item => hasCategoryGlyph(item.key)),
    [iconCatalog],
  );
  const [name, setName] = useState(editor.category?.name ?? '');
  const [iconKey, setIconKey] = useState<string | undefined>(
    editor.category?.iconType === 'BUILTIN'
      ? editor.category.icon
      : editor.mode === 'create'
        ? availableIcons[0]?.key
        : undefined,
  );
  const [textIconEnabled, setTextIconEnabled] = useState(editor.category?.textIconEnabled ?? false);
  const [textIconIndex, setTextIconIndex] = useState(editor.category?.textIconIndex ?? 0);
  const [image, setImage] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [cropSourceUrl, setCropSourceUrl] = useState<string>();
  const [uploadProgress, setUploadProgress] = useState(0);
  const submittingRef = useRef(false);
  const normalizedName = name.replace(/^[ \t\r\n\u3000]+|[ \t\r\n\u3000]+$/g, '');
  const nameChars = Array.from(normalizedName);
  const safeTextIconIndex = Math.min(textIconIndex, Math.max(0, nameChars.length - 1));
  const hasImage = Boolean(image || (!iconKey && editor.category?.iconType === 'IMAGE'));
  const valid = Array.from(normalizedName).length >= 1
    && Array.from(normalizedName).length <= 12
    && Boolean(image || iconKey || editor.category?.iconType === 'IMAGE' || textIconEnabled);
  const isSaving = createState.isLoading || patchState.isLoading || uploadState.isLoading;

  useEffect(() => () => {
    if (preview)
      URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => () => {
    if (cropSourceUrl)
      URL.revokeObjectURL(cropSourceUrl);
  }, [cropSourceUrl]);

  const submit = async () => {
    if (!valid || submittingRef.current)
      return;
    submittingRef.current = true;
    try {
      if (editor.mode === 'create') {
        if (image)
          setUploadProgress(0);
        await createCategory({
          data: {
            ...(image ? { file: image } : { iconKey: iconKey ?? 'receipt' }),
            name: normalizedName,
            parentId: editor.parentId,
            type,
            textIconEnabled,
            textIconIndex: safeTextIconIndex,
          },
          ledgerId,
          ...(image ? { onProgress: setUploadProgress } : {}),
        });
      }
      else if (editor.category) {
        let version = editor.category.version;
        const builtinChanged = Boolean(iconKey)
          && (editor.category.iconType !== 'BUILTIN' || iconKey !== editor.category.icon);
        const textChanged = textIconEnabled !== editor.category.textIconEnabled
          || safeTextIconIndex !== editor.category.textIconIndex;
        if (normalizedName !== editor.category.name || builtinChanged || textChanged) {
          const updated = await patchCategory({
            categoryId: editor.category.id,
            data: {
              ...(builtinChanged ? { iconKey: iconKey! } : {}),
              ...(normalizedName !== editor.category.name ? { name: normalizedName } : {}),
              ...(textChanged ? { textIconEnabled, textIconIndex: safeTextIconIndex } : {}),
              version,
            },
            ledgerId,
          });
          version = updated.version;
        }
        if (image) {
          setUploadProgress(0);
          await uploadIcon({
            categoryId: editor.category.id,
            file: image,
            ledgerId,
            onProgress: setUploadProgress,
            version,
          });
        }
      }
      onSaved();
      onClose();
    }
    catch (error) {
      setUploadProgress(0);
      showAppError({
        content: getCategoryErrorMessage(error, t, t('categories.saveFailed')),
        icon: 'fail',
      });
      void Promise.resolve(onRefresh()).catch(() => undefined);
    }
    finally {
      submittingRef.current = false;
    }
  };

  return (
    <AppSheet
      bodyStyle={{ height: 'min(86dvh, 720px)', overflow: 'hidden' }}
      destroyOnClose
      onMaskClick={cropSourceUrl ? () => setCropSourceUrl(undefined) : onClose}
      showCloseButton={false}
      visible
    >
      <div className="flex h-full flex-col bg-ww-background">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-solid border-border-primary px-4">
          <button className="border-0 bg-transparent text-[14px] font-bold text-ww-mid" onClick={cropSourceUrl ? () => setCropSourceUrl(undefined) : onClose} type="button">{t('categories.cancel')}</button>
          <h2 className="text-[15px] font-black text-ww-ink">
            {cropSourceUrl
              ? t('categories.cropTitle')
              : t(editor.mode === 'create' ? 'categories.addTitle' : 'categories.editTitle', {
                  type: t(type === 'sub' ? 'records.type.sub' : 'records.type.add'),
                })}
          </h2>
          {cropSourceUrl
            ? <span aria-hidden="true" className="w-[52px]" />
            : (
                <button
                  className="rounded-full border-0 bg-primary px-4 py-2 text-[12px] font-black text-white disabled:opacity-35"
                  disabled={!valid || isSaving}
                  onClick={() => void submit()}
                  type="button"
                >
                  {isSaving ? t('categories.saving') : t('categories.done')}
                </button>
              )}
        </header>
        {cropSourceUrl && (
          <CategoryImageCropper
            onConfirm={(croppedImage) => {
              setPreview(URL.createObjectURL(croppedImage));
              setImage(croppedImage);
              setIconKey(undefined);
              setTextIconEnabled(false);
              setUploadProgress(0);
              setCropSourceUrl(undefined);
            }}
            onInvalidImage={() => setCropSourceUrl(undefined)}
            sourceUrl={cropSourceUrl}
          />
        )}
        {!cropSourceUrl && (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-5">
            <div className="mx-auto max-w-[520px]">
              <label className="group mb-5 flex cursor-pointer flex-col items-center gap-2" data-category-image-upload>
                <span className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full bg-ww-surface-tint text-primary-deep shadow-ww transition-opacity group-hover:opacity-80 group-focus-within:outline group-focus-within:outline-2 group-focus-within:outline-offset-2 group-focus-within:outline-primary" data-category-image-preview>
                  {preview && !textIconEnabled
                    ? <img alt="" className="h-full w-full object-cover" src={preview} />
                    : (
                        <CategoryIcon
                          categoryName={normalizedName}
                          iconKey={iconKey ?? editor.category?.icon ?? 'receipt'}
                          iconType={iconKey ? 'BUILTIN' : editor.category?.iconType}
                          textIconEnabled={textIconEnabled}
                          textIconIndex={safeTextIconIndex}
                          size={31}
                        />
                      )}
                </span>
                <span className="text-center text-[11px] font-semibold leading-4 text-ww-mid">
                  {hasImage
                    ? t(textIconEnabled ? 'categories.imageHiddenByText' : 'categories.imageCropped')
                    : t('categories.uploadHint')}
                </span>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  aria-label={t('categories.uploadImage')}
                  className="sr-only"
                  onChange={(event) => {
                    const source = event.target.files?.[0];
                    event.target.value = '';
                    if (!source)
                      return;
                    if (source.size > 5 * 1024 * 1024) {
                      showAppError({ content: t('categories.errors.iconTooLarge'), icon: 'fail' });
                      return;
                    }
                    if (!['image/jpeg', 'image/png', 'image/webp'].includes(source.type)) {
                      showAppError({ content: t('categories.errors.iconInvalid'), icon: 'fail' });
                      return;
                    }
                    try {
                      setCropSourceUrl(URL.createObjectURL(source));
                    }
                    catch {
                      showAppError({ content: t('categories.imageFailed'), icon: 'fail' });
                    }
                  }}
                  type="file"
                />
              </label>
              <label
                className="ww-category-name-field flex min-h-[54px] items-center rounded-[18px] border border-solid border-border-primary bg-white/90 px-4 shadow-ww-xs transition-[border-color,box-shadow] focus-within:border-primary-mid focus-within:ring-2 focus-within:ring-[var(--ww-theme-color-light)]"
                data-testid="category-name-field"
              >
                <span className="sr-only">{t('categories.name')}</span>
                <Input
                  aria-label={t('categories.name')}
                  className="min-w-0 flex-1 text-[15px] text-ww-ink [--color:var(--ww-theme-text-color)] [--font-size:15px] [--placeholder-color:var(--ww-text-color-soft)]"
                  maxLength={24}
                  onChange={setName}
                  placeholder={t('categories.namePlaceholder')}
                  value={name}
                />
              </label>
              <div className="mt-2 text-right text-[10px] font-semibold text-ww-mid">
                {Array.from(normalizedName).length}
                /12
              </div>
              <section className="mt-5 rounded-[18px] border border-border-primary bg-white/90 p-4 shadow-ww-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-black text-ww-ink">{t('categories.textIcon')}</h3>
                    <p className="mt-1 text-[10px] font-semibold text-ww-mid">{t('categories.textIconHint')}</p>
                  </div>
                  <button
                    aria-label={t('categories.textIcon')}
                    aria-pressed={textIconEnabled}
                    className={`relative h-7 w-12 rounded-full border-0 transition ${textIconEnabled ? 'bg-primary' : 'bg-ww-surface-tint'}`}
                    onClick={() => setTextIconEnabled(value => !value)}
                    type="button"
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${textIconEnabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                {textIconEnabled && nameChars.length > 0 && (
                  <div className="mt-4 grid grid-cols-6 gap-2">
                    {nameChars.map((char, index) => (
                      <button
                        aria-label={`${t('categories.chooseTextIcon')}: ${char}`}
                        aria-pressed={safeTextIconIndex === index}
                        className={`mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-full border-0 text-[16px] font-black ${safeTextIconIndex === index ? 'bg-primary text-white shadow-ww' : 'bg-ww-surface-tint text-ww-ink'}`}
                        key={`${char}-${nameChars.slice(0, index).join('')}`}
                        onClick={() => setTextIconIndex(index)}
                        type="button"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                )}
              </section>
              {editor.category && (editor.category.isCustom || onArchive || onDelete || onMoveEarlier) && (
                <section className="mt-5 overflow-hidden rounded-[18px] border border-solid border-border-primary bg-white/90 shadow-ww-xs">
                  <h3 className="px-4 pb-1 pt-4 text-[12px] font-black text-ww-mid">{t('categories.actions')}</h3>
                  {editor.category.isCustom && (
                    <button
                      className="flex min-h-12 w-full items-center gap-3 border-0 border-b border-solid border-border-primary bg-transparent px-4 text-left text-[13px] font-bold text-ww-ink"
                      disabled={isSaving || managementPending}
                      onClick={() => onMove(editor.category!)}
                      type="button"
                    >
                      <FolderInput aria-hidden size={18} className="text-primary-deep" />
                      <span className="flex-1">{t('categories.moveAction')}</span>
                      <ChevronRight aria-hidden size={16} className="text-ww-soft" />
                    </button>
                  )}
                  {onMoveEarlier && (
                    <button
                      className="flex min-h-12 w-full items-center gap-3 border-0 border-b border-solid border-border-primary bg-transparent px-4 text-left text-[13px] font-bold text-ww-ink"
                      disabled={isSaving || managementPending}
                      onClick={onMoveEarlier}
                      type="button"
                    >
                      <GripVertical aria-hidden size={18} className="text-primary-deep" />
                      <span className="flex-1">{t('categories.moveEarlier')}</span>
                      <ChevronRight aria-hidden size={16} className="text-ww-soft" />
                    </button>
                  )}
                  {onArchive && (
                    <button
                      className="flex min-h-12 w-full items-center gap-3 border-0 bg-transparent px-4 text-left text-[13px] font-bold text-feedback-danger"
                      disabled={isSaving || managementPending}
                      onClick={onArchive}
                      type="button"
                    >
                      <EyeOff aria-hidden size={18} />
                      <span className="flex-1">{t('categories.archive')}</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="flex min-h-12 w-full items-center gap-3 border-0 border-t border-solid border-border-primary bg-transparent px-4 text-left text-[13px] font-bold text-feedback-danger"
                      disabled={isSaving || managementPending}
                      onClick={onDelete}
                      type="button"
                    >
                      <Trash2 aria-hidden size={18} />
                      <span className="flex-1">{t('categories.deleteAction')}</span>
                    </button>
                  )}
                </section>
              )}
              {image && (isSaving || uploadProgress > 0) && (
                <div className="mt-3" role="progressbar" aria-label={t('categories.uploadProgress')} aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.round(uploadProgress * 100)}>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ww-surface-tint">
                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round(uploadProgress * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-right text-[10px] font-bold text-primary-deep">
                    {uploadProgress >= 1
                      ? t('categories.uploadProcessing')
                      : t('categories.uploadProgressValue', { value: Math.round(uploadProgress * 100) })}
                  </p>
                </div>
              )}
              {GROUP_ORDER.map((group) => {
                const icons = availableIcons.filter(item => item.group === group);
                if (!icons.length)
                  return null;
                return (
                  <section className="mt-5" key={group}>
                    <h3 className="mb-3 text-center text-[11px] font-extrabold tracking-[0.18em] text-ww-mid">
                      {t(`categories.iconGroups.${group}`)}
                    </h3>
                    <div className="grid grid-cols-5 gap-x-3 gap-y-4">
                      {icons.map((item) => {
                        const selected = !image && iconKey === item.key;
                        return (
                          <button
                            aria-label={i18n.resolvedLanguage?.startsWith('zh') ? item.name.zh : item.name.en}
                            aria-pressed={selected}
                            className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-0 transition ${selected ? 'bg-primary text-white shadow-ww' : 'bg-ww-surface-tint text-ww-mid'}`}
                            key={item.key}
                            onClick={() => {
                              setImage(undefined);
                              setPreview(undefined);
                              setIconKey(item.key);
                              setTextIconEnabled(false);
                              setUploadProgress(0);
                            }}
                            type="button"
                          >
                            <CategoryIcon iconKey={item.key} size={21} strokeWidth={1.8} />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppSheet>
  );
}

export function CategoryManagement({
  canManage,
  initialType = 'sub',
  ledgerId,
}: {
  canManage: boolean;
  initialType?: CategoryAmountType;
  ledgerId: string;
}) {
  const { t } = useTranslation('ledger');
  const [type, setType] = useState<CategoryAmountType>(initialType);
  const [showArchived, setShowArchived] = useState(false);
  const query = useLedgerCategoriesQuery({
    params: { ledgerId, status: 'ALL', type },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const catalogQuery = useCategoryIconCatalogQuery();
  const [patchCategory, patchState] = usePatchLedgerCategoryMutation();
  const [reorderCategories, reorderState] = useReorderLedgerCategoriesMutation();
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [editor, setEditor] = useState<EditorState>(null);
  const { isMotionEnabled } = useMotionPreference();
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const parentRowsRef = useRef(new Map<number, HTMLDivElement>());
  const [moving, setMoving] = useState<CategoryEntity | null>(null);
  const [moveParentId, setMoveParentId] = useState<number | null>(null);
  const [movePreview, setMovePreview] = useState<{ path: string; recordCount: number; version: number } | null>(null);
  const moveCategory = useMoveLedgerCategoryMutation();
  const [deleting, setDeleting] = useState<CategoryEntity | null>(null);
  const [deleteImpact, setDeleteImpact] = useState<CategoryDeleteImpact | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const deleteCategory = useDeleteLedgerCategoryPermanentlyMutation();
  const revealParent = (parentId: number) => {
    setExpandedIds(current => current.includes(parentId) ? current : [...current, parentId]);
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => parentRowsRef.current.get(parentId)?.scrollIntoView?.({
        behavior: isMotionEnabled ? 'smooth' : 'auto',
        block: 'nearest',
      }));
    }
  };
  const handleMove = async (preview: boolean) => {
    if (!moving)
      return;
    try {
      const result = await moveCategory.mutateAsync({ ledgerId, categoryId: moving.id, parentId: moveParentId, version: movePreview?.version ?? moving.version, preview });
      if (preview) {
        setMovePreview(result);
      }
      else {
        if (moveParentId)
          revealParent(moveParentId);
        setMoving(null);
        setMovePreview(null);
      }
    }
    catch (error) {
      setMovePreview(null);
      showAppError({ content: getCategoryErrorMessage(error, t, t('categories.saveFailed')), icon: 'fail' });
      await query.refetch();
    }
  };
  const handleStartDelete = async (category: CategoryEntity) => {
    setEditor(null);
    setDeleting(category);
    setDeleteImpact(null);
    setDeleteTargetId(null);
    try {
      const impact = await deleteCategory.mutateAsync({
        categoryId: category.id,
        ledgerId,
        preview: true,
        version: category.version,
      });
      setDeleteImpact(impact);
    }
    catch (error) {
      setDeleting(null);
      showAppError({ content: getCategoryErrorMessage(error, t, t('categories.deleteFailed')), icon: 'fail' });
      void query.refetch();
    }
  };
  const handleDelete = async () => {
    if (!deleting || !deleteImpact || (deleteImpact.requiresMigration && !deleteTargetId))
      return;
    try {
      await deleteCategory.mutateAsync({
        categoryId: deleting.id,
        ledgerId,
        targetCategoryId: deleteImpact.requiresMigration ? deleteTargetId! : undefined,
        version: deleting.version,
      });
      setDeleting(null);
      setDeleteImpact(null);
      setDeleteTargetId(null);
    }
    catch (error) {
      showAppError({ content: getCategoryErrorMessage(error, t, t('categories.deleteFailed')), icon: 'fail' });
      void query.refetch();
    }
  };
  const writesRef = useRef(new Set<number | 'order'>());
  const active = categories.filter(category => category.status === 'ACTIVE');
  const roots = active.filter(category => !category.parentId);
  const archived = categories.filter(category => category.status === 'ARCHIVED');
  const deleteRequiresRoot = Boolean(deleteImpact && (deleteImpact.childCount || deleteImpact.budgetCount || deleteImpact.householdBudgetCount));
  const deleteTargets = active.filter(category => category.id !== deleting?.id
    && (!category.parentId || roots.some(root => root.id === category.parentId))
    && (!deleteRequiresRoot || !category.parentId));
  const deleteImpactRows = deleteImpact
    ? [
        { count: deleteImpact.recordCount, label: t('categories.deleteRecords') },
        { count: deleteImpact.budgetCount, label: t('categories.deleteBudgets') },
        { count: deleteImpact.householdBudgetCount, label: t('categories.deleteHouseholdBudgets') },
        { count: deleteImpact.tagCount, label: t('categories.deleteTags') },
        { count: deleteImpact.childCount, label: t('categories.deleteChildren') },
      ].filter(item => item.count > 0)
    : [];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    // Query responses are authoritative because they contain server-issued versions.
    // eslint-disable-next-line react/set-state-in-effect
    setCategories(query.data);
  }, [query.data]);

  const changeStatus = async (category: CategoryEntity, status: CategoryEntity['status']) => {
    if (writesRef.current.has(category.id))
      return;
    const previous = categories;
    writesRef.current.add(category.id);
    setCategories(current => status === 'ACTIVE'
      ? [
          { ...category, status, sortOrder: -1 },
          ...current.filter(item => item.id !== category.id),
        ]
      : current.map(item => item.id === category.id
          ? { ...item, status }
          : item));
    try {
      const updated = await patchCategory({
        categoryId: category.id,
        data: { status, version: category.version },
        ledgerId,
      });
      setCategories(current => status === 'ACTIVE'
        ? [updated, ...current.filter(item => item.id !== updated.id)]
        : current.map(item => item.id === updated.id ? updated : item));
    }
    catch (error) {
      setCategories(previous);
      await query.refetch();
      showAppError({
        content: getCategoryErrorMessage(error, t, t('categories.saveFailed')),
        icon: 'fail',
      });
    }
    finally {
      writesRef.current.delete(category.id);
    }
  };

  const handleReorder = async (draggedId: number, overId: number | undefined) => {
    if (overId === undefined || draggedId === overId || writesRef.current.has('order'))
      return;
    const draggedCategory = active.find(item => item.id === draggedId);
    const overCategory = active.find(item => item.id === overId);
    if (!draggedCategory || !overCategory || (draggedCategory.parentId ?? null) !== (overCategory.parentId ?? null))
      return;
    const siblings = active.filter(item => (item.parentId ?? null) === (draggedCategory.parentId ?? null));
    const oldIndex = siblings.findIndex(item => item.id === draggedId);
    const newIndex = siblings.findIndex(item => item.id === overId);
    if (oldIndex < 0 || newIndex < 0)
      return;
    const previous = categories;
    const nextActive = arrayMove(siblings, oldIndex, newIndex);
    setCategories([...nextActive, ...categories.filter(item => !siblings.some(sibling => sibling.id === item.id))]);
    writesRef.current.add('order');
    try {
      const saved = await reorderCategories({
        data: {
          parentId: draggedCategory.parentId,
          items: nextActive.map(category => ({
            categoryId: category.id,
            version: category.version,
          })),
          type,
        },
        ledgerId,
      });
      setCategories([...saved, ...categories.filter(item => !siblings.some(sibling => sibling.id === item.id))]);
    }
    catch {
      setCategories(previous);
      await query.refetch();
      showAppError({ content: t('categories.orderFailed'), icon: 'fail' });
    }
    finally {
      writesRef.current.delete('order');
    }
  };

  const handleTypeChange = (nextType: CategoryAmountType) => {
    if (nextType === type)
      return;
    setShowArchived(false);
    setExpandedIds([]);
    setType(nextType);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-[18px] pb-3 pt-2">
        <div className="mx-auto grid h-11 w-full max-w-[520px] grid-cols-2 rounded-[16px] bg-ww-surface-tint p-1 shadow-inner">
          {(['sub', 'add'] as const).map(value => (
            <button
              aria-pressed={type === value}
              className={`rounded-[12px] border-0 text-[13px] font-black transition-all ${type === value ? 'bg-primary text-white shadow-ww-xs' : 'bg-transparent text-ww-mid'}`}
              key={value}
              onClick={() => handleTypeChange(value)}
              type="button"
            >
              {t(value === 'sub' ? 'records.type.sub' : 'records.type.add')}
            </button>
          ))}
        </div>
      </div>
      <main className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-[calc(96px+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px]">
          {!canManage && (
            <div className="mb-3 rounded-[16px] bg-ww-surface-tint px-4 py-3 text-[11px] font-bold leading-5 text-ww-mid">
              {t('categories.readOnly')}
            </div>
          )}
          <div className="mb-2 flex items-end justify-between px-1">
            <div>
              <h2 className="text-[13px] font-black tracking-wide text-ww-ink">{t('categories.current')}</h2>
              <p className="mt-0.5 text-[10px] font-semibold text-ww-mid">{t('categories.currentHint')}</p>
            </div>
            <span className="text-[10px] font-extrabold text-ww-mid">{active.length}</span>
          </div>
          <section className="overflow-hidden rounded-[22px] border border-solid border-border-primary bg-ww-surface shadow-ww">
            {query.isLoading
              ? <PageLoadingState compact label={t('common:nav.loading')} testId="category-management-loading" />
              : (
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={event => void handleReorder(Number(event.active.id), event.over ? Number(event.over.id) : undefined)}
                    sensors={sensors}
                  >
                    <SortableContext items={roots.map(item => item.id)} strategy={verticalListSortingStrategy}>
                      <div aria-label={t('categories.current')} role="list">
                        {roots.map((category, index) => {
                          const children = active.filter(child => child.parentId === category.id);
                          const isCollapsed = !expandedIds.includes(category.id);
                          return (
                            <div
                              data-category-parent={category.id}
                              key={category.id}
                              ref={(node) => {
                                if (node)
                                  parentRowsRef.current.set(category.id, node);
                                else
                                  parentRowsRef.current.delete(category.id);
                              }}
                            >
                              <SortableCategoryRow
                                canManage={canManage}
                                category={category}
                                childCount={children.length}
                                onEdit={() => setEditor({ category, mode: 'edit' })}
                                onToggleChildren={canManage || children.length > 0 ? () => setExpandedIds(current => isCollapsed ? [...current, category.id] : current.filter(id => id !== category.id)) : undefined}
                                isCollapsed={isCollapsed}
                                position={index + 1}
                                total={roots.length}
                                writePending={patchState.isLoading || reorderState.isLoading}
                              />
                              {(canManage || children.length > 0) && (
                                <div id={`subcategory-list-${category.id}`} aria-hidden={isCollapsed} className={`grid ${isCollapsed ? 'invisible grid-rows-[0fr]' : 'visible grid-rows-[1fr]'} ${isMotionEnabled ? 'transition-[grid-template-rows,visibility] duration-200 ease-out' : ''}`}>
                                  <div className="min-h-0 overflow-hidden">
                                    {children.length === 0
                                      ? (
                                          <button
                                            aria-label={t('categories.addChildTo', { name: category.name })}
                                            className="mx-4 mb-3 mt-2 flex min-h-12 w-[calc(100%-32px)] items-center justify-center gap-2 rounded-[14px] border border-dashed border-primary-mid bg-ww-surface-tint text-[12px] font-bold text-primary-deep"
                                            onClick={() => setEditor({ mode: 'create', parentId: category.id })}
                                            type="button"
                                          >
                                            <Plus aria-hidden size={17} />
                                            {t('categories.addChild')}
                                          </button>
                                        )
                                      : (
                                          <div className="mx-3 mb-3 mt-2 grid grid-cols-5 gap-x-1 gap-y-2 rounded-2xl bg-ww-surface-tint px-2 py-3 max-[360px]:grid-cols-4" data-subcategory-grid>
                                            {children.map(child => (
                                              <button
                                                key={child.id}
                                                type="button"
                                                aria-label={t(canManage ? 'categories.editChild' : 'categories.viewChild', { name: child.name })}
                                                className="flex min-h-[76px] min-w-0 flex-col items-center gap-1.5 rounded-xl border-0 bg-transparent px-0.5 py-1 text-center text-[12px] leading-4 text-ww-ink enabled:active:bg-primary-light/50"
                                                disabled={!canManage || patchState.isLoading || reorderState.isLoading}
                                                onClick={() => setEditor({ category: child, mode: 'edit' })}
                                              >
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ww-surface" data-subcategory-icon>
                                                  <CategoryIcon categoryName={child.name} iconKey={child.icon} iconType={child.iconType} textIconEnabled={child.textIconEnabled} textIconIndex={child.textIconIndex} size={24} />
                                                </span>
                                                <span className="w-full break-words">{child.name}</span>
                                              </button>
                                            ))}
                                            {canManage && (
                                              <button type="button" aria-label={t('categories.addChildTo', { name: category.name })} className="flex min-h-[76px] min-w-0 flex-col items-center gap-1.5 rounded-xl border-0 bg-transparent px-0.5 py-1 text-[12px] leading-4 text-ww-mid active:bg-primary-light/50" onClick={() => setEditor({ mode: 'create', parentId: category.id })}>
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ww-soft/20"><Plus size={24} strokeWidth={1.8} /></span>
                                                <span>{t('categories.addChildShort')}</span>
                                              </button>
                                            )}
                                          </div>
                                        )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
          </section>

          <div className="mb-2 mt-6 px-1">
            <button
              aria-controls="archived-category-list"
              aria-expanded={showArchived}
              className="flex w-full items-center justify-between border-0 bg-transparent p-0 text-left"
              onClick={() => setShowArchived(current => !current)}
              type="button"
            >
              <span>
                <span className="block text-[13px] font-black tracking-wide text-ww-ink">
                  {t('categories.moreCount', { count: archived.length })}
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold text-ww-mid">{t('categories.moreHint')}</span>
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`shrink-0 text-ww-mid transition-transform ${showArchived ? 'rotate-180' : ''}`}
                size={18}
              />
            </button>
          </div>
          {showArchived && (
            <section
              className="overflow-hidden rounded-[22px] border border-solid border-border-primary bg-ww-surface shadow-ww-xs"
              id="archived-category-list"
            >
              {archived.length
                ? archived.map(category => (
                    <div className="flex min-h-[60px] items-center gap-3 border-b border-solid border-border-primary px-4 last:border-b-0" key={category.id}>
                      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-ww-surface-tint text-ww-mid" data-category-management-icon>
                        <CategoryIcon categoryName={category.name} iconKey={category.icon} iconType={category.iconType} textIconEnabled={category.textIconEnabled} textIconIndex={category.textIconIndex} size={20} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-ww-mid">{category.name}</span>
                      {canManage && (
                        <button
                          aria-label={t('categories.editName', { name: category.name })}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-0 bg-transparent text-ww-mid"
                          onClick={() => setEditor({ category, mode: 'edit' })}
                          type="button"
                        >
                          <Pencil aria-hidden size={17} />
                        </button>
                      )}
                      {canManage
                        ? (
                            <button
                              aria-label={t('categories.restoreName', { name: category.name })}
                              className="min-h-11 shrink-0 rounded-xl border-0 bg-ww-surface-tint px-3 text-[12px] font-bold text-primary-deep"
                              onClick={() => void changeStatus(category, 'ACTIVE')}
                              type="button"
                            >
                              {t('categories.restore')}
                            </button>
                          )
                        : <span className="text-[11px] font-bold text-ww-soft">{t('categories.inactive')}</span>}
                    </div>
                  ))
                : <p className="px-4 py-6 text-center text-[11px] font-semibold text-ww-mid">{t('categories.noMore')}</p>}
            </section>
          )}
        </div>
      </main>
      {canManage && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center border-t border-solid border-border-primary bg-ww-surface px-[18px] pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
          <AppButton
            className="max-w-[520px]"
            fullWidth
            size="large"
            onClick={() => setEditor({ mode: 'create' })}
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={18} />
              {t('categories.add')}
            </span>
          </AppButton>
        </div>
      )}
      {moving && (
        <AppSheet
          bodyStyle={{ height: 'min(78dvh, 640px)', overflow: 'hidden' }}
          onMaskClick={() => setMoving(null)}
          showCloseButton={false}
          visible
        >
          <div className="flex h-full flex-col bg-ww-background">
            <SheetHeader
              closeLabel={t('categories.cancel')}
              description={moving.name}
              icon={<FolderInput size={20} />}
              onClose={() => setMoving(null)}
              title={t('categories.moveTitle')}
            />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[18px] py-4">
              <div className="mx-auto max-w-[520px]">
                {movePreview
                  ? (
                      <div className="rounded-[20px] border border-solid border-border-primary bg-ww-surface p-5 shadow-ww-xs" role="status">
                        <p className="text-[12px] font-bold text-ww-mid">{t('categories.moveCurrent')}</p>
                        <p className="mt-1 text-[15px] font-black text-ww-ink">
                          {moving.parentId ? roots.find(category => category.id === moving.parentId)?.name : t('categories.asRoot')}
                        </p>
                        <div className="my-4 h-px bg-ww-surface-tint" />
                        <p className="text-[12px] font-bold text-ww-mid">{t('categories.moveResult')}</p>
                        <p className="mt-1 text-[17px] font-black text-primary-deep">{movePreview.path}</p>
                        <p className="mt-3 rounded-[12px] bg-ww-surface-tint px-3 py-2 text-[12px] font-semibold text-ww-mid">{t('categories.moveRecords', { count: movePreview.recordCount })}</p>
                        <button
                          className="mt-4 min-h-11 border-0 bg-transparent p-0 text-[12px] font-bold text-primary-deep"
                          onClick={() => setMovePreview(null)}
                          type="button"
                        >
                          {t('categories.changeDestination')}
                        </button>
                      </div>
                    )
                  : (
                      <>
                        <p className="mb-2 px-1 text-[12px] font-black text-ww-mid">{t('categories.moveDestination')}</p>
                        <div aria-label={t('categories.moveDestination')} className="overflow-hidden rounded-[20px] border border-solid border-border-primary bg-ww-surface shadow-ww-xs" role="radiogroup">
                          <button
                            aria-checked={moveParentId === null}
                            className={`flex min-h-[58px] w-full items-center gap-3 border-0 border-b border-solid border-border-primary px-4 text-left ${moveParentId === null ? 'bg-primary-light/40' : 'bg-transparent'}`}
                            onClick={() => {
                              setMoveParentId(null);
                              setMovePreview(null);
                            }}
                            role="radio"
                            type="button"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ww-surface-tint text-primary-deep"><FolderInput size={18} /></span>
                            <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ww-ink">{t('categories.asRoot')}</span>
                            {moveParentId === null && <Check aria-hidden size={18} className="text-primary-deep" />}
                          </button>
                          {roots.filter(category => category.id !== moving.id).map(category => (
                            <button
                              aria-checked={moveParentId === category.id}
                              className={`flex min-h-[58px] w-full items-center gap-3 border-0 border-b border-solid border-border-primary px-4 text-left last:border-b-0 ${moveParentId === category.id ? 'bg-primary-light/40' : 'bg-transparent'}`}
                              key={category.id}
                              onClick={() => {
                                setMoveParentId(category.id);
                                setMovePreview(null);
                              }}
                              role="radio"
                              type="button"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ww-surface-tint" data-category-management-icon>
                                <CategoryIcon categoryName={category.name} iconKey={category.icon} iconType={category.iconType} textIconEnabled={category.textIconEnabled} textIconIndex={category.textIconIndex} size={19} />
                              </span>
                              <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ww-ink">{category.name}</span>
                              {moveParentId === category.id && <Check aria-hidden size={18} className="text-primary-deep" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
              </div>
            </div>
            <div className="flex shrink-0 justify-center border-t border-solid border-border-primary bg-ww-surface px-[18px] pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
              <AppButton
                className="max-w-[520px]"
                disabled={moveParentId === (moving.parentId ?? null)}
                fullWidth
                loading={moveCategory.isLoading}
                onClick={() => void handleMove(!movePreview)}
                size="large"
              >
                {t(movePreview ? 'categories.confirmMove' : 'categories.previewMove')}
              </AppButton>
            </div>
          </div>
        </AppSheet>
      )}
      {deleting && (
        <AppSheet
          bodyStyle={deleteImpact?.requiresMigration ? { height: 'min(78dvh, 640px)', overflow: 'hidden' } : undefined}
          onMaskClick={() => setDeleting(null)}
          showCloseButton={false}
          visible
        >
          <div className={`flex flex-col bg-ww-background ${deleteImpact?.requiresMigration ? 'h-full' : ''}`}>
            <SheetHeader
              closeLabel={t('categories.cancel')}
              description={deleting.path ?? deleting.name}
              icon={<Trash2 size={20} />}
              onClose={() => setDeleting(null)}
              title={t('categories.deleteTitle')}
            />
            <div className={`${deleteImpact?.requiresMigration ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain' : ''} px-[18px] py-4`}>
              <div className="mx-auto max-w-[520px]">
                {!deleteImpact
                  ? <PageLoadingState compact label={t('common:nav.loading')} />
                  : deleteImpact.requiresMigration
                    ? (
                        <>
                          <div className="mb-4 rounded-[18px] border border-solid border-border-primary bg-ww-surface px-4 py-3">
                            <p className="text-[12px] font-bold text-ww-mid">{t('categories.deleteMigrationHint')}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {deleteImpactRows.map(item => (
                                <span className="rounded-full bg-ww-surface-tint px-2.5 py-1 text-[11px] font-bold text-ww-ink" key={item.label}>
                                  {item.label}
                                  {' '}
                                  {item.count}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="mb-2 px-1 text-[12px] font-black text-ww-mid">{t('categories.deleteTarget')}</p>
                          {deleteTargets.length
                            ? (
                                <div aria-label={t('categories.deleteTarget')} className="overflow-hidden rounded-[20px] border border-solid border-border-primary bg-ww-surface shadow-ww-xs" role="radiogroup">
                                  {deleteTargets.map(category => (
                                    <button
                                      aria-checked={deleteTargetId === category.id}
                                      className={`flex min-h-[58px] w-full items-center gap-3 border-0 border-b border-solid border-border-primary px-4 text-left last:border-b-0 ${deleteTargetId === category.id ? 'bg-primary-light/40' : 'bg-transparent'}`}
                                      key={category.id}
                                      onClick={() => setDeleteTargetId(category.id)}
                                      role="radio"
                                      type="button"
                                    >
                                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ww-surface-tint" data-category-management-icon>
                                        <CategoryIcon categoryName={category.name} iconKey={category.icon} iconType={category.iconType} textIconEnabled={category.textIconEnabled} textIconIndex={category.textIconIndex} size={19} />
                                      </span>
                                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ww-ink">{category.path ?? category.name}</span>
                                      {deleteTargetId === category.id && <Check aria-hidden size={18} className="text-primary-deep" />}
                                    </button>
                                  ))}
                                </div>
                              )
                            : <p className="rounded-[18px] bg-ww-surface px-4 py-5 text-[12px] font-semibold text-ww-mid">{t('categories.deleteNoTarget')}</p>}
                        </>
                      )
                    : <p className="rounded-[18px] bg-ww-surface px-4 py-5 text-[13px] font-semibold leading-6 text-ww-mid">{t('categories.deleteEmptyHint')}</p>}
              </div>
            </div>
            {deleteImpact && (
              <div className="flex shrink-0 justify-center border-t border-solid border-border-primary bg-ww-surface px-[18px] pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
                <AppButton
                  className="max-w-[520px]"
                  disabled={deleteImpact.requiresMigration && !deleteTargetId}
                  fullWidth
                  loading={deleteCategory.isLoading}
                  onClick={() => void handleDelete()}
                  size="large"
                  variant="danger"
                >
                  {t(deleteImpact.requiresMigration ? 'categories.migrateAndDelete' : 'categories.confirmDelete')}
                </AppButton>
              </div>
            )}
          </div>
        </AppSheet>
      )}
      {editor && (
        <CategoryEditorSheet
          editor={editor}
          iconCatalog={catalogQuery.data}
          ledgerId={ledgerId}
          onClose={() => setEditor(null)}
          onRefresh={query.refetch}
          onSaved={() => {
            const parentId = editor.parentId ?? editor.category?.parentId;
            if (parentId)
              revealParent(parentId);
          }}
          managementPending={patchState.isLoading || reorderState.isLoading}
          onArchive={editor.category?.status === 'ACTIVE' && (editor.category.parentId || roots.length > 1)
            ? () => {
                const category = editor.category!;
                setEditor(null);
                void changeStatus(category, 'ARCHIVED');
              }
            : undefined}
          onDelete={editor.category && (editor.category.status === 'ARCHIVED' || editor.category.parentId || roots.length > 1)
            ? () => void handleStartDelete(editor.category!)
            : undefined}
          onMoveEarlier={editor.category?.parentId && active.filter(item => item.parentId === editor.category?.parentId).findIndex(item => item.id === editor.category?.id) > 0
            ? () => {
                const category = editor.category!;
                const siblings = active.filter(item => item.parentId === category.parentId);
                const index = siblings.findIndex(item => item.id === category.id);
                setEditor(null);
                void handleReorder(category.id, siblings[index - 1]?.id);
              }
            : undefined}
          onMove={(category) => {
            setEditor(null);
            setMoving(category);
            setMoveParentId(category.parentId ?? null);
            setMovePreview(null);
          }}
          type={type}
        />
      )}
    </div>
  );
}

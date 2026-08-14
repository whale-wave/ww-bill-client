import type { DragEndEvent } from '@dnd-kit/core';
import type { CSSProperties } from 'react';
import type {
  CategoryAmountType,
  CategoryEntity,
  CategoryIconCatalogItem,
} from '@/entities/category';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Input, SpinLoading, Toast } from 'antd-mobile';
import {
  GripVertical,
  ImagePlus,
  Minus,
  Pencil,
  Plus,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CategoryIcon,
  hasCategoryGlyph,
  useCategoryIconCatalogQuery,
  useCreateLedgerCategoryMutation,
  useLedgerCategoriesQuery,
  usePatchLedgerCategoryMutation,
  useReorderLedgerCategoriesMutation,
  useUploadLedgerCategoryIconMutation,
} from '@/entities/category';
import { useTranslation } from '@/shared/i18n';
import { AppBottomSheet } from '@/shared/ui';

type EditorState = { category?: CategoryEntity; mode: 'create' | 'edit' } | null;

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
  CATEGORY_ICON_ANIMATED: 'iconAnimated',
  CATEGORY_ICON_INVALID: 'iconInvalid',
  CATEGORY_ICON_TOO_LARGE: 'iconTooLarge',
  CATEGORY_LAST_ACTIVE: 'lastActive',
  CATEGORY_NAME_ARCHIVED: 'nameArchived',
  CATEGORY_NAME_CONFLICT: 'nameConflict',
  CATEGORY_ORDER_CONFLICT: 'orderConflict',
  CATEGORY_SYSTEM_IMMUTABLE: 'systemImmutable',
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
  disableArchive,
  onArchive,
  onEdit,
  position,
  total,
  writePending,
}: {
  canManage: boolean;
  category: CategoryEntity;
  disableArchive: boolean;
  onArchive: () => void;
  onEdit: () => void;
  position: number;
  total: number;
  writePending: boolean;
}) {
  const { t } = useTranslation('ledger');
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
      className="flex min-h-[62px] items-center gap-3 border-b border-solid border-[#e8f0f7] px-3 last:border-b-0"
      ref={setNodeRef}
      role="listitem"
      style={style}
    >
      {canManage && (
        <button
          aria-label={disableArchive ? t('categories.lastActive') : t('categories.archive')}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-[#fff1f2] text-[#ef5261] disabled:cursor-not-allowed ${disableArchive ? 'opacity-35' : ''}`}
          disabled={disableArchive || writePending}
          onClick={onArchive}
          type="button"
        >
          <Minus size={17} strokeWidth={2.4} />
        </button>
      )}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#eff7fc] text-primary-deep">
        <CategoryIcon
          categoryName={category.name}
          iconKey={category.icon}
          iconType={category.iconType}
          size={21}
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-extrabold text-ww-ink">{category.name}</span>
          {category.isCustom && (
            <span className="shrink-0 rounded-full bg-[#e7f3fb] px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-primary-deep">
              {t('categories.custom')}
            </span>
          )}
        </div>
      </div>
      {canManage && category.isCustom && (
        <button
          aria-label={t('categories.edit')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border-0 bg-transparent text-[#6f8798] disabled:cursor-not-allowed"
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
          className="flex h-10 w-8 touch-none items-center justify-center rounded-xl border-0 bg-transparent text-[#9eb0bd]"
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
  type,
}: {
  editor: Exclude<EditorState, null>;
  iconCatalog: CategoryIconCatalogItem[];
  ledgerId: string;
  onClose: () => void;
  onRefresh: () => Promise<unknown>;
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
  const [image, setImage] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [uploadProgress, setUploadProgress] = useState(0);
  const submittingRef = useRef(false);
  const normalizedName = name.replace(/^[ \t\r\n\u3000]+|[ \t\r\n\u3000]+$/g, '');
  const valid = Array.from(normalizedName).length >= 1
    && Array.from(normalizedName).length <= 12
    && Boolean(image || iconKey || editor.category?.iconType === 'IMAGE');
  const isSaving = createState.isLoading || patchState.isLoading || uploadState.isLoading;

  useEffect(() => () => {
    if (preview)
      URL.revokeObjectURL(preview);
  }, [preview]);

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
            ...(image ? { file: image } : { iconKey: iconKey! }),
            name: normalizedName,
            type,
          },
          ledgerId,
          ...(image ? { onProgress: setUploadProgress } : {}),
        });
      }
      else if (editor.category) {
        let version = editor.category.version;
        const builtinChanged = Boolean(iconKey)
          && (editor.category.iconType !== 'BUILTIN' || iconKey !== editor.category.icon);
        if (normalizedName !== editor.category.name || builtinChanged) {
          const updated = await patchCategory({
            categoryId: editor.category.id,
            data: {
              ...(builtinChanged ? { iconKey: iconKey! } : {}),
              ...(normalizedName !== editor.category.name ? { name: normalizedName } : {}),
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
      Toast.show({ content: t('categories.saved'), icon: 'success' });
      onClose();
    }
    catch (error) {
      await onRefresh();
      Toast.show({
        content: getCategoryErrorMessage(error, t, t('categories.saveFailed')),
        icon: 'fail',
      });
    }
    finally {
      submittingRef.current = false;
    }
  };

  return (
    <AppBottomSheet
      bodyStyle={{ height: 'min(86dvh, 720px)', overflow: 'hidden' }}
      destroyOnClose
      onMaskClick={onClose}
      showCloseButton={false}
      visible
    >
      <div className="flex h-full flex-col bg-[#fbfdff]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-solid border-[#e6eef5] px-4">
          <button className="border-0 bg-transparent text-[14px] font-bold text-ww-mid" onClick={onClose} type="button">{t('categories.cancel')}</button>
          <h2 className="text-[15px] font-black text-ww-ink">
            {t(editor.mode === 'create' ? 'categories.addTitle' : 'categories.editTitle', {
              type: t(type === 'sub' ? 'records.type.sub' : 'records.type.add'),
            })}
          </h2>
          <button
            className="rounded-full border-0 bg-primary px-4 py-2 text-[12px] font-black text-white disabled:opacity-35"
            disabled={!valid || isSaving}
            onClick={() => void submit()}
            type="button"
          >
            {isSaving ? t('categories.saving') : t('categories.done')}
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-5">
          <div className="mx-auto max-w-[520px]">
            <div className="mb-5 flex justify-center">
              <span className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-[22px] bg-[#dff1fb] text-primary-deep shadow-[0_12px_30px_rgba(55,130,170,0.16)]">
                {preview
                  ? <img alt="" className="h-full w-full object-cover" src={preview} />
                  : (
                      <CategoryIcon
                        categoryName={normalizedName}
                        iconKey={iconKey ?? editor.category?.icon ?? 'receipt'}
                        iconType={iconKey ? 'BUILTIN' : editor.category?.iconType}
                        size={31}
                      />
                    )}
              </span>
            </div>
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
            {image && (createState.isLoading || uploadState.isLoading) && (
              <div className="mt-3" role="progressbar" aria-label={t('categories.uploadProgress')} aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.round(uploadProgress * 100)}>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e2edf4]">
                  <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round(uploadProgress * 100)}%` }} />
                </div>
                <p className="mt-1 text-right text-[10px] font-bold text-primary-deep">
                  {t('categories.uploadProgressValue', { value: Math.round(uploadProgress * 100) })}
                </p>
              </div>
            )}
            {GROUP_ORDER.map((group) => {
              const icons = availableIcons.filter(item => item.group === group);
              if (!icons.length)
                return null;
              return (
                <section className="mt-5" key={group}>
                  <h3 className="mb-3 text-center text-[11px] font-extrabold tracking-[0.18em] text-[#718897]">
                    {t(`categories.iconGroups.${group}`)}
                  </h3>
                  <div className="grid grid-cols-5 gap-x-3 gap-y-4">
                    {icons.map((item) => {
                      const selected = !image && iconKey === item.key;
                      return (
                        <button
                          aria-label={i18n.resolvedLanguage?.startsWith('zh') ? item.name.zh : item.name.en}
                          aria-pressed={selected}
                          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-0 transition ${selected ? 'bg-primary text-white shadow-[0_8px_20px_rgba(46,145,194,0.28)]' : 'bg-[#f0f4f6] text-[#667b88]'}`}
                          key={item.key}
                          onClick={() => {
                            setImage(undefined);
                            setPreview(undefined);
                            setIconKey(item.key);
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
            <label className="mt-6 flex min-h-14 cursor-pointer items-center gap-3 rounded-[18px] border border-dashed border-[#92c6df] bg-[#edf8fd] px-4 text-primary-deep">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white"><ImagePlus size={19} /></span>
              <span className="min-w-0 flex-1">
                <strong className="block text-[13px] font-black">{t('categories.uploadImage')}</strong>
                <small className="block truncate text-[10px] font-semibold text-[#6f8b9b]">{image ? t('categories.imageCropped') : t('categories.uploadHint')}</small>
              </span>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const source = event.target.files?.[0];
                  if (!source)
                    return;
                  if (source.size > 5 * 1024 * 1024) {
                    Toast.show({
                      content: t('categories.errors.iconTooLarge'),
                      icon: 'fail',
                    });
                    return;
                  }

                  setImage(source);
                  setIconKey(undefined);
                  try {
                    setPreview(URL.createObjectURL(source));
                  }
                  catch {
                    setPreview(undefined);
                  }
                }}
                type="file"
              />
            </label>
          </div>
        </div>
      </div>
    </AppBottomSheet>
  );
}

export function CategoryManagement({
  canManage,
  ledgerId,
}: {
  canManage: boolean;
  ledgerId: string;
}) {
  const { t } = useTranslation('ledger');
  const [type, setType] = useState<CategoryAmountType>('sub');
  const query = useLedgerCategoriesQuery({
    params: { ledgerId, status: 'ALL', type },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const catalogQuery = useCategoryIconCatalogQuery();
  const [patchCategory, patchState] = usePatchLedgerCategoryMutation();
  const [reorderCategories, reorderState] = useReorderLedgerCategoriesMutation();
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [editor, setEditor] = useState<EditorState>(null);
  const writesRef = useRef(new Set<number | 'order'>());
  const active = categories.filter(category => category.status === 'ACTIVE');
  const archived = categories.filter(category => category.status === 'ARCHIVED');
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
      Toast.show({
        content: status === 'ARCHIVED'
          ? t('categories.movedToMore')
          : t('categories.restored'),
        icon: 'success',
      });
    }
    catch (error) {
      setCategories(previous);
      await query.refetch();
      Toast.show({
        content: getCategoryErrorMessage(error, t, t('categories.saveFailed')),
        icon: 'fail',
      });
    }
    finally {
      writesRef.current.delete(category.id);
    }
  };

  const handleDragEnd = async ({ active: dragged, over }: DragEndEvent) => {
    if (!over || dragged.id === over.id || writesRef.current.has('order'))
      return;
    const oldIndex = active.findIndex(item => item.id === Number(dragged.id));
    const newIndex = active.findIndex(item => item.id === Number(over.id));
    if (oldIndex < 0 || newIndex < 0)
      return;
    const previous = categories;
    const nextActive = arrayMove(active, oldIndex, newIndex);
    setCategories([...nextActive, ...archived]);
    writesRef.current.add('order');
    try {
      const saved = await reorderCategories({
        data: {
          items: nextActive.map(category => ({
            categoryId: category.id,
            version: category.version,
          })),
          type,
        },
        ledgerId,
      });
      setCategories([...saved, ...archived]);
    }
    catch {
      setCategories(previous);
      await query.refetch();
      Toast.show({ content: t('categories.orderFailed'), icon: 'fail' });
    }
    finally {
      writesRef.current.delete('order');
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-[18px] pb-3 pt-2">
        <div className="mx-auto grid h-11 w-full max-w-[520px] grid-cols-2 rounded-[16px] bg-[#dfeef7] p-1 shadow-inner">
          {(['sub', 'add'] as const).map(value => (
            <button
              aria-pressed={type === value}
              className={`rounded-[12px] border-0 text-[13px] font-black transition-all ${type === value ? 'bg-primary text-white shadow-[0_6px_14px_rgba(47,137,183,0.24)]' : 'bg-transparent text-[#587183]'}`}
              key={value}
              onClick={() => setType(value)}
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
            <div className="mb-3 rounded-[16px] bg-[#edf7fc] px-4 py-3 text-[11px] font-bold leading-5 text-[#557586]">
              {t('categories.readOnly')}
            </div>
          )}
          <div className="mb-2 flex items-end justify-between px-1">
            <div>
              <h2 className="text-[13px] font-black tracking-wide text-ww-ink">{t('categories.current')}</h2>
              <p className="mt-0.5 text-[10px] font-semibold text-ww-mid">{t('categories.currentHint')}</p>
            </div>
            <span className="text-[10px] font-extrabold text-[#7190a1]">{active.length}</span>
          </div>
          <section className="overflow-hidden rounded-[22px] border border-solid border-[#e0ebf3] bg-white shadow-[0_14px_34px_rgba(43,91,119,0.08)]">
            {query.isLoading
              ? <div className="flex min-h-32 items-center justify-center"><SpinLoading color="primary" /></div>
              : (
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={event => void handleDragEnd(event)}
                    sensors={sensors}
                  >
                    <SortableContext items={active.map(item => item.id)} strategy={verticalListSortingStrategy}>
                      <div aria-label={t('categories.current')} role="list">
                        {active.map((category, index) => (
                          <SortableCategoryRow
                            canManage={canManage}
                            category={category}
                            disableArchive={active.length <= 1}
                            key={category.id}
                            onArchive={() => void changeStatus(category, 'ARCHIVED')}
                            onEdit={() => setEditor({ category, mode: 'edit' })}
                            position={index + 1}
                            total={active.length}
                            writePending={patchState.isLoading || reorderState.isLoading}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
          </section>

          <div className="mb-2 mt-6 px-1">
            <h2 className="text-[13px] font-black tracking-wide text-ww-ink">{t('categories.more')}</h2>
            <p className="mt-0.5 text-[10px] font-semibold text-ww-mid">{t('categories.moreHint')}</p>
          </div>
          <section className="overflow-hidden rounded-[22px] border border-solid border-[#e0ebf3] bg-white/90 shadow-[0_10px_28px_rgba(43,91,119,0.06)]">
            {archived.length
              ? archived.map(category => (
                  <div className="flex min-h-[60px] items-center gap-3 border-b border-solid border-[#e8f0f7] px-3 last:border-b-0" key={category.id}>
                    {canManage && (
                      <button
                        aria-label={t('categories.restoreName', { name: category.name })}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-[#e7f8ee] text-[#32b567]"
                        onClick={() => void changeStatus(category, 'ACTIVE')}
                        type="button"
                      >
                        <Plus size={18} strokeWidth={2.5} />
                      </button>
                    )}
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] bg-[#f1f5f7] text-[#718692]">
                      <CategoryIcon categoryName={category.name} iconKey={category.icon} iconType={category.iconType} size={20} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-[#647985]">{category.name}</span>
                    <span className="rounded-full bg-[#f1f4f6] px-2 py-1 text-[9px] font-bold text-[#8798a2]">{t('categories.inactive')}</span>
                  </div>
                ))
              : <p className="px-4 py-6 text-center text-[11px] font-semibold text-ww-mid">{t('categories.noMore')}</p>}
          </section>
        </div>
      </main>
      {canManage && (
        <div className="absolute inset-x-0 bottom-0 border-t border-solid border-[#dce8f0] bg-white/95 px-[18px] pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
          <Button
            block
            className="mx-auto !h-12 !max-w-[520px] !rounded-[17px] !border-0 !bg-primary !text-[14px] !font-black !text-white !shadow-[0_12px_26px_rgba(45,135,181,0.25)]"
            onClick={() => setEditor({ mode: 'create' })}
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={18} />
              {t('categories.add')}
            </span>
          </Button>
        </div>
      )}
      {editor && (
        <CategoryEditorSheet
          editor={editor}
          iconCatalog={catalogQuery.data}
          ledgerId={ledgerId}
          onClose={() => setEditor(null)}
          onRefresh={query.refetch}
          type={type}
        />
      )}
    </div>
  );
}

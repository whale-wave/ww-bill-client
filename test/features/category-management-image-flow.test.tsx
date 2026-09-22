import type { PropsWithChildren } from 'react';
import type { CropperProps } from 'react-easy-crop';
import type { CategoryEntity } from '@/entities/category';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryManagement } from '@/features/category-management';

const mocks = vi.hoisted(() => ({
  categories: [] as CategoryEntity[],
  createCategory: vi.fn(),
  patchCategory: vi.fn(),
  uploadIcon: vi.fn(),
}));

vi.mock('react-easy-crop', () => ({
  default: ({ image, onCropAreaChange, onMediaLoaded }: CropperProps) => (
    <img
      alt=""
      onLoad={() => {
        onMediaLoaded?.({ width: 400, height: 200, naturalWidth: 400, naturalHeight: 200 });
        onCropAreaChange?.({ x: 25, y: 0, width: 50, height: 100 }, { x: 100, y: 0, width: 200, height: 200 });
      }}
      src={image}
    />
  ),
}));

vi.mock('@/entities/category', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/category')>()),
  useCategoryIconCatalogQuery: () => ({ data: [] }),
  useCreateLedgerCategoryMutation: () => [mocks.createCategory, { isLoading: false }],
  useLedgerCategoriesQuery: () => ({ data: mocks.categories, isLoading: false, refetch: vi.fn() }),
  useMoveLedgerCategoryMutation: () => ({ mutateAsync: vi.fn(), isLoading: false }),
  usePatchLedgerCategoryMutation: () => [mocks.patchCategory, { isLoading: false }],
  useReorderLedgerCategoriesMutation: () => [vi.fn(), { isLoading: false }],
  useUploadLedgerCategoryIconMutation: () => [mocks.uploadIcon, { isLoading: false }],
}));
vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ i18n: { resolvedLanguage: 'zh-CN' }, t: (key: string) => key }),
}));
vi.mock('@/shared/ui', async importOriginal => ({
  ...(await importOriginal<typeof import('@/shared/ui')>()),
  AppSheet: ({ children }: PropsWithChildren) => <div>{children}</div>,
  PageLoadingState: () => null,
}));
vi.mock('@/shared/ui/app-feedback', () => ({ showAppError: vi.fn() }));

let cleanup: (() => void) | undefined;

beforeEach(() => {
  mocks.categories = [];
  mocks.createCategory.mockReset();
  mocks.createCategory.mockResolvedValue({ id: 1 });
  mocks.patchCategory.mockReset();
  mocks.patchCategory.mockResolvedValue({ version: 2 });
  mocks.uploadIcon.mockReset();
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:category-image');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.restoreAllMocks();
});

describe('category custom image flow', () => {
  function setCategoryName(container: HTMLElement, name: string) {
    const categoryName = container.querySelector<HTMLInputElement>('[data-testid="category-name-field"] input');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(categoryName, name);
      categoryName?.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  it('uses the top preview to choose an image and saves only the confirmed square crop', async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(callback => callback(new Blob(['cropped'], { type: 'image/webp' })));
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(CategoryManagement, { canManage: true, ledgerId: 'ledger-1' })));
    cleanup = () => act(() => root.unmount());

    const addButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent?.includes('categories.add'));
    act(() => addButton?.click());
    setCategoryName(container, '旅游');
    const textIconSwitch = container.querySelector<HTMLButtonElement>('[aria-label="categories.textIcon"]');
    expect(textIconSwitch).not.toBeNull();
    act(() => textIconSwitch?.click());
    expect(textIconSwitch?.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('[data-category-image-preview]')?.textContent).toBe('旅');
    const upload = container.querySelector('[data-category-image-upload]');
    const preview = container.querySelector('[data-category-image-preview]');
    const nameField = container.querySelector('[data-testid="category-name-field"]');
    expect(upload).not.toBeNull();
    expect(upload?.tagName).toBe('LABEL');
    expect(upload?.contains(preview)).toBe(true);
    expect(upload?.textContent).toContain('categories.uploadHint');
    expect(container.querySelectorAll('[data-category-image-upload]')).toHaveLength(1);
    expect(Boolean(upload && nameField && (upload.compareDocumentPosition(nameField) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);

    const input = upload?.querySelector<HTMLInputElement>('input[type="file"]');
    const pickerClick = vi.fn();
    input?.addEventListener('click', pickerClick);
    act(() => (preview as HTMLElement)?.click());
    expect(pickerClick).toHaveBeenCalledOnce();
    const source = new File(['original image'], 'source.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { configurable: true, value: [source] });
    act(() => input?.dispatchEvent(new Event('change', { bubbles: true })));
    expect(container.querySelector('[data-category-image-cropper]')).not.toBeNull();
    expect(mocks.createCategory).not.toHaveBeenCalled();

    const cancelCrop = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'categories.cancel');
    act(() => cancelCrop?.click());
    expect(container.querySelector('[data-category-image-cropper]')).toBeNull();
    expect(container.querySelector('[data-category-image-preview]')?.textContent).toBe('旅');
    const retryInput = container.querySelector<HTMLInputElement>('[data-category-image-upload] input[type="file"]');
    Object.defineProperty(retryInput, 'files', { configurable: true, value: [source] });
    act(() => retryInput?.dispatchEvent(new Event('change', { bubbles: true })));
    expect(container.querySelector('[data-category-image-cropper]')).not.toBeNull();

    const image = container.querySelector<HTMLImageElement>('[data-category-image-cropper] img');
    Object.defineProperty(image, 'naturalWidth', { value: 400 });
    Object.defineProperty(image, 'naturalHeight', { value: 200 });
    act(() => image?.dispatchEvent(new Event('load')));
    const confirm = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'categories.applyCrop');
    await act(async () => confirm?.click());

    expect(container.querySelector('[data-category-image-cropper]')).toBeNull();
    expect(container.querySelector<HTMLImageElement>('[data-category-image-preview] img')?.src).toBe('blob:category-image');
    expect(container.querySelector('[aria-label="categories.textIcon"]')?.getAttribute('aria-pressed')).toBe('false');
    expect(container.querySelector('[data-category-image-upload]')?.textContent).toContain('categories.imageCropped');
    expect(drawImage).toHaveBeenCalledWith(image, 100, 0, 200, 200, 0, 0, 512, 512);
    const saveButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'categories.done');
    expect(saveButton?.disabled).toBe(false);
    await act(async () => saveButton?.click());

    const uploadedFile = mocks.createCategory.mock.calls[0]?.[0]?.data?.file as File;
    expect(uploadedFile).toBeInstanceOf(File);
    expect(uploadedFile.name).toBe('category-icon.webp');
    expect(uploadedFile).not.toBe(source);
    expect(mocks.createCategory.mock.calls[0]?.[0]?.data?.textIconEnabled).toBe(false);
  });

  it('restores a selected image after switching text off and preserves it when saving text', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(callback => callback(new Blob(['cropped'], { type: 'image/webp' })));
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(CategoryManagement, { canManage: true, ledgerId: 'ledger-1' })));
    cleanup = () => act(() => root.unmount());

    const addButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent?.includes('categories.add'));
    act(() => addButton?.click());
    setCategoryName(container, '旅游');
    const input = container.querySelector<HTMLInputElement>('[data-category-image-upload] input[type="file"]');
    Object.defineProperty(input, 'files', { configurable: true, value: [new File(['image'], 'source.png', { type: 'image/png' })] });
    act(() => input?.dispatchEvent(new Event('change', { bubbles: true })));
    const image = container.querySelector<HTMLImageElement>('[data-category-image-cropper] img');
    Object.defineProperty(image, 'naturalWidth', { value: 400 });
    Object.defineProperty(image, 'naturalHeight', { value: 200 });
    act(() => image?.dispatchEvent(new Event('load')));
    const confirm = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'categories.applyCrop');
    await act(async () => confirm?.click());
    expect(container.querySelector('[data-category-image-preview] img')).not.toBeNull();

    const textIconSwitch = container.querySelector<HTMLButtonElement>('[aria-label="categories.textIcon"]');
    act(() => textIconSwitch?.click());
    expect(textIconSwitch?.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('[data-category-image-preview] img')).toBeNull();
    expect(container.querySelector('[data-category-image-preview]')?.textContent).toBe('旅');
    expect(container.querySelector('[data-category-image-upload]')?.textContent).toContain('categories.imageHiddenByText');
    act(() => textIconSwitch?.click());
    expect(container.querySelector<HTMLImageElement>('[data-category-image-preview] img')?.src).toBe('blob:category-image');
    expect(container.querySelector('[data-category-image-upload]')?.textContent).toContain('categories.imageCropped');
    act(() => textIconSwitch?.click());
    expect(container.querySelector('[data-category-image-preview]')?.textContent).toBe('旅');

    const saveButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'categories.done');
    await act(async () => saveButton?.click());
    expect(mocks.createCategory.mock.calls[0]?.[0]?.data).toMatchObject({ textIconEnabled: true });
    expect(mocks.createCategory.mock.calls[0]?.[0]?.data?.file).toBeInstanceOf(File);
    expect(mocks.createCategory.mock.calls[0]?.[0]?.data?.iconKey).toBeUndefined();
  });

  it('keeps an existing image when switching to text and back while editing', async () => {
    mocks.categories = [{
      createdAt: '2026-09-20T00:00:00.000Z',
      icon: 'https://example.com/category.webp',
      iconType: 'IMAGE',
      id: 7,
      isCustom: true,
      ledgerId: 'ledger-1',
      name: '旅游',
      sortOrder: 1,
      status: 'ACTIVE',
      textIconEnabled: false,
      textIconIndex: 0,
      type: 'sub',
      updatedAt: '2026-09-20T00:00:00.000Z',
      version: 1,
    }];
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(CategoryManagement, { canManage: true, ledgerId: 'ledger-1' })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[aria-label="categories.edit"]')?.click());
    expect(container.querySelector('[data-category-image-preview] img')).not.toBeNull();
    const textIconSwitch = container.querySelector<HTMLButtonElement>('[aria-label="categories.textIcon"]');
    act(() => textIconSwitch?.click());
    expect(container.querySelector('[data-category-image-preview] img')).toBeNull();
    expect(container.querySelector('[data-category-image-preview]')?.textContent).toBe('旅');
    expect(container.querySelector('[data-category-image-upload]')?.textContent).toContain('categories.imageHiddenByText');
    act(() => textIconSwitch?.click());
    expect(container.querySelector<HTMLImageElement>('[data-category-image-preview] img')?.src).toBe('https://example.com/category.webp');
    act(() => textIconSwitch?.click());
    expect(container.querySelector('[data-category-image-preview]')?.textContent).toBe('旅');

    const saveButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'categories.done');
    await act(async () => saveButton?.click());
    expect(mocks.patchCategory.mock.calls[0]?.[0]?.data).toMatchObject({ textIconEnabled: true });
    expect(mocks.patchCategory.mock.calls[0]?.[0]?.data?.iconKey).toBeUndefined();
    expect(mocks.uploadIcon).not.toHaveBeenCalled();
  });

  it('restores the stored image after reopening a text-icon category', () => {
    mocks.categories = [{
      createdAt: '2026-09-20T00:00:00.000Z',
      icon: 'https://example.com/category.webp',
      iconType: 'IMAGE',
      id: 8,
      isCustom: true,
      ledgerId: 'ledger-1',
      name: '旅游',
      sortOrder: 1,
      status: 'ACTIVE',
      textIconEnabled: true,
      textIconIndex: 0,
      type: 'sub',
      updatedAt: '2026-09-20T00:00:00.000Z',
      version: 2,
    }];
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(CategoryManagement, { canManage: true, ledgerId: 'ledger-1' })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[aria-label="categories.edit"]')?.click());
    expect(container.querySelector('[data-category-image-preview]')?.textContent).toBe('旅');
    act(() => container.querySelector<HTMLButtonElement>('[aria-label="categories.textIcon"]')?.click());
    expect(container.querySelector<HTMLImageElement>('[data-category-image-preview] img')?.src).toBe('https://example.com/category.webp');
  });

  it('can save a text icon before the built-in icon catalog loads', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(CategoryManagement, { canManage: true, ledgerId: 'ledger-1' })));
    cleanup = () => act(() => root.unmount());

    const addButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent?.includes('categories.add'));
    act(() => addButton?.click());
    setCategoryName(container, '旅游');
    act(() => container.querySelector<HTMLButtonElement>('[aria-label="categories.textIcon"]')?.click());
    const saveButton = [...container.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === 'categories.done');
    expect(saveButton?.disabled).toBe(false);
    await act(async () => saveButton?.click());

    expect(mocks.createCategory.mock.calls[0]?.[0]?.data).toMatchObject({
      iconKey: 'receipt',
      textIconEnabled: true,
    });
    expect(mocks.createCategory.mock.calls[0]?.[0]?.data?.file).toBeUndefined();
  });
});

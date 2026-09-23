import type { ReactNode } from 'react';
import type { Asset } from '@/entities/asset';
import type { CategoryEntity } from '@/entities/category';
import dayjs from 'dayjs';
import { act, createElement } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssetGroupAssetType } from '@/entities/asset';
import { getRecordAttachmentContentApi } from '@/entities/record';
import {
  RecordEditorPresentation,
  useRecordEditorController,
} from '@/features/record-editor';
import { confirmDangerousAction } from '@/shared/ui';

vi.mock('@/shared/i18n', () => ({
  i18n: { t: (key: string, values?: Record<string, unknown>) => values ? `${key} ${Object.values(values).join(' ')}` : key },
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => values ? `${key} ${Object.values(values).join(' ')}` : key,
  }),
}));

vi.mock('@/shared/ui', () => ({
  AppButton: ({ children, onClick, ...props }: {
    children?: ReactNode;
    onClick?: () => void;
  }) => createElement('button', { ...props, onClick, type: 'button' }, children),
  AppDatePicker: ({ precision, renderLabel, value }: {
    precision?: string;
    renderLabel?: (type: string, value: number) => ReactNode;
    value?: Date;
  }) => createElement('div', {
    'data-testid': 'record-editor-date-picker',
    'data-precision': precision,
    'data-value': value?.toISOString(),
  }, [
    ['year', 2026],
    ['month', 8],
    ['day', 9],
    ['hour', 7],
    ['minute', 8],
    ['second', 9],
  ].map(([type, part]) => createElement('span', {
    'data-date-picker-label': type,
    'key': type,
  }, renderLabel?.(String(type), Number(part))))),
  AppSheet: ({ children, visible }: { children: ReactNode; visible?: boolean }) => visible
    ? createPortal(createElement('section', { 'data-testid': 'bottom-sheet' }, children), document.body)
    : null,
  confirmDangerousAction: vi.fn(),
  DesignIcon: ({ name }: { name: string }) => createElement('span', { 'data-design-icon': name }),
  IllustratedEmptyState: ({ testId, title }: { testId: string; title: string }) => createElement('div', { 'data-testid': testId }, title),
  ImagePreview: ({ image, onClose, visible }: { image?: string; onClose?: () => void; visible?: boolean }) => visible
    ? createPortal(createElement(
        'section',
        { 'data-testid': 'interactive-image-preview' },
        createElement('img', { src: image }),
        createElement('button', { 'aria-label': '关闭图片预览', 'onClick': onClose, 'type': 'button' }),
      ), document.body)
    : null,
  MOTION_PRESETS: {
    contentSwap: {},
    press: {},
    selection: { scale: [1] },
    success: {},
  },
  SheetHeader: ({ onClose, title }: { onClose: () => void; title: string }) => createElement(
    'header',
    null,
    createElement('h2', null, title),
    createElement('button', { onClick: onClose, type: 'button' }, 'close'),
  ),
  useMotionPreference: () => ({ isMotionEnabled: false, shouldReduceMotion: true }),
}));

vi.mock('@/entities/record', () => ({
  getRecordAttachmentContentApi: vi.fn(),
}));

const category: CategoryEntity = {
  createdAt: '',
  icon: 'food',
  iconType: 'BUILTIN',
  id: 1,
  isCustom: false,
  ledgerId: '00000000-0000-4000-8000-000000000001',
  name: '餐饮',
  sortOrder: 0,
  status: 'ACTIVE',
  type: 'sub',
  updatedAt: '',
  version: 1,
};

const assetAccount: Asset = {
  amount: '50000',
  assetGroup: {
    assetType: 'bank' as Asset['assetGroup']['assetType'],
    createdAt: '',
    description: '',
    fixedName: false,
    icon: 'bank-card',
    id: 'bank-group',
    level: 2,
    name: '中信银行',
    parentId: 'savings-group',
    type: 'add',
    updatedAt: '',
  },
  createdAt: '',
  comment: '日常支出卡',
  id: 'asset-account',
  name: '中信银行',
  updatedAt: '',
};

const creditAssetAccount: Asset = {
  ...assetAccount,
  assetGroup: {
    ...assetAccount.assetGroup,
    assetType: AssetGroupAssetType.CREDIT,
    name: '信用卡',
    parentId: '',
    type: 'sub',
  },
  name: '中信信用卡',
  creditLimit: '120000',
};

const creditAssetWithoutType: Asset = {
  ...creditAssetAccount,
  assetGroup: {
    ...creditAssetAccount.assetGroup,
    assetType: undefined as unknown as Asset['assetGroup']['assetType'],
  },
  name: '蚂蚁花呗',
};

let cleanup: (() => void) | undefined;
const originalCreateObjectUrl = URL.createObjectURL;
const originalRevokeObjectUrl = URL.revokeObjectURL;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreateObjectUrl });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevokeObjectUrl });
  vi.clearAllMocks();
});

function TestEditor({
  assetAccounts,
  onArchiveTag,
  onCancel = vi.fn(),
  onManageCategories,
  remarkHistory,
  isSaveSucceeded = false,
  withAssetAccount = false,
  withTags = false,
}: {
  assetAccounts?: Asset[];
  onArchiveTag?: (tagId: string) => Promise<void>;
  onCancel?: () => void;
  onManageCategories?: () => void;
  remarkHistory?: string[];
  isSaveSucceeded?: boolean;
  withAssetAccount?: boolean;
  withTags?: boolean;
}) {
  const resolvedAssetAccounts = assetAccounts ?? [assetAccount];
  const controller = useRecordEditorController({
    onSubmit: vi.fn(),
    seed: {
      recordType: 'sub',
      time: '2026-07-21T12:00:00.000Z',
    },
    supportsAssetLink: withAssetAccount,
    supportsTags: withTags,
  });

  return createElement(RecordEditorPresentation, {
    assetAccounts: withAssetAccount ? resolvedAssetAccounts : undefined,
    assetGroups: withAssetAccount
      ? resolvedAssetAccounts.map(asset => asset.assetGroup.parentId
          ? { ...asset.assetGroup, id: asset.assetGroup.parentId, level: 0, name: '储蓄卡', parentId: '' }
          : asset.assetGroup)
      : undefined,
    categories: [category],
    categoryState: 'ready',
    controller,
    isSaveSucceeded,
    onArchiveTag,
    onCancel,
    onManageCategories,
    remarkHistory,
    tags: withTags ? [{ id: 'tag-a', name: '聚餐' }] : [],
  });
}

describe('record editor presentation', () => {
  it('uses the shared empty state when no bookkeeping categories exist', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    function EmptyEditor() {
      return createElement(RecordEditorPresentation, {
        categories: [],
        categoryState: 'ready',
        controller: useRecordEditorController({
          onSubmit: vi.fn(),
          seed: { recordType: 'sub', time: '2026-07-21T12:00:00.000Z' },
        }),
        onCancel: vi.fn(),
      });
    }

    act(() => root.render(createElement(EmptyEditor)));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-testid="record-editor-empty-state"]')).not.toBeNull();
    expect(container.textContent).toContain('record:bookkeeping.emptyCategoryTitle');
  });

  it('disables saving when a previously selected category is no longer available', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    function HiddenCategoryEditor() {
      return createElement(RecordEditorPresentation, {
        categories: [],
        categoryState: 'ready',
        controller: useRecordEditorController({
          onSubmit: vi.fn(),
          seed: { category, recordType: 'sub', time: '2026-07-21T12:00:00.000Z' },
        }),
        onCancel: vi.fn(),
      });
    }

    act(() => root.render(createElement(HiddenCategoryEditor)));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector<HTMLButtonElement>('[data-record-editor-submit]')?.disabled).toBe(true);
    expect(container.querySelector('[data-record-editor-keypad]')).not.toBeNull();
    expect(container.querySelector('.record-editor-amount-caption')?.textContent).not.toContain(category.name);
  });

  it('keeps category selection and the amount keypad on one screen', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor)));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[data-record-editor-presentation]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-keypad]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-categories]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-presentation]')?.getAttribute('data-record-editor-stage')).toBeNull();
    expect(container.querySelector('[data-record-editor-category-grid]')?.classList).toContain('grid-cols-5');

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());

    expect(container.querySelector('[data-record-editor-keypad]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-amount]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-categories]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-action-strip]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-entry-row] [data-record-editor-note]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-entry-row] [data-record-editor-total]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-location-trigger]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-total]')?.classList).toContain('text-[34px]');
    const backspace = container.querySelector<HTMLButtonElement>('[aria-label="record:bookkeeping.backspace"]');
    expect(backspace?.textContent).toContain('record:bookkeeping.backspace');
    expect(backspace?.querySelector('svg')).not.toBeNull();
  });

  it('expands a parent inline and selects either its direct entry or a child without hiding the keypad', () => {
    const child = { ...category, id: 11, name: '奶茶', parentId: category.id, path: '餐饮 / 奶茶', sortOrder: 1 };
    const leaf = { ...category, id: 2, name: '交通', sortOrder: 2 };
    const container = document.createElement('div');
    const root = createRoot(container);

    function HierarchyEditor() {
      const controller = useRecordEditorController({
        onSubmit: vi.fn(),
        seed: { recordType: 'sub', time: '2026-07-21T12:00:00.000Z' },
      });
      return createElement(RecordEditorPresentation, {
        categories: [category, child, leaf],
        categoryState: 'ready',
        controller,
        onCancel: vi.fn(),
      });
    }

    act(() => root.render(createElement(HierarchyEditor)));
    cleanup = () => act(() => root.unmount());

    const submit = container.querySelector<HTMLButtonElement>('[data-record-editor-submit]');
    const parent = container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]');
    expect(submit?.disabled).toBe(true);
    expect(parent?.getAttribute('aria-label')).toContain('record:bookkeeping.categoryWithChildren');
    expect(parent?.getAttribute('aria-label')).toContain('1');

    act(() => parent?.click());
    expect(parent?.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('#record-editor-subcategories-1')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-keypad]')).not.toBeNull();

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="11"]')?.click());
    expect(parent?.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('#record-editor-subcategories-1')).toBeNull();
    expect(container.querySelector('[data-record-editor-amount]')?.textContent).toContain('餐饮 / 奶茶');
    expect(submit?.disabled).toBe(false);
    expect(parent?.querySelector('[data-record-editor-category-check]')).not.toBeNull();

    act(() => parent?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category-direct="1"]')?.click());
    expect(container.querySelector('[data-record-editor-amount]')?.textContent).toContain('餐饮');
    expect(container.querySelector('#record-editor-subcategories-1')).toBeNull();
  });

  it('shows only the selected date while keeping second-level time selection', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor)));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());

    const trigger = container.querySelector<HTMLButtonElement>('[data-record-editor-date-trigger]');
    expect(trigger?.textContent).toContain(dayjs('2026-07-21T12:00:00.000Z').format('YYYY/MM/DD'));
    expect(trigger?.textContent).not.toContain('12:00:00');
    expect(container.querySelector('[data-testid="record-editor-date-picker"]')?.getAttribute('data-precision')).toBe('second');
    expect([...container.querySelectorAll('[data-date-picker-label]')].map(label => label.textContent)).toEqual([
      '2026',
      '08',
      '09',
      '07',
      '08',
      '09',
    ]);
  });

  it('shows a semantic success confirmation after a completed save', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, { isSaveSucceeded: true })));
    cleanup = () => act(() => root.unmount());

    expect(container.querySelector('[role="status"]')?.textContent).toContain('record:bookkeeping.saveSuccess');
  });

  it('renders category settings in the header without taking category-grid space', () => {
    const onManageCategories = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, { onManageCategories })));
    cleanup = () => act(() => root.unmount());

    const items = container.querySelectorAll('[data-record-editor-categories] button');
    const settings = container.querySelector<HTMLButtonElement>('[data-record-editor-category-settings]');

    expect(items).toHaveLength(1);
    expect(container.querySelector('[data-record-editor-header]')?.contains(settings ?? null)).toBe(true);
    expect(container.querySelector('[data-record-editor-categories]')?.contains(settings ?? null)).toBe(false);
    expect(settings?.getAttribute('aria-label')).toBe('record:bookkeeping.categorySettings');

    act(() => settings?.click());
    expect(onManageCategories).toHaveBeenCalledOnce();
  });

  it('keeps tags and location in the scrollable strip without disturbing the amount row', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, { withTags: true })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());

    const strip = container.querySelector('[data-record-editor-action-strip]');
    expect(strip?.classList).toContain('overflow-x-auto');
    expect(strip?.querySelector('[data-record-editor-tag-trigger]')).not.toBeNull();
    expect(strip?.querySelector('[data-record-editor-location-trigger]')).not.toBeNull();
    expect(strip?.querySelector('[data-record-editor-date-trigger]')).not.toBeNull();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input[type="date"]')).toBeNull();

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-numeric-keys] button')?.click());
    const amountBefore = container.querySelector('[data-record-editor-total]')?.textContent;

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-tag-trigger]')?.click());
    const tag = [...document.body.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '聚餐');
    act(() => tag?.click());

    expect(tag?.getAttribute('aria-pressed')).toBe('true');
    expect(tag?.classList).toContain('bg-primary');
    expect(tag?.classList).not.toContain('bg-white');
    expect(document.body.querySelector('[data-record-editor-selected-tags]')).not.toBeNull();

    act(() => document.body.querySelector<HTMLButtonElement>('[aria-label="移除标签 聚餐"]')?.click());

    expect(document.body.querySelector('[data-record-editor-selected-tags]')).toBeNull();
    expect(tag?.getAttribute('aria-pressed')).toBe('false');
    expect(container.querySelector('[data-record-editor-total]')?.textContent).toBe(amountBefore);
    expect(container.querySelector('[data-record-editor-keypad]')).not.toBeNull();
  });

  it('archives a tag from the picker and removes it from the current draft', async () => {
    const onArchiveTag = vi.fn().mockResolvedValue(undefined);
    vi.mocked(confirmDangerousAction).mockResolvedValue(true);
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, { onArchiveTag, withTags: true })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-tag-trigger]')?.click());
    const tag = [...document.body.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '聚餐');
    act(() => tag?.click());

    await act(async () => {
      document.body.querySelector<HTMLButtonElement>('[data-record-editor-tag-delete="tag-a"]')?.click();
      await Promise.resolve();
    });

    expect(confirmDangerousAction).toHaveBeenCalledOnce();
    expect(onArchiveTag).toHaveBeenCalledWith('tag-a');
    expect(document.body.querySelector('[data-record-editor-selected-tags]')).toBeNull();
  });

  it('leaves the editor from the back button while keeping categories visible after selection', () => {
    const onCancel = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, { onCancel })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    expect(container.querySelector('[data-record-editor-categories]')).not.toBeNull();
    expect(container.querySelector('[data-record-editor-amount]')?.textContent).toContain('餐饮');
    expect(container.querySelector('[data-record-editor-category="1"] svg')).not.toBeNull();
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-cancel]')?.click());
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('shows all current-category history for empty input and filters it by entered content', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, { remarkHistory: ['便利店', '午餐'] })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    const input = container.querySelector<HTMLInputElement>('[data-record-editor-note] input')!;
    expect(container.querySelector('[data-record-editor-remark-history]')).toBeNull();

    act(() => input.dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
    expect(container.querySelector('[data-record-editor-remark-history]')?.textContent).toContain('便利店');
    expect(container.querySelector('[data-record-editor-remark-history]')?.textContent).toContain('午餐');

    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    act(() => {
      setValue?.call(input, '便利');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(container.querySelector('[data-record-editor-remark-history]')?.textContent).toContain('便利店');
    expect(container.querySelector('[data-record-editor-remark-history]')?.textContent).not.toContain('午餐');

    act(() => {
      setValue?.call(input, '午');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-remark-history-item="午餐"]')?.click());
    expect(input.value).toBe('午餐');
  });

  it('shows the authenticated thumbnail in edit mode and opens a full-screen preview', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn()
        .mockReturnValueOnce('blob:thumbnail')
        .mockReturnValueOnce('blob:content'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    vi.mocked(getRecordAttachmentContentApi)
      .mockResolvedValueOnce(new Blob(['thumbnail']))
      .mockResolvedValueOnce(new Blob(['content']));
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    function ExistingImageEditor() {
      return createElement(RecordEditorPresentation, {
        categories: [category],
        categoryState: 'ready',
        controller: useRecordEditorController({
          onSubmit: vi.fn(),
          seed: {
            attachment: {
              byteSize: 12,
              contentHash: 'hash',
              createdAt: '',
              height: 1,
              id: 'attachment-1',
              mimeType: 'image/webp',
              sortOrder: 0,
              type: 'IMAGE',
              width: 1,
            },
            category,
            recordType: 'sub',
            time: '2026-07-21T12:00:00.000Z',
          },
        }),
        onCancel: vi.fn(),
      });
    }

    await act(async () => root.render(createElement(ExistingImageEditor)));
    cleanup = () => {
      act(() => root.unmount());
      container.remove();
    };

    expect(getRecordAttachmentContentApi).toHaveBeenCalledWith('attachment-1', 'thumbnail');
    expect(container.querySelector<HTMLImageElement>('[data-record-editor-image-preview] img')?.src).toBe('blob:thumbnail');

    await act(async () => container.querySelector<HTMLButtonElement>('[data-record-editor-image-preview]')?.click());

    expect(getRecordAttachmentContentApi).toHaveBeenLastCalledWith('attachment-1', 'content');
    expect(document.body.querySelector('[data-testid="interactive-image-preview"] img')?.getAttribute('src')).toBe('blob:content');
  });

  it('keeps the compact amount row and keypad mounted together', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor)));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());

    expect(container.querySelector('[data-record-editor-entry-row]')?.classList).toContain('h-[62px]');
    expect(container.querySelector('[data-record-editor-total]')?.classList).toContain('whitespace-nowrap');
    expect(container.querySelector('[data-record-editor-keypad]')?.classList).toContain('record-editor-keypad');
  });

  it('uses a quiet outline and checkmark for the selected linked account', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, { withAssetAccount: true })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-asset-trigger]')?.click());

    const noAccountOption = document.body.querySelector<HTMLButtonElement>('[data-record-editor-asset-option="none"]');
    expect(noAccountOption?.classList).toContain('border-primary');
    expect(noAccountOption?.classList).not.toContain('bg-primary-light/45');
    expect(noAccountOption?.querySelector('svg.lucide-check')).not.toBeNull();

    act(() => document.body.querySelector<HTMLButtonElement>('[data-record-editor-asset-option="asset-account"]')?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-asset-trigger]')?.click());

    const assetOption = document.body.querySelector<HTMLButtonElement>('[data-record-editor-asset-option="asset-account"]');
    expect(assetOption?.getAttribute('aria-pressed')).toBe('true');
    expect(assetOption?.classList).toContain('border-primary');
    expect(assetOption?.querySelector('svg.lucide-check')).not.toBeNull();
    expect(assetOption?.textContent).toContain('储蓄卡');
    expect(assetOption?.textContent).toContain('日常支出卡');
    expect(assetOption?.textContent).toContain('record:bookkeeping.linkedAssetBalance 50000');
    expect(container.querySelector('[data-record-editor-asset-trigger]')?.textContent).toContain('日常支出卡');
    expect(container.querySelector('[data-record-editor-asset-trigger]')?.classList).toContain('record-editor-chip--selected');
  });

  it('shows available credit and debt instead of a current balance for credit cards', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, {
      assetAccounts: [creditAssetAccount],
      withAssetAccount: true,
    })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-asset-trigger]')?.click());
    act(() => document.body.querySelector<HTMLButtonElement>('[data-record-editor-asset-option="asset-account"]')?.click());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-asset-trigger]')?.click());
    const option = document.body.querySelector('[data-record-editor-asset-option="asset-account"]');
    expect(option?.textContent).toContain('record:bookkeeping.linkedAssetAvailableCreditLimit 70000');
    expect(option?.textContent).toContain('record:bookkeeping.linkedAssetDebt 50000');
    expect(option?.textContent).not.toContain('record:bookkeeping.linkedAssetBalance');
  });

  it('uses the credit limit when a credit asset group omits its asset type', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(TestEditor, {
      assetAccounts: [creditAssetWithoutType],
      withAssetAccount: true,
    })));
    cleanup = () => act(() => root.unmount());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-category="1"]')?.click());
    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-asset-trigger]')?.click());
    act(() => document.body.querySelector<HTMLButtonElement>('[data-record-editor-asset-option="asset-account"]')?.click());

    act(() => container.querySelector<HTMLButtonElement>('[data-record-editor-asset-trigger]')?.click());
    const option = document.body.querySelector('[data-record-editor-asset-option="asset-account"]');
    expect(option?.textContent).toContain('record:bookkeeping.linkedAssetAvailableCreditLimit 70000');
    expect(option?.textContent).toContain('record:bookkeeping.linkedAssetDebt 50000');
    expect(option?.textContent).not.toContain('record:bookkeeping.linkedAssetBalance');
  });
});

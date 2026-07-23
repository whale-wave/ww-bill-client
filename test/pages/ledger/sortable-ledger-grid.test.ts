import type { ReactNode } from 'react';
import type { LedgerListItem } from '@/entities/ledger';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LedgerKind, LedgerRole, LedgerStatus } from '@/entities/ledger';
import { SortableLedgerGrid } from '@/pages/ledger-center/ui/SortableLedgerGrid';

interface DragDescriptor {
  id: string;
}

interface DndContextProps {
  children?: ReactNode;
  onDragCancel?: () => void;
  onDragEnd?: (event: {
    active: DragDescriptor;
    over: DragDescriptor | null;
  }) => void;
  onDragStart?: (event: { active: DragDescriptor }) => void;
}

const dndHarness = vi.hoisted(() => ({
  contextProps: undefined as DndContextProps | undefined,
  keyboardOptions: undefined as Record<string, unknown> | undefined,
  pointerOptions: undefined as Record<string, unknown> | undefined,
}));

vi.mock('@dnd-kit/core', async () => {
  const { createElement } = await import('react');
  const KeyboardSensor = function KeyboardSensor() {};
  const PointerSensor = function PointerSensor() {};

  return {
    closestCenter: vi.fn(),
    DndContext: (props: DndContextProps) => {
      dndHarness.contextProps = props;
      return createElement(
        'div',
        {
          'data-testid': 'dnd-context',
          'onKeyDown': (event: KeyboardEvent) => {
            if (event.key === 'Escape')
              props.onDragCancel?.();
          },
        },
        props.children,
      );
    },
    DragOverlay: ({ children }: { children?: ReactNode }) => createElement(
      'div',
      { 'data-testid': 'drag-overlay' },
      children,
    ),
    KeyboardSensor,
    PointerSensor,
    useSensor: (sensor: unknown, options: Record<string, unknown>) => {
      if (sensor === KeyboardSensor)
        dndHarness.keyboardOptions = options;
      if (sensor === PointerSensor)
        dndHarness.pointerOptions = options;
      return { options, sensor };
    },
    useSensors: (...sensors: unknown[]) => sensors,
  };
});

vi.mock('@dnd-kit/sortable', async () => {
  const { createElement } = await import('react');
  return {
    arrayMove: <T>(items: T[], oldIndex: number, newIndex: number) => {
      const next = [...items];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    },
    rectSortingStrategy: vi.fn(),
    sortableKeyboardCoordinates: vi.fn(),
    SortableContext: ({ children }: { children?: ReactNode }) => createElement(
      'div',
      { 'data-testid': 'sortable-context' },
      children,
    ),
    useSortable: ({ id }: { id: string }) => ({
      attributes: {
        'aria-describedby': `sortable-${id}`,
        'aria-roledescription': 'sortable',
        'role': 'button',
        'tabIndex': 0,
      },
      isDragging: false,
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: undefined,
    }),
  };
});

function ledger(id: string, name: string, sortOrder: number): LedgerListItem {
  return {
    activeMemberCount: 1,
    capabilities: [],
    createdAt: '2026-07-21T00:00:00.000Z',
    createdByUserId: 1,
    iconKey: 'custom',
    id,
    kind: LedgerKind.CUSTOM,
    monthStartDay: 1,
    myMembership: {
      id: `membership/${id}`,
      sortOrder,
      version: sortOrder + 1,
    },
    myRole: LedgerRole.OWNER,
    name,
    ownerUserId: 1,
    recordCount: 0,
    status: LedgerStatus.ACTIVE,
    templateKey: 'custom',
    templateVersion: 1,
    themeKey: 'cyan',
    updatedAt: '2026-07-21T00:00:00.000Z',
    version: 1,
  };
}

const ledgers = [
  ledger('ledger/a', '账本 A', 0),
  ledger('ledger/b', '账本 B', 1),
  ledger('ledger/c', '账本 C', 2),
];

let cleanup: (() => void) | undefined;

function renderGrid(onOrderChange = vi.fn()) {
  const container = document.createElement('div');
  const root = createRoot(container);
  act(() => root.render(createElement(SortableLedgerGrid, {
    ledgers,
    onOrderChange,
    onRemove: vi.fn(),
  })));
  cleanup = () => act(() => root.unmount());
  return { container, onOrderChange };
}

describe('sortable ledger grid dnd authority', () => {
  beforeEach(() => {
    dndHarness.contextProps = undefined;
    dndHarness.keyboardOptions = undefined;
    dndHarness.pointerOptions = undefined;
  });

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  it('uses the delayed pointer sensor and keyboard coordinate getter', async () => {
    const { sortableKeyboardCoordinates } = await import('@dnd-kit/sortable');
    renderGrid();

    expect(dndHarness.pointerOptions).toEqual({
      activationConstraint: { delay: 240, tolerance: 8 },
    });
    expect(dndHarness.keyboardOptions).toEqual({
      coordinateGetter: sortableKeyboardCoordinates,
    });
  });

  it('changes the draft only from dragEnd for keyboard and pointer drags', () => {
    const { container, onOrderChange } = renderGrid();
    act(() => dndHarness.contextProps?.onDragStart?.({ active: { id: 'ledger/a' } }));

    const firstItem = container.querySelector<HTMLElement>('.ledger-sortable-item');
    act(() => firstItem?.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      code: 'ArrowRight',
      key: 'ArrowRight',
    })));
    expect(onOrderChange).not.toHaveBeenCalled();

    act(() => dndHarness.contextProps?.onDragEnd?.({
      active: { id: 'ledger/a' },
      over: { id: 'ledger/b' },
    }));
    expect(onOrderChange).toHaveBeenCalledOnce();
    expect(onOrderChange.mock.calls[0]?.[0].map((item: LedgerListItem) => item.id))
      .toEqual(['ledger/b', 'ledger/a', 'ledger/c']);
  });

  it('leaves the draft unchanged when Escape cancels keyboard dragging', () => {
    const { container, onOrderChange } = renderGrid();
    act(() => dndHarness.contextProps?.onDragStart?.({ active: { id: 'ledger/a' } }));

    const firstItem = container.querySelector<HTMLElement>('.ledger-sortable-item');
    act(() => firstItem?.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      code: 'ArrowRight',
      key: 'ArrowRight',
    })));
    act(() => firstItem?.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      code: 'Escape',
      key: 'Escape',
    })));

    expect(onOrderChange).not.toHaveBeenCalled();
  });

  it('keeps the drag overlay outside the accessibility tree and tab order', () => {
    const { container } = renderGrid();
    act(() => dndHarness.contextProps?.onDragStart?.({ active: { id: 'ledger/a' } }));

    const overlayCard = container.querySelector<HTMLButtonElement>(
      '[data-testid="drag-overlay"] .ledger-cover-card',
    );
    expect(overlayCard?.getAttribute('aria-hidden')).toBe('true');
    expect(overlayCard?.tabIndex).toBe(-1);
  });
});

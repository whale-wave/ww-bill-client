import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { CSSProperties } from 'react';
import type { LedgerListItem } from '@/entities/ledger';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grid } from 'antd-mobile';
import { useMemo, useState } from 'react';
import {
  LedgerCoverCard,
  LedgerRole,
  LedgerStatus,
} from '@/entities/ledger';
import { useTranslation } from '@/shared/i18n';
import { RemoveLedgerBadge } from './RemoveLedgerBadge';

interface SortableLedgerGridProps {
  ledgers: readonly LedgerListItem[];
  onOrderChange: (ledgers: LedgerListItem[]) => void;
  onRemove: (ledger: LedgerListItem) => void;
}

interface SortableLedgerItemProps {
  ledger: LedgerListItem;
  onRemove: (ledger: LedgerListItem) => void;
}

function SortableLedgerItem({
  ledger,
  onRemove,
}: SortableLedgerItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: ledger.id });
  const style: CSSProperties = {
    opacity: isDragging ? 0.25 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Grid.Item>
      <div
        className="ledger-sortable-item"
        ref={setNodeRef}
        role="listitem"
        style={style}
      >
        <LedgerCoverCard
          interactionProps={{ ...attributes, ...listeners }}
          isDragging={isDragging}
          ledger={ledger}
          sorting
        />
        <RemoveLedgerBadge
          action={ledger.myRole === LedgerRole.OWNER ? 'archive' : 'leave'}
          disabled={ledger.status === LedgerStatus.SUSPENDED}
          ledgerName={ledger.name}
          onClick={() => onRemove(ledger)}
        />
      </div>
    </Grid.Item>
  );
}

export function SortableLedgerGrid({
  ledgers,
  onOrderChange,
  onRemove,
}: SortableLedgerGridProps) {
  const { t } = useTranslation('ledger');
  const [activeId, setActiveId] = useState<string>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 240, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const ids = useMemo(() => ledgers.map(ledger => ledger.id), [ledgers]);
  const ledgerById = useMemo(
    () => new Map(ledgers.map(ledger => [ledger.id, ledger])),
    [ledgers],
  );
  const activeLedger = activeId ? ledgerById.get(activeId) : undefined;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(undefined);
    if (!over || active.id === over.id)
      return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex >= 0 && newIndex >= 0)
      onOrderChange(arrayMove([...ledgers], oldIndex, newIndex));
  };

  return (
    <DndContext
      accessibility={{
        announcements: {
          onDragCancel: ({ active }) => t('center.dragCancelled', {
            name: ledgerById.get(String(active.id))?.name ?? t('center.ledgerFallback'),
          }),
          onDragEnd: ({ active, over }) => over
            ? t('center.dragMoved', {
                name: ledgerById.get(String(active.id))?.name ?? t('center.ledgerFallback'),
                position: ids.indexOf(String(over.id)) + 1,
              })
            : t('center.dragUnchanged'),
          onDragOver: ({ over }) => over
            ? t('center.dragOver', { position: ids.indexOf(String(over.id)) + 1 })
            : undefined,
          onDragStart: ({ active }) => t('center.dragStarted', {
            name: ledgerById.get(String(active.id))?.name ?? t('center.ledgerFallback'),
          }),
        },
        screenReaderInstructions: {
          draggable: t('center.dragInstructions'),
        },
      }}
      collisionDetection={closestCenter}
      onDragCancel={() => setActiveId(undefined)}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div
          aria-label={t('center.sortGrid')}
          className="ledger-management-grid"
          data-columns="2"
          data-sort-mode="true"
          data-testid="ledger-management-grid"
          role="list"
        >
          <Grid columns={2} gap={[14, 16]}>
            {ledgers.map(ledger => (
              <SortableLedgerItem
                key={ledger.id}
                ledger={ledger}
                onRemove={onRemove}
              />
            ))}
          </Grid>
        </div>
      </SortableContext>
      <DragOverlay>
        {activeLedger
          ? (
              <LedgerCoverCard
                interactionProps={{ 'aria-hidden': true, 'tabIndex': -1 }}
                isDragging
                ledger={activeLedger}
                sorting
              />
            )
          : null}
      </DragOverlay>
    </DndContext>
  );
}

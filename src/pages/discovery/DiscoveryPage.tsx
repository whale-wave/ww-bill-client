import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { CSSProperties, FC, ReactNode } from 'react';
import type { DiscoveryCardId } from '@/entities/user-app-config';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Toast } from 'antd-mobile';
import { EyeOff, GripVertical, LayoutPanelTop } from 'lucide-react';
import { m } from 'motion/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetManagerCard } from '@/entities/asset';
import { CurrentMonthBillCard } from '@/entities/bill';
import { CurMonthBudgetCard } from '@/entities/budget';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { useGetUserAppConfigQuery, usePatchUserAppConfigMutation } from '@/entities/user-app-config';
import { normalizeDiscoveryCardOrder, normalizeVisibleDiscoveryCards } from '@/pages/discovery/model/discovery-cards';
import { CommonFunctionCard, DiscoveryCardManager } from '@/pages/discovery/ui';
import { useTranslation } from '@/shared/i18n';
import { hapticFeedback } from '@/shared/lib/haptic-feedback';
import { playSound } from '@/shared/lib/play-sound';
import { useMotionPreference } from '@/shared/ui';
import { TabBar } from '@/widgets/layout';

interface DiscoveryCardPreference {
  order: DiscoveryCardId[];
  visibleCards: DiscoveryCardId[];
}

interface SortableDiscoveryCardProps {
  cardId: DiscoveryCardId;
  children: ReactNode;
  editing: boolean;
  dragLabel: string;
  isMotionEnabled: boolean;
  onHide: (cardId: DiscoveryCardId) => void;
  hideLabel: string;
}

const SortableDiscoveryCard: FC<SortableDiscoveryCardProps> = ({ cardId, children, dragLabel, editing, hideLabel, isMotionEnabled, onHide }) => {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: cardId });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isMotionEnabled ? transition : undefined,
    zIndex: isDragging ? 2 : undefined,
  };

  return (
    <div
      className={isDragging ? 'relative opacity-40' : 'relative'}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!editing ? listeners : {})}
    >
      <m.div
        animate={editing && !isDragging && isMotionEnabled ? { scale: 0.985, y: 0 } : { scale: 1, y: 0 }}
        className="relative"
        initial={editing && isMotionEnabled ? { scale: 1.025, y: 4 } : false}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
        {editing && (
          <div className="pointer-events-none absolute inset-0 z-10 rounded-[20px] border border-solid border-primary/50 bg-primary-light/10">
            <button
              aria-label={dragLabel}
              className="pointer-events-auto absolute right-[58px] top-3 flex h-11 w-11 touch-none items-center justify-center rounded-full border border-solid border-border-primary bg-white/95 p-0 text-primary-deep shadow-ww-xs transition active:scale-95"
              ref={setActivatorNodeRef}
              onClick={event => event.preventDefault()}
              type="button"
              {...listeners}
            >
              <GripVertical size={19} />
            </button>
            <button
              aria-label={hideLabel}
              className="pointer-events-auto absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/95 p-0 text-ww-mid shadow-ww-xs transition active:scale-95"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onHide(cardId);
              }}
              onPointerDown={event => event.stopPropagation()}
              type="button"
            >
              <EyeOff size={17} />
            </button>
          </div>
        )}
      </m.div>
    </div>
  );
};

const Discovery: FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { data: userInfo } = useGetUserUserInfoQuery();
  const { data: config } = useGetUserAppConfigQuery();
  const [patchConfig, patchMutation] = usePatchUserAppConfigMutation();
  const { isMotionEnabled } = useMotionPreference();
  const [isEditing, setIsEditing] = useState(false);
  const [isManagerVisible, setIsManagerVisible] = useState(false);
  const [localPreference, setLocalPreference] = useState<DiscoveryCardPreference>();

  const preference = useMemo<DiscoveryCardPreference>(() => {
    if (localPreference)
      return localPreference;
    const order = normalizeDiscoveryCardOrder(config?.discoveryCardOrder);
    return {
      order,
      visibleCards: normalizeVisibleDiscoveryCards(config?.visibleDiscoveryCards, order),
    };
  }, [config?.discoveryCardOrder, config?.visibleDiscoveryCards, localPreference]);
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { delay: 360, tolerance: 8 },
  }));
  const cardLabels: Record<DiscoveryCardId, string> = {
    asset: t('discoveryCards.asset'),
    bill: t('discoveryCards.bill'),
    budget: t('discoveryCards.budget'),
  };

  const savePreference = async (nextPreference: DiscoveryCardPreference) => {
    setLocalPreference(nextPreference);
    try {
      await patchConfig({
        discoveryCardOrder: nextPreference.order,
        visibleDiscoveryCards: nextPreference.visibleCards,
      });
      setLocalPreference(undefined);
    }
    catch {
      setLocalPreference(undefined);
      Toast.show({ content: t('discoveryCards.saveFailed'), icon: 'fail' });
    }
  };

  const handleBillClick = () => {
    playSound.turnPage();
    navigate('/bill');
  };

  const handleDragStart = (_event: DragStartEvent) => {
    setIsEditing(true);
    hapticFeedback.impact();
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id)
      return;
    const oldIndex = preference.order.indexOf(String(active.id) as DiscoveryCardId);
    const newIndex = preference.order.indexOf(String(over.id) as DiscoveryCardId);
    if (oldIndex < 0 || newIndex < 0)
      return;
    void savePreference({ ...preference, order: arrayMove(preference.order, oldIndex, newIndex) });
  };

  const handleVisibleChange = (cardId: DiscoveryCardId, visible: boolean) => {
    if (!visible && preference.visibleCards.length === 1)
      return;
    const visibleCards = visible
      ? preference.order.filter(id => id === cardId || preference.visibleCards.includes(id))
      : preference.visibleCards.filter(id => id !== cardId);
    void savePreference({ ...preference, visibleCards });
  };

  const visibleCards = preference.order.filter(cardId => preference.visibleCards.includes(cardId));
  const cards: Record<DiscoveryCardId, ReactNode> = {
    asset: <AssetManagerCard />,
    bill: <CurrentMonthBillCard billRecord={userInfo?.billRecord} onClick={handleBillClick} />,
    budget: <CurMonthBudgetCard />,
  };

  return (
    <div className="page-new fixed left-0 top-0 w-full">
      <header className="flex h-[60px] shrink-0 items-center justify-between gap-3 px-[22px] pb-4 pt-[max(8px,env(safe-area-inset-top))]">
        <h1 className="text-[20px] font-extrabold leading-[30px] text-ww-ink">{t('commonFunctions.discovery')}</h1>
        {isEditing && <button className="h-9 rounded-[13px] border-0 bg-primary-light/70 px-3 text-[13px] font-extrabold text-primary-deep transition active:scale-95" onClick={() => setIsEditing(false)} type="button">{t('discoveryCards.done')}</button>}
      </header>
      <div className="ww-tab-bar-scroll-padding relative flex-grow overflow-auto">
        <div className="space-y-[14px] px-[18px]">
          {isEditing && (
            <m.div animate={isMotionEnabled ? { opacity: 1, y: 0 } : undefined} className="flex items-center gap-3 rounded-[18px] border border-solid border-border-primary bg-ww-surface px-4 py-3 shadow-ww-xs" initial={isMotionEnabled ? { opacity: 0, y: -8 } : false}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-primary-light text-primary-deep"><LayoutPanelTop size={18} /></span>
              <p className="min-w-0 flex-1 text-[12px] font-semibold leading-5 text-ww-mid">{t('discoveryCards.dragHint')}</p>
              <button className="h-10 shrink-0 rounded-[13px] border-0 bg-primary px-3 text-[12px] font-extrabold text-white shadow-ww-xs transition active:scale-95" onClick={() => setIsManagerVisible(true)} type="button">{t('discoveryCards.manage')}</button>
            </m.div>
          )}
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
            <SortableContext items={visibleCards} strategy={verticalListSortingStrategy}>
              {visibleCards.map(cardId => (
                <SortableDiscoveryCard key={cardId} cardId={cardId} dragLabel={t('discoveryCards.drag')} editing={isEditing} hideLabel={t('discoveryCards.hide')} isMotionEnabled={isMotionEnabled} onHide={() => handleVisibleChange(cardId, false)}>
                  {cards[cardId]}
                </SortableDiscoveryCard>
              ))}
            </SortableContext>
          </DndContext>
          <CommonFunctionCard />
        </div>
      </div>
      <DiscoveryCardManager
        cardLabels={cardLabels}
        copy={{ close: t('nav.close'), description: t('discoveryCards.managerDescription'), minimumHint: t('discoveryCards.minimumHint'), title: t('discoveryCards.managerTitle') }}
        isSaving={patchMutation.isLoading}
        order={preference.order}
        visible={isManagerVisible}
        visibleCards={preference.visibleCards}
        onClose={() => setIsManagerVisible(false)}
        onVisibleChange={handleVisibleChange}
      />
      <TabBar active={3} />
    </div>
  );
};

export default Discovery;

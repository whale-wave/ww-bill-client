import type { FC } from 'react';
import type { DiscoveryCardId } from '@/entities/user-app-config';
import { Switch } from 'antd-mobile';
import { Eye, EyeOff, LayoutPanelTop } from 'lucide-react';
import { AppBottomSheet, SheetHeader } from '@/shared/ui';

export interface DiscoveryCardManagerCopy {
  close: string;
  description: string;
  minimumHint: string;
  title: string;
}

interface DiscoveryCardManagerProps {
  cardLabels: Record<DiscoveryCardId, string>;
  copy: DiscoveryCardManagerCopy;
  isSaving: boolean;
  onClose: () => void;
  onVisibleChange: (cardId: DiscoveryCardId, visible: boolean) => void;
  order: readonly DiscoveryCardId[];
  visible: boolean;
  visibleCards: readonly DiscoveryCardId[];
}

export const DiscoveryCardManager: FC<DiscoveryCardManagerProps> = ({
  cardLabels,
  copy,
  isSaving,
  onClose,
  onVisibleChange,
  order,
  visible,
  visibleCards,
}) => {
  const isOnlyVisibleCard = visibleCards.length === 1;

  return (
    <AppBottomSheet
      destroyOnClose
      position="bottom"
      visible={visible}
      onClose={onClose}
      onMaskClick={onClose}
    >
      <div className="flex max-h-[70vh] flex-col">
        <SheetHeader
          closeLabel={copy.close}
          description={copy.description}
          icon={<LayoutPanelTop size={19} />}
          title={copy.title}
          onClose={onClose}
        />
        <div className="overflow-y-auto px-[18px] pb-[max(24px,env(safe-area-inset-bottom))] pt-3">
          <p className="mb-3 px-1 text-[12px] font-semibold leading-5 text-ww-mid">{copy.minimumHint}</p>
          <div className="overflow-hidden rounded-[20px] border border-solid border-border-primary bg-ww-surface shadow-ww-xs">
            {order.map((cardId) => {
              const isVisible = visibleCards.includes(cardId);
              const isDisabled = isSaving || (isVisible && isOnlyVisibleCard);

              return (
                <div
                  key={cardId}
                  className="flex min-h-14 items-center gap-3 border-0 border-b border-solid border-border-primary px-4 last:border-b-0"
                >
                  <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-ww-ink">{cardLabels[cardId]}</span>
                  <span aria-hidden className={isVisible ? 'text-primary-deep' : 'text-ww-soft'}>
                    {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </span>
                  <Switch
                    aria-label={cardLabels[cardId]}
                    checked={isVisible}
                    disabled={isDisabled}
                    onChange={checked => onVisibleChange(cardId, checked)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppBottomSheet>
  );
};

import type { FC } from 'react';
import { useTranslation } from '@/shared/i18n';
import Button from '../button';
import Mask from '../mask';

const classPrefix = 'bwm-share';

interface ItemProps {
  data: ItemData;
}

const Item: FC<ItemProps> = ({ data }) => {
  return (
    <div key={data.id} className={`${classPrefix}-opt`} onClick={data.onClick}>
      <div
        style={{
          height: 47,
          width: 47,
          borderRadius: '50%',
          backgroundColor: data.color ?? '#f6f6f6',
        }}
      />
      <span>{data.name}</span>
    </div>
  );
};

interface ShareProps {
  visible?: boolean;
  shares: ItemData[];
  onClose?: () => void;
  onStart?: () => void;
  onDelete?: () => void;
  onCopyUrl?: () => void;
}

const defaultProps = {
  visible: false,
};

export const Share: FC<ShareProps> = (p) => {
  const { t } = useTranslation('common');
  const props = { ...defaultProps, ...p };
  const { visible, onClose, onStart, onCopyUrl, onDelete, shares } = props;

  const opts = [
    {
      id: 1,
      name: t('share.collect'),
      onClick: onStart,
    },
    {
      id: 2,
      name: t('action.delete'),
      onClick: onDelete,
    },
    {
      id: 3,
      name: t('share.copyLink'),
      onClick: onCopyUrl,
    },
  ];

  return (
    <Mask visible={visible} onClick={onClose}>
      <div className={classPrefix} onClick={e => e.stopPropagation()}>
        <div className={`${classPrefix}-content`}>
          <div className={`${classPrefix}-shares`}>
            {shares?.map(i => (
              <Item key={i.name} data={i} />
            ))}
          </div>
          <div className={`${classPrefix}-opts`}>
            {opts.map(i => (
              <Item key={i.id} data={i} />
            ))}
          </div>
        </div>
        <Button className={`${classPrefix}-btn`} size="full" block onClick={onClose}>
          {t('nav.cancel')}
        </Button>
      </div>
    </Mask>
  );
};

interface ItemData {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  onClick?: () => void;
}

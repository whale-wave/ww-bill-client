import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useTranslation } from '@/shared/i18n';
import Mask from '../mask';

const classPrefix = 'bwm-modal';

interface ModalProps {
  visible?: boolean;
  title?: string;
  onClose?: () => void;
  onCancel?: () => void | true;
  onOk?: () => void;
  children?: React.ReactNode;
}

const defaultProps = {
  visible: false,
};

export const Modal: FC<ModalProps> = (p) => {
  const { t } = useTranslation('common');
  const props = { ...defaultProps, ...p };
  const { visible, onClose, children, title, onCancel, onOk } = props;
  const displayTitle = title === undefined || title === '标题' ? t('nav.title') : title;

  const onCancelClose = useCallback(() => {
    if (!onCancel && onClose)
      onClose();
    if (onCancel?.())
      onClose?.();
  }, [onClose, onCancel]);

  return (
    <Mask onClick={onClose} visible={visible}>
      <div className={classPrefix}>
        <div
          className={`${classPrefix}-content`}
          onClick={e => e.stopPropagation()}
        >
          <header>{displayTitle}</header>
          <main>{children}</main>
          <footer>
            <button className={`${classPrefix}-cancel`} onClick={onCancelClose}>
              {t('nav.cancel')}
            </button>
            <button className={`${classPrefix}-ok`} onClick={onOk}>
              {t('nav.confirm')}
            </button>
          </footer>
        </div>
      </div>
    </Mask>
  );
};

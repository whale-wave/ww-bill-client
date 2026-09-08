import type { ModalProps } from 'antd-mobile';
import { Modal } from 'antd-mobile';

export type AppModalProps = ModalProps;

export function AppModal({ bodyClassName = '', className = '', maskClassName = '', ...props }: AppModalProps) {
  return (
    <Modal
      bodyClassName={`ww-app-modal ${bodyClassName}`.trim()}
      className={`ww-app-modal-shell ${className}`.trim()}
      maskClassName={`ww-app-overlay-mask ${maskClassName}`.trim()}
      {...props}
    />
  );
}

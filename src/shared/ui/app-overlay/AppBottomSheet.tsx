import type { PopupProps } from 'antd-mobile';
import { Popup } from 'antd-mobile';
import './app-overlay.scss';

export function AppBottomSheet({ bodyClassName = '', ...props }: PopupProps) {
  return (
    <Popup
      bodyClassName={`ww-app-bottom-sheet ${bodyClassName}`.trim()}
      {...props}
    />
  );
}

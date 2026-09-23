import type { PopupProps } from 'antd-mobile';
import { Popup } from 'antd-mobile';
import './app-overlay.scss';

export interface AppSheetProps extends PopupProps {
  material?: 'default' | 'opaque';
}

export function AppSheet({ bodyClassName = '', closeOnMaskClick = true, maskClassName = '', material = 'default', position = 'bottom', ...props }: AppSheetProps) {
  return (
    <Popup
      bodyClassName={`ww-app-sheet ww-app-sheet--${position} ${material === 'opaque' ? 'ww-app-sheet--opaque' : ''} ${bodyClassName}`.trim()}
      closeOnMaskClick={closeOnMaskClick}
      maskClassName={`ww-app-overlay-mask ${maskClassName}`.trim()}
      position={position}
      {...props}
    />
  );
}

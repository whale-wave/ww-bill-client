import type { PopupProps } from 'antd-mobile';
import { Popup } from 'antd-mobile';
import './app-overlay.scss';

export type AppSheetProps = PopupProps;

export function AppSheet({ bodyClassName = '', maskClassName = '', position = 'bottom', ...props }: AppSheetProps) {
  return (
    <Popup
      bodyClassName={`ww-app-sheet ww-app-sheet--${position} ${bodyClassName}`.trim()}
      maskClassName={`ww-app-overlay-mask ${maskClassName}`.trim()}
      position={position}
      {...props}
    />
  );
}

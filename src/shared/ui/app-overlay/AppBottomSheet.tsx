import type { PopupProps } from 'antd-mobile';
import { Popup } from 'antd-mobile';
import './app-overlay.scss';

export type AppBottomSheetProps = PopupProps;

export function AppBottomSheet({ bodyClassName = '', maskClassName = '', ...props }: AppBottomSheetProps) {
  return (
    <Popup
      bodyClassName={`ww-app-bottom-sheet ${bodyClassName}`.trim()}
      maskClassName={`ww-app-overlay-mask ${maskClassName}`.trim()}
      {...props}
    />
  );
}

import type { PopupProps } from 'antd-mobile';
import { Popup } from 'antd-mobile';
import './app-overlay.scss';

export type AppBottomSheetProps = PopupProps;

export function AppBottomSheet({ bodyClassName = '', ...props }: AppBottomSheetProps) {
  return (
    <Popup
      bodyClassName={`ww-app-bottom-sheet ${bodyClassName}`.trim()}
      {...props}
    />
  );
}

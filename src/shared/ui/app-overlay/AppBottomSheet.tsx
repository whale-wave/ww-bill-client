import type { PopupProps } from 'antd-mobile';
import { Popup } from 'antd-mobile';
import './app-overlay.scss';

export interface AppBottomSheetProps extends PopupProps {
  closeIconAlign?: 'default' | 'heading';
}

export function AppBottomSheet({ bodyClassName = '', closeIconAlign = 'default', ...props }: AppBottomSheetProps) {
  const alignModifier = closeIconAlign === 'heading' ? ' ww-app-bottom-sheet--close-heading' : '';
  return (
    <Popup
      bodyClassName={`ww-app-bottom-sheet${alignModifier} ${bodyClassName}`.trim()}
      {...props}
    />
  );
}

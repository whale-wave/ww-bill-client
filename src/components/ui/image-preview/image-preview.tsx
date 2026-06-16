import type { FC } from 'react';
import React from 'react';
import Mask from '../mask';

const classPrefix = `bwm-image-preview`;

export interface ImagePreviewProps {
  image?: string;
  visible?: boolean;
  onClose?: () => void;
}

const defaultProps = {
  visible: false,
};

export const ImagePreview: FC<ImagePreviewProps> = (p) => {
  const props = Object.assign({}, defaultProps, p);
  const { visible, onClose, image } = props;

  return (
    <Mask opacity={1} onClick={onClose} visible={!!(image && visible)}>
      <div className={classPrefix}>
        <img className={`${classPrefix}-img`} src={image} alt={image} />
      </div>
    </Mask>
  );
};

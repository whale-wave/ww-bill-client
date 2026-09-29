import type { Area } from 'react-easy-crop';

const AVATAR_OUTPUT_SIZE = 512;

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, 0.92));
}

export async function createCroppedAvatarImage(
  image: HTMLImageElement,
  crop: Area,
): Promise<File> {
  const { naturalHeight, naturalWidth } = image;
  if (!naturalWidth || !naturalHeight || crop.width <= 0 || crop.height <= 0)
    throw new Error('Avatar image is not ready for cropping');

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;
  const context = canvas.getContext('2d');
  if (!context)
    throw new Error('Canvas is not available for avatar image cropping');

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE,
  );

  const blob = await canvasToBlob(canvas, 'image/webp')
    ?? await canvasToBlob(canvas, 'image/png');
  if (!blob)
    throw new Error('Avatar image could not be exported');

  const isWebp = blob.type === 'image/webp';
  return new File([blob], isWebp ? 'avatar.webp' : 'avatar.png', {
    type: isWebp ? 'image/webp' : 'image/png',
  });
}

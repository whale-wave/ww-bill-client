import type { RecordEntry } from '@/entities/record';
import { useCallback, useRef, useState } from 'react';

export const MAX_RECORD_IMAGES = 9;

type RecordAttachment = NonNullable<RecordEntry['attachments']>[number];

export interface PendingRecordEditorImage {
  assetId?: string;
  file: File;
  id: string;
}

export type RecordEditorImage
  = | { attachment: RecordAttachment; id: string; kind: 'existing' }
    | { assetId?: string; file: File; id: string; kind: 'new'; status: 'error' | 'ready' | 'uploading' };

interface RecordEditorImagesOptions {
  attachments?: RecordAttachment[];
  pendingImages?: PendingRecordEditorImage[];
  onUploadImage?: (file: File) => Promise<string>;
  initiallyDirty?: boolean;
}

export function useRecordEditorImages({
  attachments = [],
  pendingImages = [],
  onUploadImage,
  initiallyDirty = false,
}: RecordEditorImagesOptions) {
  const [images, setImages] = useState<RecordEditorImage[]>(() => [
    ...attachments.slice().sort((first, second) => first.sortOrder - second.sortOrder).map(attachment => ({
      attachment,
      id: attachment.id,
      kind: 'existing' as const,
    })),
    ...pendingImages.map(image => ({
      ...image,
      kind: 'new' as const,
      status: image.assetId ? 'ready' as const : 'error' as const,
    })),
  ]);
  const imagesRef = useRef(images);
  const nextImageIdRef = useRef(0);
  const [isImageSelectionDirty, setIsImageSelectionDirty] = useState(initiallyDirty);
  const imageSelectionDirtyRef = useRef(initiallyDirty);
  const inFlightUploadsRef = useRef(new Set<Promise<void>>());

  const commitImages = useCallback((nextImages: RecordEditorImage[]) => {
    imagesRef.current = nextImages;
    setImages(nextImages);
  }, []);

  const uploadImage = useCallback((image: Extract<RecordEditorImage, { kind: 'new' }>) => {
    if (!onUploadImage)
      return;
    const upload = Promise.resolve()
      .then(() => onUploadImage(image.file))
      .then((assetId) => {
        commitImages(imagesRef.current.map(current => current.id === image.id && current.kind === 'new'
          ? { ...current, assetId, status: 'ready' }
          : current));
      })
      .catch(() => {
        commitImages(imagesRef.current.map(current => current.id === image.id && current.kind === 'new'
          ? { ...current, status: 'error' }
          : current));
      })
      .finally(() => {
        inFlightUploadsRef.current.delete(upload);
      });
    inFlightUploadsRef.current.add(upload);
  }, [commitImages, onUploadImage]);

  const waitForImageUploads = useCallback(async () => {
    while (inFlightUploadsRef.current.size > 0)
      await Promise.allSettled([...inFlightUploadsRef.current]);
  }, []);

  const getImageDraftState = useCallback(() => ({
    images: imagesRef.current,
    isImageSelectionDirty: imageSelectionDirtyRef.current,
  }), []);

  const handleSelectImages = useCallback((files: File[]) => {
    if (!onUploadImage)
      return 0;
    const accepted = files.slice(0, MAX_RECORD_IMAGES - imagesRef.current.length);
    if (accepted.length === 0)
      return 0;
    const added: RecordEditorImage[] = accepted.map(file => ({
      file,
      id: `new-image-${Date.now()}-${++nextImageIdRef.current}`,
      kind: 'new',
      status: 'uploading',
    }));
    commitImages([...imagesRef.current, ...added]);
    imageSelectionDirtyRef.current = true;
    setIsImageSelectionDirty(true);
    for (const image of added) {
      if (image.kind === 'new')
        uploadImage(image);
    }
    return accepted.length;
  }, [commitImages, onUploadImage, uploadImage]);

  const handleRetryImage = useCallback((id: string) => {
    const image = imagesRef.current.find(item => item.id === id);
    if (!image || image.kind !== 'new' || image.status !== 'error')
      return;
    commitImages(imagesRef.current.map(item => item.id === id && item.kind === 'new'
      ? { ...item, status: 'uploading' }
      : item));
    uploadImage(image);
  }, [commitImages, uploadImage]);

  const handleRemoveImage = useCallback((id: string) => {
    if (!imagesRef.current.some(image => image.id === id))
      return;
    commitImages(imagesRef.current.filter(image => image.id !== id));
    imageSelectionDirtyRef.current = true;
    setIsImageSelectionDirty(true);
  }, [commitImages]);

  return {
    handleRemoveImage,
    handleRetryImage,
    handleSelectImages,
    getImageDraftState,
    images,
    isImageSelectionDirty,
    isImageUploading: images.some(image => image.kind === 'new' && image.status === 'uploading'),
    hasImageUploadError: images.some(image => image.kind === 'new' && image.status === 'error'),
    waitForImageUploads,
  };
}

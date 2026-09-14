import { useMemo, useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { openExternalUrl } from '@/shared/lib';
import { ImagePreview } from '@/shared/ui';

export interface NotificationDetailContentProps {
  title?: string;
  type?: string;
  createdAt?: string | Date;
  content: string;
  payload?: Record<string, unknown>;
  coverPicture?: string;
  images?: string[];
}

export function AutoLinkText({ text }: { text: string }) {
  if (!text)
    return null;

  const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  let characterOffset = 0;
  const parts = text.split(URL_REGEX).map((part) => {
    const item = { id: `${characterOffset}:${part.length}`, text: part };
    characterOffset += part.length;
    return item;
  });

  return (
    <div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-ww-ink">
      {parts.map((part) => {
        if (/^https?:\/\//i.test(part.text)) {
          return (
            <a
              key={part.id}
              href={part.text}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void openExternalUrl(part.text);
              }}
              className="text-ww-primary font-medium underline underline-offset-2 break-all hover:opacity-80 active:opacity-60 transition-opacity"
            >
              {part.text}
            </a>
          );
        }
        return <span key={part.id}>{part.text}</span>;
      })}
    </div>
  );
}

export function NotificationDetailContent({
  type,
  createdAt,
  content,
  payload,
  coverPicture,
  images: extraImages,
}: NotificationDetailContentProps) {
  const { t } = useTranslation('common');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const imageList = useMemo(() => {
    const images: string[] = [];
    const rawCover = coverPicture || payload?.coverPicture || payload?.cover || payload?.coverUrl;
    if (typeof rawCover === 'string' && rawCover.trim()) {
      images.push(rawCover.trim());
    }

    const rawImages = extraImages || payload?.images;
    if (Array.isArray(rawImages)) {
      rawImages.forEach((image) => {
        if (typeof image === 'string' && image.trim() && !images.includes(image.trim())) {
          images.push(image.trim());
        }
      });
    }
    else if (typeof rawImages === 'string' && rawImages.trim() && !images.includes(rawImages.trim())) {
      images.push(rawImages.trim());
    }
    return images;
  }, [coverPicture, extraImages, payload]);

  const galleryColumns = imageList.length === 2 || imageList.length === 4
    ? 'grid-cols-2'
    : 'grid-cols-3';

  const formattedDate = createdAt
    ? (typeof createdAt === 'string' ? createdAt : createdAt.toLocaleString('zh-CN', { hour12: false }))
    : undefined;

  return (
    <div className="text-left">
      {(type || formattedDate) && (
        <div className="mb-[var(--ww-space-md)] flex flex-wrap items-center justify-between gap-2 text-xs text-ww-soft">
          {type && (
            <span className="rounded-full bg-ww-surface-tint px-2.5 py-0.5 font-medium text-ww-mid">
              {type}
            </span>
          )}
          {formattedDate && (
            <time dateTime={typeof createdAt === 'string' ? createdAt : (createdAt as Date)?.toISOString?.()}>
              {formattedDate}
            </time>
          )}
        </div>
      )}

      <AutoLinkText text={content} />

      {imageList.length === 1 && (
        <button
          aria-label={t('message.notificationCenter.previewImage', { index: 1 })}
          className="mt-[var(--ww-space-lg)] block aspect-[16/9] w-full overflow-hidden rounded-[var(--ww-radius-control)] border-0 bg-transparent p-0"
          onClick={() => setPreviewImage(imageList[0])}
          type="button"
        >
          <img
            alt=""
            className="h-full w-full object-cover"
            data-notification-image
            src={imageList[0]}
          />
        </button>
      )}

      {imageList.length > 1 && (
        <div className={`mt-[var(--ww-space-lg)] grid gap-1.5 ${galleryColumns}`}>
          {imageList.map((image, index) => (
            <button
              aria-label={t('message.notificationCenter.previewImage', { index: index + 1 })}
              className="aspect-square overflow-hidden rounded-[calc(var(--ww-radius-control)-2px)] border-0 bg-transparent p-0"
              key={image}
              onClick={() => setPreviewImage(image)}
              type="button"
            >
              <img
                alt=""
                className="h-full w-full object-cover"
                data-notification-image
                src={image}
              />
            </button>
          ))}
        </div>
      )}

      {imageList.length > 1 && (
        <p className="mt-[var(--ww-space-sm)] text-center text-[12px] leading-5 text-ww-soft">
          {t('message.notificationCenter.imageCount', { count: imageList.length })}
        </p>
      )}

      <ImagePreview
        image={previewImage ?? undefined}
        onClose={() => setPreviewImage(null)}
        visible={Boolean(previewImage)}
      />
    </div>
  );
}

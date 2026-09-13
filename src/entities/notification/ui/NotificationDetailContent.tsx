import { useState } from 'react';
import { openExternalUrl } from '@/shared/lib';

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
  const parts = text.split(URL_REGEX);

  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ww-ink">
      {parts.map((part, index) => {
        if (/^https?:\/\//i.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void openExternalUrl(part);
              }}
              className="text-ww-primary font-medium underline underline-offset-2 break-all hover:opacity-80 active:opacity-60 transition-opacity"
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const imageList: string[] = [];
  const rawCover = coverPicture || payload?.coverPicture || payload?.cover || payload?.coverUrl;
  if (typeof rawCover === 'string' && rawCover.trim()) {
    imageList.push(rawCover.trim());
  }

  const rawImages = extraImages || payload?.images;
  if (Array.isArray(rawImages)) {
    rawImages.forEach((img) => {
      if (typeof img === 'string' && img.trim() && !imageList.includes(img.trim())) {
        imageList.push(img.trim());
      }
    });
  }
  else if (typeof rawImages === 'string' && rawImages.trim() && !imageList.includes(rawImages.trim())) {
    imageList.push(rawImages.trim());
  }

  const formattedDate = createdAt
    ? (typeof createdAt === 'string' ? createdAt : createdAt.toLocaleString('zh-CN', { hour12: false }))
    : undefined;

  return (
    <div className="space-y-3.5 pt-1 text-left">
      {(type || formattedDate) && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ww-soft">
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

      {/* Single / Multi Image Gallery */}
      {imageList.length === 1 && (
        <div className="overflow-hidden rounded-xl border border-ww-border/40 shadow-ww-xs">
          <img
            src={imageList[0]}
            alt="notice cover"
            onClick={() => setPreviewImage(imageList[0])}
            className="max-h-60 w-full cursor-zoom-in object-cover transition-transform duration-200 hover:scale-[1.02]"
          />
        </div>
      )}

      {imageList.length > 1 && (
        <div className={`grid gap-2 ${imageList.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {imageList.map((img, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-lg border border-ww-border/40 shadow-ww-xs">
              <img
                src={img}
                alt={`notice image ${index + 1}`}
                onClick={() => setPreviewImage(img)}
                className="h-full w-full cursor-zoom-in object-cover transition-transform duration-200 hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}

      {/* Text with Link Highlighting */}
      <AutoLinkText text={content} />

      {/* Enlarged Image Lightbox Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewImage(null);
          }}
        >
          <img
            src={previewImage}
            alt="enlarged preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

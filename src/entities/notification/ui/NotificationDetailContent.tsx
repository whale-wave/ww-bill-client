import type { Components } from 'react-markdown';
import { useMemo, useState } from 'react';
import Markdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '@/shared/i18n';
import { openExternalUrl, resolvePublicMediaUrl } from '@/shared/lib';
import { ImagePreview } from '@/shared/ui';
import { usePublicMediaObjectUrl } from '@/shared/ui/public-media-image';

export interface NotificationDetailContentProps {
  title?: string;
  type?: string;
  createdAt?: string | Date;
  content: string;
  payload?: Record<string, unknown>;
  coverPicture?: string;
  images?: string[];
}

const MARKDOWN_COMPONENTS: Components = {
  a: ({ children, href }) => {
    if (!href || !/^https?:\/\//i.test(href))
      return <span>{children}</span>;
    return (
      <a
        className="break-all font-medium text-primary underline underline-offset-2 transition-opacity hover:opacity-80 active:opacity-60"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void openExternalUrl(href);
        }}
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => <blockquote className="my-[var(--ww-space-md)] border-l-4 border-primary/35 bg-ww-surface-tint px-[var(--ww-space-md)] py-[var(--ww-space-sm)] text-ww-mid">{children}</blockquote>,
  code: ({ children, className }) => className
    ? <code className={className}>{children}</code>
    : <code className="rounded bg-ww-surface-tint px-1.5 py-0.5 font-mono text-[0.9em] text-primary-deep">{children}</code>,
  h1: ({ children }) => <h1 className="mb-[var(--ww-space-sm)] mt-[var(--ww-space-xl)] text-xl font-extrabold leading-7 text-ww-ink first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-[var(--ww-space-sm)] mt-[var(--ww-space-xl)] text-lg font-extrabold leading-7 text-ww-ink first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-[var(--ww-space-sm)] mt-[var(--ww-space-lg)] text-base font-bold leading-6 text-ww-ink first:mt-0">{children}</h3>,
  hr: () => <hr className="my-[var(--ww-space-lg)] border-0 border-t border-solid border-border-primary" />,
  img: ({ alt }) => alt ? <span className="text-ww-soft">{alt}</span> : null,
  li: ({ children }) => <li className="pl-[var(--ww-space-xs)]">{children}</li>,
  ol: ({ children }) => <ol className="my-[var(--ww-space-md)] list-decimal space-y-[var(--ww-space-xs)] pl-[var(--ww-space-2xl)]">{children}</ol>,
  p: ({ children }) => <p className="my-[var(--ww-space-sm)] whitespace-pre-wrap break-words first:mt-0 last:mb-0">{children}</p>,
  pre: ({ children }) => <pre className="my-[var(--ww-space-md)] overflow-x-auto rounded-[var(--ww-radius-control)] bg-ww-ink p-[var(--ww-space-md)] font-mono text-[13px] leading-5 text-white">{children}</pre>,
  table: ({ children }) => <div className="my-[var(--ww-space-md)] overflow-x-auto"><table className="w-full min-w-max border-collapse text-left text-sm">{children}</table></div>,
  td: ({ children }) => <td className="border border-solid border-border-primary px-[var(--ww-space-md)] py-[var(--ww-space-sm)] align-top">{children}</td>,
  th: ({ children }) => <th className="border border-solid border-border-primary bg-ww-surface-tint px-[var(--ww-space-md)] py-[var(--ww-space-sm)] font-bold text-ww-ink">{children}</th>,
  ul: ({ children }) => <ul className="my-[var(--ww-space-md)] list-disc space-y-[var(--ww-space-xs)] pl-[var(--ww-space-2xl)]">{children}</ul>,
};

export function NotificationMarkdown({ content }: { content: string }) {
  if (!content)
    return null;

  return (
    <div className="break-words text-[15px] leading-6 text-ww-ink" data-notification-markdown>
      <Markdown components={MARKDOWN_COMPONENTS} remarkPlugins={[remarkGfm]} skipHtml urlTransform={defaultUrlTransform}>
        {content}
      </Markdown>
    </div>
  );
}

export function NotificationMarkdownPreview({ content }: { content: string }) {
  if (!content)
    return null;

  return (
    <span data-notification-markdown-preview>
      <Markdown allowedElements={[]} remarkPlugins={[remarkGfm]} skipHtml unwrapDisallowed urlTransform={defaultUrlTransform}>
        {content}
      </Markdown>
    </span>
  );
}

function NotificationImage({ contain = false, image, onOpen }: { contain?: boolean; image: string; onOpen: (url: string) => void }) {
  const mediaState = usePublicMediaObjectUrl(image);
  const imageSrc = mediaState.url;
  return (
    <button
      aria-label="预览通知图片"
      className={`${contain ? 'h-full w-full' : 'aspect-square'} overflow-hidden rounded-[calc(var(--ww-radius-control)-2px)] border-0 bg-transparent p-0`}
      disabled={!imageSrc}
      onClick={() => imageSrc && onOpen(imageSrc)}
      type="button"
    >
      {mediaState.loading
        ? <span aria-label="正在加载通知图片" className="block h-full w-full animate-pulse bg-ww-surface-tint" role="status" />
        : imageSrc
          ? <img alt="" className={`h-full w-full ${contain ? 'object-contain object-center' : 'object-cover'}`} data-notification-image src={imageSrc} />
          : <span className="block h-full w-full bg-ww-surface-tint" />}
    </button>
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
      const resolvedCover = resolvePublicMediaUrl(rawCover);
      if (resolvedCover)
        images.push(resolvedCover);
    }

    const rawImages = extraImages || payload?.images;
    if (Array.isArray(rawImages)) {
      rawImages.forEach((image) => {
        if (typeof image !== 'string' || !image.trim())
          return;
        const resolvedImage = resolvePublicMediaUrl(image);
        if (resolvedImage && !images.includes(resolvedImage))
          images.push(resolvedImage);
      });
    }
    else if (typeof rawImages === 'string' && rawImages.trim()) {
      const resolvedImage = resolvePublicMediaUrl(rawImages);
      if (resolvedImage && !images.includes(resolvedImage))
        images.push(resolvedImage);
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

      <NotificationMarkdown content={content} />

      {imageList.length === 1 && (
        <div className="mt-[var(--ww-space-lg)] block aspect-[16/9] w-full overflow-hidden rounded-[var(--ww-radius-control)]">
          <NotificationImage contain image={imageList[0]} onOpen={setPreviewImage} />
        </div>
      )}

      {imageList.length > 1 && (
        <div className={`mt-[var(--ww-space-lg)] grid gap-1.5 ${galleryColumns}`}>
          {imageList.map(image => (
            <NotificationImage image={image} key={image} onOpen={setPreviewImage} />
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

import type { RecordEntry } from '../types';
import { ImageOff } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRecordAttachmentContentQuery } from '../hooks';

interface RecordAttachmentSectionProps {
  attachments?: RecordEntry['attachments'];
  householdId?: string;
}

interface RecordAttachmentThumbnailProps {
  attachment: NonNullable<RecordEntry['attachments']>[number];
  householdId?: string;
  onOpen: () => void;
}

function useAttachmentObjectUrl(blob?: Blob) {
  const [url, setUrl] = useState<string>();

  useLayoutEffect(() => {
    if (!blob) {
      queueMicrotask(() => setUrl(undefined));
      return;
    }
    const nextUrl = URL.createObjectURL(blob);
    let active = true;
    queueMicrotask(() => {
      if (active)
        setUrl(nextUrl);
    });
    return () => {
      active = false;
      URL.revokeObjectURL(nextUrl);
    };
  }, [blob]);

  return url;
}

function RecordAttachmentThumbnail({ attachment, householdId, onOpen }: RecordAttachmentThumbnailProps) {
  const thumbnailQuery = useRecordAttachmentContentQuery({ attachmentId: attachment.id, householdId, variant: 'thumbnail' });
  const thumbnailUrl = useAttachmentObjectUrl(thumbnailQuery.data);

  if (thumbnailUrl) {
    return <button className="border-0 bg-transparent p-0" onClick={onOpen} type="button"><img alt="记账凭证" className="h-20 w-20 rounded-xl object-cover" src={thumbnailUrl} /></button>;
  }
  if (thumbnailQuery.isLoading || thumbnailQuery.isFetching)
    return <span aria-label="正在加载凭证图片" className="block h-20 w-20 animate-pulse rounded-xl border border-border-primary bg-primary-light/55 shadow-ww-xs" role="status" />;
  return <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary-light text-ww-soft"><ImageOff size={20} /></span>;
}

/** Authenticated media is fetched as a Blob; no storage URL enters query persistence. */
export function RecordAttachmentSection({ attachments = [], householdId }: RecordAttachmentSectionProps) {
  const attachment = attachments[0];
  const [opened, setOpened] = useState(false);
  const contentQuery = useRecordAttachmentContentQuery({ attachmentId: attachment?.id, enabled: opened, householdId, variant: 'content' });
  const contentUrl = useAttachmentObjectUrl(opened ? contentQuery.data : undefined);
  if (!attachment)
    return null;
  const open = () => {
    setOpened(true);
  };
  const close = () => setOpened(false);
  return (
    <section className="mt-3 pt-1" data-record-attachment-section>
      <p className="mb-2 text-[12px] font-semibold text-ww-soft">图片</p>
      <RecordAttachmentThumbnail attachment={attachment} householdId={householdId} key={attachment.id} onOpen={() => void open()} />
      {opened && typeof document !== 'undefined' && createPortal(
        <button aria-label="关闭图片预览" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5" onClick={close} type="button">
          {contentUrl
            ? <img alt="记账凭证大图" className="max-h-full max-w-full rounded-xl object-contain" src={contentUrl} />
            : contentQuery.isError
              ? <span className="flex h-24 w-24 items-center justify-center rounded-xl bg-white/15 text-white"><ImageOff size={26} /></span>
              : <span aria-label="正在加载凭证图片" className="h-24 w-24 animate-pulse rounded-xl bg-white/25" role="status" />}
        </button>,
        document.body,
      )}
    </section>
  );
}

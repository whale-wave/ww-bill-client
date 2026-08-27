import type { RecordEntry } from '../types';
import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getRecordAttachmentContentApi } from '../api';

interface RecordAttachmentSectionProps {
  attachments?: RecordEntry['attachments'];
  householdId?: string;
}

/** Authenticated media is fetched as a Blob; no storage URL enters query persistence. */
export function RecordAttachmentSection({ attachments = [], householdId }: RecordAttachmentSectionProps) {
  const attachment = attachments[0];
  const [thumbnailUrl, setThumbnailUrl] = useState<string>();
  const [contentUrl, setContentUrl] = useState<string>();
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (!attachment)
      return;
    let active = true;
    let url: string | undefined;
    void getRecordAttachmentContentApi(attachment.id, 'thumbnail', householdId)
      .then((blob) => {
        if (!active)
          return;
        url = URL.createObjectURL(blob);
        setThumbnailUrl(url);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (url)
        URL.revokeObjectURL(url);
    };
  }, [attachment, householdId]);
  if (!attachment)
    return null;
  const open = async () => {
    setOpened(true);
    if (contentUrl)
      return;
    const blob = await getRecordAttachmentContentApi(attachment.id, 'content', householdId);
    setContentUrl(URL.createObjectURL(blob));
  };
  const close = () => {
    setOpened(false);
    setContentUrl((current) => {
      if (current)
        URL.revokeObjectURL(current);
      return undefined;
    });
  };
  return (
    <section className="mt-3 border-t border-border-primary pt-3" data-record-attachment-section>
      <p className="mb-2 text-[12px] font-semibold text-ww-soft">图片</p>
      {thumbnailUrl
        ? <button className="border-0 bg-transparent p-0" onClick={() => void open()} type="button"><img alt="记账凭证" className="h-20 w-20 rounded-xl object-cover" src={thumbnailUrl} /></button>
        : <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary-light text-ww-soft"><ImageOff size={20} /></span>}
      {opened && contentUrl && typeof document !== 'undefined' && createPortal(
        <button aria-label="关闭图片预览" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5" onClick={close} type="button">
          <img alt="记账凭证大图" className="max-h-full max-w-full rounded-xl object-contain" src={contentUrl} />
        </button>,
        document.body,
      )}
    </section>
  );
}

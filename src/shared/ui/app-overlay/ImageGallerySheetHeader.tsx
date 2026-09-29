import { X } from 'lucide-react';

interface ImageGallerySheetHeaderProps {
  closeLabel: string;
  doneLabel: string;
  onClose: () => void;
  title: string;
}

export function ImageGallerySheetHeader({ closeLabel, doneLabel, onClose, title }: ImageGallerySheetHeaderProps) {
  return (
    <header className="grid min-h-14 shrink-0 grid-cols-[56px_minmax(0,1fr)_56px] items-center px-2" data-image-gallery-header>
      <button
        aria-label={closeLabel}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ww-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
        onClick={onClose}
        type="button"
      >
        <X aria-hidden="true" size={22} strokeWidth={2} />
      </button>
      <h2 className="truncate text-center text-[17px] font-bold text-ww-ink">{title}</h2>
      <button
        className="flex min-h-11 items-center justify-center text-[15px] font-bold text-primary-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-deep"
        onClick={onClose}
        type="button"
      >
        {doneLabel}
      </button>
    </header>
  );
}

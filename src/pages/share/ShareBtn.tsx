import type { FC } from 'react';
import { Download, Share2 } from 'lucide-react';
import { useTranslation } from '@/shared/i18n';

interface ShareBtnProps {
  onSave: () => void;
  onShare?: () => void;
}

const ShareBtn: FC<ShareBtnProps> = ({ onSave, onShare }) => {
  const { t } = useTranslation('community');
  return (
    <div className="mx-auto flex w-full max-w-[420px] gap-2.5 px-[18px] pb-[max(18px,env(safe-area-inset-bottom))]">
      <button
        aria-label={t('share.saveImage')}
        className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[18px] border border-solid border-border-primary bg-white/85 text-[13px] font-extrabold text-primary-deep shadow-ww backdrop-blur-xl"
        onClick={onSave}
        type="button"
      >
        <Download size={17} strokeWidth={1.9} />
        {t('share.saveImage')}
      </button>
      {onShare && (
        <button
          aria-label={t('share.shareBill')}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[18px] border-0 bg-primary text-[13px] font-extrabold text-white shadow-ww"
          onClick={onShare}
          type="button"
        >
          <Share2 size={17} strokeWidth={1.9} />
          {t('common:action.share')}
        </button>
      )}
    </div>
  );
};

export default ShareBtn;

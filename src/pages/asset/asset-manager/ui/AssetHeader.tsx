import type { FC } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const AssetHeader: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between px-[18px] pb-4 pt-[max(8px,env(safe-area-inset-top))]">
      <div>
        <h1 className="text-[20px] font-extrabold leading-[30px] text-ww-ink">{t('manager.title')}</h1>
        <p className="text-[11px] font-medium leading-4 text-ww-mid">{t('manager.subtitle')}</p>
      </div>
      <button
        aria-label={t('back')}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-solid border-border-primary bg-white/85 text-primary-deep shadow-ww-xs"
        onClick={handleBack}
        type="button"
      >
        <ArrowLeft size={17} strokeWidth={2} />
      </button>
    </header>
  );
};

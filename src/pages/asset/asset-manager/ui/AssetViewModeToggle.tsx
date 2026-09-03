import type { FC } from 'react';
import { List, WalletCards } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type AssetViewMode = 'list' | 'wallet';

interface AssetViewModeToggleProps {
  onChange: (view: AssetViewMode) => void;
  value: AssetViewMode;
}

export const AssetViewModeToggle: FC<AssetViewModeToggleProps> = ({ onChange, value }) => {
  const { t } = useTranslation('asset');

  return (
    <div
      aria-label={t('manager.viewMode')}
      className="flex h-11 w-full rounded-[15px] border border-white/70 bg-white/55 p-1 shadow-ww-xs"
      role="group"
    >
      <button
        aria-pressed={value === 'list'}
        className={value === 'list'
          ? 'flex flex-1 items-center justify-center gap-2 rounded-[11px] border-0 bg-white text-[12px] font-black text-ww-ink shadow-[0_4px_10px_rgb(31_49_69_/_10%)]'
          : 'flex flex-1 items-center justify-center gap-2 rounded-[11px] border-0 bg-transparent text-[12px] font-bold text-ww-mid'}
        onClick={() => onChange('list')}
        type="button"
      >
        <List size={16} strokeWidth={2.2} />
        {t('manager.listView')}
      </button>
      <button
        aria-pressed={value === 'wallet'}
        className={value === 'wallet'
          ? 'flex flex-1 items-center justify-center gap-2 rounded-[11px] border-0 bg-primary text-[12px] font-black text-white shadow-[0_4px_10px_rgb(41_136_170_/_24%)]'
          : 'flex flex-1 items-center justify-center gap-2 rounded-[11px] border-0 bg-transparent text-[12px] font-bold text-ww-mid'}
        onClick={() => onChange('wallet')}
        type="button"
      >
        <WalletCards size={16} strokeWidth={2.2} />
        {t('manager.walletView')}
      </button>
    </div>
  );
};

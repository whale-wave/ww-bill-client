import type { FC } from 'react';
import { LedgerCapability } from '@/entities/ledger';
import { AppSheet, SheetHeader } from '@/shared/ui';

type Scope = { kind: 'personal' } | { kind: 'ledger'; ledgerId: string } | { kind: 'household'; householdId: string };
interface FilterTag { id: string; name: string; status: string }
interface LedgerOption { id: string; name: string; status: string; templateKey?: string; capabilities: readonly string[] }
interface HouseholdMember {
  id: string;
  nickname?: string | null;
  user: { id: number; name?: string | null; username?: string | null };
}
interface AssetOption { id: string; name: string }

interface Props {
  scope: Scope;
  t: (key: string) => string;
  visible: boolean;
  availableTags: FilterTag[];
  canReadTags: boolean;
  ledgerOptions: LedgerOption[];
  householdMembers: HouseholdMember[];
  assets: AssetOption[];
  draftTagIds: string[];
  draftTagMatch: 'any' | 'all';
  draftAccount: string;
  draftSourceMemberId: string;
  onClose: () => void;
  onNavigateLedger: (ledgerId: string) => void;
  onTagsReset: () => void;
  onTagMatchChange: (value: 'any' | 'all') => void;
  onTagToggle: (tagId: string) => void;
  onAccountReset: () => void;
  onAccountChange: (value: string) => void;
  onSourceMemberChange: (value: string) => void;
  onApply: () => void;
}

export const ChartDashboardFilterSheet: FC<Props> = ({
  scope,
  t,
  visible,
  availableTags,
  canReadTags,
  ledgerOptions,
  householdMembers,
  assets,
  draftTagIds,
  draftTagMatch,
  draftAccount,
  draftSourceMemberId,
  onClose,
  onNavigateLedger,
  onTagsReset,
  onTagMatchChange,
  onTagToggle,
  onAccountReset,
  onAccountChange,
  onSourceMemberChange,
  onApply,
}) => (
  <AppSheet
    bodyClassName="max-h-[88dvh] w-full overflow-hidden rounded-t-[28px]"
    closeOnMaskClick
    material="opaque"
    onClose={onClose}
    visible={visible}
  >
    <section aria-label={t('dashboard.filter')} className="flex max-h-[88dvh] flex-col overflow-hidden bg-ww-surface" data-chart-filter-overlay data-tab-swipe-ignore>
      <SheetHeader closeLabel={t('dashboard.close')} onClose={onClose} title={t('dashboard.filter')} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {scope.kind === 'personal' && (
          <section className="mb-5 rounded-2xl bg-ww-surface-raised p-4">
            <h3 className="mb-2 text-sm font-bold">{t('dashboard.books')}</h3>
            <select className="min-h-11 w-full rounded-xl bg-ww-surface-tint p-3" onChange={event => onNavigateLedger(event.target.value)} value="">
              <option value="">{t('dashboard.currentBook')}</option>
              {ledgerOptions.filter(item => item.templateKey !== 'system-default' && item.status === 'ACTIVE' && item.capabilities.includes(LedgerCapability.CHART_READ)).map(book => <option key={book.id} value={book.id}>{book.name}</option>)}
            </select>
          </section>
        )}
        {scope.kind === 'household' && (
          <section className="mb-5 rounded-2xl bg-ww-surface-raised p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold">{t('dashboard.books')}</h3>
              <button className="min-h-11 min-w-11 text-xs text-primary-deep" onClick={() => onSourceMemberChange('')} type="button">{t('dashboard.reset')}</button>
            </div>
            <select className="min-h-11 w-full rounded-xl bg-ww-surface-tint p-3" onChange={event => onSourceMemberChange(event.target.value)} value={draftSourceMemberId}>
              <option value="">{t('dashboard.all')}</option>
              {householdMembers.map(member => <option key={member.id} value={member.user.id}>{member.nickname || member.user.name || member.user.username || member.user.id}</option>)}
            </select>
          </section>
        )}
        <section className="mb-5 rounded-2xl bg-ww-surface-raised p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold">{t('dashboard.tags')}</h3>
            <button className="min-h-11 min-w-11 text-xs text-primary-deep" onClick={onTagsReset} type="button">{t('dashboard.reset')}</button>
          </div>
          {canReadTags
            ? (
                <>
                  <div className="mb-3 flex gap-2">{(['any', 'all'] as const).map(item => <button className={`min-h-11 min-w-11 rounded-full px-3 text-xs ${draftTagMatch === item ? 'bg-primary text-white' : 'bg-ww-surface-tint'}`} key={item} onClick={() => onTagMatchChange(item)} type="button">{t(item === 'any' ? 'dashboard.tagAny' : 'dashboard.tagAll')}</button>)}</div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.filter(tag => tag.status === 'ACTIVE').map((tag) => {
                      const checked = draftTagIds.includes(tag.id);
                      return <button aria-pressed={checked} className={`min-h-11 min-w-11 rounded-full px-3 text-xs ${checked ? 'bg-primary-light font-bold text-primary-deep' : 'bg-ww-surface-tint text-ww-mid'}`} key={tag.id} onClick={() => onTagToggle(tag.id)} type="button">{tag.name}</button>;
                    })}
                    {availableTags.length === 0 && <span className="text-xs text-ww-soft">—</span>}
                  </div>
                </>
              )
            : <p className="text-xs text-ww-soft">{t('dashboard.noTagPermission')}</p>}
        </section>
        <section className="mb-6 rounded-2xl bg-ww-surface-raised p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold">{t('dashboard.account')}</h3>
            <button className="min-h-11 min-w-11 text-xs text-primary-deep" onClick={onAccountReset} type="button">{t('dashboard.reset')}</button>
          </div>
          {scope.kind === 'ledger'
            ? <p className="text-xs text-ww-soft">{t('dashboard.customAccountHint')}</p>
            : (
                <select className="min-h-11 w-full rounded-xl bg-ww-surface-tint p-3" onChange={event => onAccountChange(event.target.value)} value={draftAccount}>
                  <option value="">{t('dashboard.all')}</option>
                  <option value="unlinked">{t('dashboard.unlinked')}</option>
                  {assets.length > 0 && <optgroup label={t('dashboard.ownAccounts')}>{assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</optgroup>}
                </select>
              )}
        </section>
      </div>
      <footer className="shrink-0 border-t border-border-primary bg-ww-surface px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-3">
        <button className="min-h-11 w-full rounded-full bg-primary font-bold text-white" onClick={onApply} type="button">{t('dashboard.apply')}</button>
      </footer>
    </section>
  </AppSheet>
);

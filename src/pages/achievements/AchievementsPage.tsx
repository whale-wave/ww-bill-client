import { Check, ChevronRight, Medal, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAchievementBadgesQuery, useAchievementSummaryQuery, useUpdateAchievementDisplayMutation } from '@/entities/achievement';
import { PageHeader, Surface } from '@/shared/ui';

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { data: summary } = useAchievementSummaryQuery();
  const { data: badges } = useAchievementBadgesQuery();
  const [updateDisplay] = useUpdateAchievementDisplayMutation();
  const displayed = summary?.displayedBadgeCodes ?? [];
  const handleToggle = async (code: string) => {
    const next = displayed.includes(code) ? displayed.filter(item => item !== code) : [...displayed, code].slice(0, 3);
    await updateDisplay(next);
  };
  return (
    <div className="page-new flex min-h-0 flex-col overflow-hidden">
      <PageHeader backLabel="返回" onBack={() => navigate(-1)} title="成长航程" />
      <main className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-8">
        <Surface className="mt-3 overflow-hidden px-5 py-5" material="raised">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary-deep"><Waves size={22} /></span>
            <div>
              <p className="text-[12px] font-semibold text-ww-mid">当前称号</p>
              <h1 className="text-[22px] font-extrabold text-ww-ink">{summary?.currentTitle?.name ?? '开启你的航程'}</h1>
            </div>
          </div>
          <p className="mt-4 text-[13px] text-ww-mid">
            已在
            {summary?.recordDays ?? 0}
            {' '}
            个日子认真记录
          </p>
          {summary?.nextTitle && (
            <p className="mt-1 text-[12px] text-primary-deep">
              再记录
              {summary.remainingRecordDays}
              {' '}
              天，成为「
              {summary.nextTitle.name}
              」
            </p>
          )}
        </Surface>
        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold text-ww-ink">我的徽章</h2>
          <span className="text-[12px] text-ww-mid">最多展示 3 枚</span>
        </div>
        <div className="mt-3 space-y-2">
          {badges.map(badge => (
            <button className={`flex w-full items-center gap-3 rounded-[20px] border p-4 text-left ${badge.isUnlocked ? 'border-primary/30 bg-white/85' : 'border-border-primary/70 bg-white/45 opacity-70'}`} disabled={!badge.isUnlocked} key={badge.code} onClick={() => void handleToggle(badge.code)} type="button">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${badge.isUnlocked ? 'bg-primary-light text-primary-deep' : 'bg-bg-gray text-ww-soft'}`}><Medal size={20} /></span>
              <span className="min-w-0 flex-1">
                <b className="block text-[14px] text-ww-ink">{badge.name}</b>
                <span className="block pt-1 text-[11px] text-ww-mid">{badge.isUnlocked ? '已获得' : badge.requiredRecordDays ? `记录 ${badge.progress}/${badge.requiredRecordDays} 天` : badge.requiredReviewMonths ? `复盘 ${badge.progress}/${badge.requiredReviewMonths} 月` : '完成对应航程后解锁'}</span>
              </span>
              {displayed.includes(badge.code) ? <Check className="text-primary-deep" size={18} /> : <ChevronRight className="text-ww-soft" size={18} />}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

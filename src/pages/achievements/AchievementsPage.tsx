import type { LucideIcon } from 'lucide-react';
import { Anchor, Award, Check, Compass, Flag, Handshake, Landmark, Medal, Sparkles, Waves } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAchievementBadgesQuery, useAchievementSummaryQuery, useUpdateAchievementDisplayMutation } from '@/entities/achievement';
import { PageHeader } from '@/shared/ui';

const ART: Array<{ accent: string; Icon: LucideIcon }> = [
  { accent: '#ef8f7c', Icon: Waves },
  { accent: '#eabf59', Icon: Anchor },
  { accent: '#81bfbb', Icon: Compass },
  { accent: '#d9829a', Icon: Flag },
  { accent: '#8aa7cf', Icon: Landmark },
  { accent: '#ab91d3', Icon: Sparkles },
  { accent: '#62a8b4', Icon: Handshake },
  { accent: '#dd9d54', Icon: Award },
];

function Emblem({ index, locked, large = false }: { index: number; locked: boolean; large?: boolean }) {
  const art = ART[index % ART.length];
  const Icon = art.Icon;
  return (
    <span className={`relative isolate inline-flex items-center justify-center ${large ? 'h-36 w-32' : 'h-[76px] w-[68px]'}`} aria-hidden="true">
      <span className={`absolute inset-0 [clip-path:polygon(12%_0,88%_0,100%_13%,93%_84%,50%_100%,7%_84%,0_13%)] shadow-[0_10px_18px_rgba(4,10,20,.24)] ${locked ? 'bg-[#9ba5b3]' : 'bg-white'}`} />
      <span className="absolute inset-[3px] [clip-path:polygon(12%_0,88%_0,100%_13%,93%_84%,50%_100%,7%_84%,0_13%)] bg-gradient-to-br from-white via-[#f0f3f6] to-[#d7dde4]" />
      <span className={`absolute inset-x-[13%] top-[14%] h-[57%] [clip-path:polygon(50%_0,100%_20%,88%_100%,12%_100%,0_20%)] ${locked ? 'bg-[#747e8c]' : ''}`} style={locked ? undefined : { background: art.accent }} />
      <span className="absolute bottom-[12%] left-[13%] right-[13%] h-[26%] rounded-b-[45%] border-t border-white/80 bg-white/90" />
      <Icon className={`relative z-10 ${large ? 'h-14 w-14' : 'h-8 w-8'}${locked ? ' text-white/75' : ' text-white'}`} strokeWidth={1.7} />
    </span>
  );
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { data: summary } = useAchievementSummaryQuery();
  const { data: badges = [] } = useAchievementBadgesQuery();
  const [updateDisplay] = useUpdateAchievementDisplayMutation();
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const displayed = summary?.displayedBadgeCodes ?? [];
  const active = badges.find(item => item.code === activeCode) ?? badges.find(item => item.isUnlocked) ?? badges[0];
  const activeIndex = active ? badges.indexOf(active) : 0;
  const nextTitle = summary?.nextTitle;
  const progress = nextTitle ? Math.min(100, ((summary?.recordDays ?? 0) / nextTitle.requiredRecordDays) * 100) : 100;
  const toggle = async (code: string) => {
    const next = displayed.includes(code) ? displayed.filter(item => item !== code) : [...displayed, code].slice(0, 3);
    await updateDisplay(next);
  };

  return (
    <div className="page-new flex min-h-0 flex-col overflow-hidden bg-[#192130] text-white">
      <PageHeader backLabel="返回" onBack={() => navigate(-1)} title="我的徽章" />
      <main className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-10">
        <section className="relative mt-2 overflow-hidden rounded-[24px] border border-white/10 bg-[#222d40] px-5 pb-5 pt-4">
          <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-[#6fc2dc]/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[12px] font-semibold tracking-[.14em] text-white/55">SAILOR TITLE</p>
              <h1 className="mt-1 text-[26px] font-extrabold">{summary?.currentTitle?.name ?? '开启你的航程'}</h1>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-[#9fdae9]"><Medal size={22} /></span>
          </div>
          <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-[#6fc2dc]" style={{ width: `${String(progress)}%` }} /></div>
          <p className="relative mt-2 text-[12px] text-white/60">{nextTitle ? `再记录 ${summary?.remainingRecordDays} 天，驶向「${nextTitle.name}」` : '你的航程已抵达最远的海域'}</p>
        </section>
        <section className="mt-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[12px] font-semibold tracking-[.12em] text-white/45">BADGE CABINET</p>
              <h2 className="mt-1 text-[22px] font-extrabold">
                已获得
                {badges.filter(item => item.isUnlocked).length}
                {' '}
                枚徽章
              </h2>
            </div>
            <span className="text-[11px] text-white/50">轻触佩戴 · 最多 3 枚</span>
          </div>
          {active && (
            <button className="mt-4 flex w-full items-center gap-5 rounded-[22px] border border-white/10 bg-[#26334a] px-5 py-4 text-left" onClick={() => active.isUnlocked && void toggle(active.code)} type="button">
              <Emblem index={activeIndex} large locked={!active.isUnlocked} />
              <span className="min-w-0 flex-1">
                <span className="block text-[19px] font-extrabold">{active.name}</span>
                <span className="mt-1 block text-[12px] leading-5 text-white/55">{active.isUnlocked ? (displayed.includes(active.code) ? '正在展示于个人卡片' : '轻触这张卡片，展示在个人卡片') : active.requiredRecordDays ? `记录 ${active.progress}/${active.requiredRecordDays} 天` : active.requiredReviewMonths ? `复盘 ${active.progress}/${active.requiredReviewMonths} 月` : '完成对应航程后解锁'}</span>
              </span>
              {displayed.includes(active.code) && <Check className="text-[#8ee0f0]" size={20} />}
            </button>
          )}
          <div className="mt-5 grid grid-cols-3 gap-x-2 gap-y-6">
            {badges.map((badge, index) => (
              <button className={`flex min-w-0 flex-col items-center text-center ${badge.isUnlocked ? '' : 'opacity-40 grayscale'}`} disabled={!badge.isUnlocked} key={badge.code} onClick={() => setActiveCode(badge.code)} type="button">
                <span className={`relative rounded-[20px] px-1 pt-1 transition-transform duration-200 ${active?.code === badge.code ? '-translate-y-1 bg-white/10' : ''}`}>
                  <Emblem index={index} locked={!badge.isUnlocked} />
                  {displayed.includes(badge.code) && <span className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-full border-2 border-[#192130] bg-[#6fc2dc] text-[#192130]"><Check size={12} strokeWidth={3} /></span>}
                </span>
                <span className="mt-2 max-w-full truncate px-1 text-[13px] font-bold">{badge.name}</span>
                <span className="mt-0.5 text-[10px] text-white/45">{badge.isUnlocked ? '已获得' : '未解锁'}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

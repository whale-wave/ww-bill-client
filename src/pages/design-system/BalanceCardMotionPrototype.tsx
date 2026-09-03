import { Archive, ChevronLeft, ChevronRight, CreditCard, Landmark } from 'lucide-react';
import { m } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { MotionProvider, useMotionPreference } from '@/shared/ui';

type MotionPrototypeVariant = 'archive' | 'asset' | 'record';

const variants: Array<{
  description: string;
  id: MotionPrototypeVariant;
  label: string;
  title: string;
}> = [
  {
    id: 'record',
    label: 'A · 账户卡组',
    title: '账户卡组进入钱包',
    description: '进入时自动收拢卡组；点击钱包后，三张账户卡会依次展开供完整查看。',
  },
  {
    id: 'archive',
    label: 'B · 月账单归档',
    title: '账单归入月份文件夹',
    description: '适用于生成或保存月账单，不适合高频的日常切换。',
  },
  {
    id: 'asset',
    label: 'C · 新增资产账户',
    title: '银行卡归入资产卡组',
    description: '适用于连接账户后的确认，借用参考视频里最接近的卡片收纳语言。',
  },
];

function isVariant(value: string | null): value is MotionPrototypeVariant {
  return variants.some(variant => variant.id === value);
}

function getInitialVariant(): MotionPrototypeVariant {
  const value = new URLSearchParams(window.location.search).get('motion-prototype');
  return isVariant(value) ? value : 'record';
}

function updateVariantInUrl(variant: MotionPrototypeVariant) {
  const url = new URL(window.location.href);
  url.searchParams.set('motion-prototype', variant);
  window.history.replaceState(null, '', url);
}

function RecordSuccessVariant({ replayKey }: { replayKey: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const accountCards = [
    { background: 'linear-gradient(135deg, #8291f4, #5d69d2)', color: '#ffffff', label: '鲸浪储蓄', value: '¥ 12,480', y: 18 },
    { background: '#ffffff', color: '#1c2b3d', label: '日常消费', value: '¥ 4,620', y: 52 },
    { background: 'linear-gradient(135deg, #d7f0f1, #a8d3dc)', color: '#21485c', label: '旅行备用金', value: '¥ 3,280', y: 86 },
  ] as const;

  return (
    <m.button
      animate={{ height: isExpanded ? 470 : 326 }}
      aria-expanded={isExpanded}
      aria-label={isExpanded ? '收起账户卡组' : '展开账户卡组'}
      className="relative block w-full overflow-hidden rounded-[32px] border-0 bg-[#f7f2ec] p-0 text-left shadow-[0_20px_42px_rgb(31_35_43_/_18%)]"
      onClick={() => setIsExpanded(value => !value)}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      type="button"
    >
      <m.div
        animate={isExpanded ? { height: 98, y: 0 } : { height: [164, 222, 268], y: [122, 34, 0] }}
        className="absolute bottom-5 left-5 right-5 z-[1] rounded-[34px] bg-[#07080b] shadow-[0_16px_24px_rgb(0_0_0_/_22%)]"
        initial={{ height: 164, y: 122 }}
        key={`wallet-back-${replayKey}`}
        transition={{ duration: 0.94, ease: [0.22, 1, 0.36, 1], times: [0, 0.54, 1] }}
      />
      {accountCards.map((card, index) => (
        <m.div
          animate={{
            opacity: isExpanded ? 1 : [0, 1, 1],
            rotate: isExpanded ? [0, (index - 1) * 2, 0] : [0, (index - 1) * 3.5, 0],
            rotateX: isExpanded ? 0 : [-14, 0, 0],
            scale: isExpanded ? [1, 1.012, 1] : [0.88, 1.025, 1],
            x: isExpanded ? [0, (index - 1) * 5, 0] : [0, (index - 1) * 7, 0],
            y: isExpanded ? [card.y, card.y - 10, index * 138] : [142, 22, card.y],
          }}
          className="absolute left-10 right-10 top-5 h-[128px] rounded-[24px] px-5 py-4 shadow-[0_13px_24px_rgb(30_41_59_/_20%)]"
          initial={{ opacity: 0, rotate: 0, rotateX: -14, scale: 0.88, x: 0, y: 142 }}
          key={`${card.label}-${replayKey}`}
          style={{ background: card.background, color: card.color, transformOrigin: '50% 100%', zIndex: 4 + index }}
          transition={{ delay: isExpanded ? index * 0.12 : index * 0.06, duration: isExpanded ? 0.68 : 1.2, ease: [0.22, 1, 0.36, 1], times: [0, 0.48, 1] }}
        >
          <div className="flex items-center justify-between text-[10px] font-black tracking-[0.05em]">
            <span className={index === 0 ? 'text-white/90' : 'opacity-80'}>WHALER WAVE</span>
            <CreditCard size={15} strokeWidth={2.25} />
          </div>
          <div className="mt-8 flex items-end justify-between">
            <div>
              <div className="text-[11px] font-black">{card.label}</div>
              <div className="mt-1 font-number text-[21px] font-black tracking-[-0.045em]">{card.value}</div>
            </div>
            <span className="mb-1 text-[10px] font-bold opacity-65">•• 1024</span>
          </div>
        </m.div>
      ))}

      <m.svg
        animate={isExpanded ? { opacity: 0, y: 198 } : { opacity: [0, 1, 1], y: [150, 78, 35] }}
        className="absolute bottom-5 left-5 right-5 z-[8] h-[184px] w-[calc(100%-40px)]"
        initial={{ opacity: 0, y: 150 }}
        key={`wallet-front-${replayKey}`}
        preserveAspectRatio="none"
        viewBox="0 0 320 184"
        transition={{ delay: isExpanded ? 0 : 0.46, duration: 0.9, ease: [0.22, 1, 0.36, 1], times: [0, 0.6, 1] }}
      >
        <path d="M0 0H61C66 0 68 2 70 7C77 23 92 31 114 31H206C228 31 243 23 250 7C252 2 254 0 259 0H320V184H0V0Z" fill="#07080b" />
      </m.svg>
      <m.div
        animate={isExpanded ? { opacity: 0, y: 8 } : { opacity: [0, 0, 1], y: [10, 10, 0] }}
        className="absolute bottom-9 left-9 right-9 text-white"
        initial={{ opacity: 0, y: 10 }}
        key={`wallet-total-${replayKey}`}
        style={{ zIndex: 20 }}
        transition={{ delay: isExpanded ? 0 : 0.46, duration: 1.1, ease: [0.22, 1, 0.36, 1], times: [0, 0.74, 1] }}
      >
        <div className="font-number text-[28px] font-black tracking-[-0.05em]">¥ 20,380.00</div>
        <div className="mt-0.5 text-[10px] font-bold text-white/52">3 张账户卡 · 总余额</div>
      </m.div>
      {isExpanded && (
        <m.div
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-0 right-0 z-20 text-center text-[11px] font-black text-[#354c63]"
          initial={{ opacity: 0, y: 8 }}
          transition={{ delay: 0.45, duration: 0.2 }}
        >
          点击卡组即可收起
        </m.div>
      )}
    </m.button>
  );
}

function MonthlyArchiveVariant({ replayKey }: { replayKey: number }) {
  return (
    <div className="relative h-[272px] overflow-hidden rounded-[28px] bg-[#e9f3f6] p-5 shadow-[0_18px_36px_rgb(34_87_108_/_16%)]">
      <div className="absolute inset-x-5 bottom-5 top-[72px] rounded-t-[24px] border border-[#a6c8d3] bg-[#c8e2e9]" />
      <div className="absolute left-[31px] right-[31px] top-[58px] h-[28px] rounded-t-[18px] border border-[#93c0ce] bg-[#b4dbe5]" />
      <m.div
        animate={{ opacity: [0, 1, 1], rotateX: [-70, 0, 0], scale: [0.9, 1, 0.96], y: [-58, -2, 58] }}
        className="absolute left-[31px] right-[31px] top-5 rounded-[18px] bg-white px-4 py-3 text-ww-ink shadow-[0_10px_18px_rgb(58_95_108_/_16%)]"
        initial={{ opacity: 0, rotateX: -70, scale: 0.9, y: -58 }}
        key={replayKey}
        style={{ transformOrigin: '50% 100%' }}
        transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1], times: [0, 0.2, 1] }}
      >
        <div className="flex items-center justify-between text-[10px] font-black text-primary-deep">
          <span>2026 · 09 月账单</span>
          <Archive size={15} />
        </div>
        <div className="mt-4 flex items-end justify-between">
          <span className="font-number text-[22px] font-black">¥ 5,915.50</span>
          <span className="text-[10px] font-bold text-ww-mid">本月支出</span>
        </div>
      </m.div>
      <div className="absolute bottom-9 left-9 right-9 flex items-center gap-2 text-[12px] font-black text-primary-deep">
        <Archive size={17} />
        <span>2026 年 09 月</span>
      </div>
    </div>
  );
}

function AssetStackVariant({ replayKey }: { replayKey: number }) {
  return (
    <div className="relative h-[272px] overflow-hidden rounded-[28px] bg-[#1e2938] p-5 shadow-[0_18px_36px_rgb(14_31_47_/_25%)]">
      <div className="absolute bottom-5 left-5 right-5 top-[116px] rounded-[24px] bg-[#111923]" />
      <div className="absolute left-[30px] right-[30px] top-[99px] h-[94px] rounded-[22px] border border-white/10 bg-[#23384c]" />
      <m.div
        animate={{ opacity: [0, 1, 1], rotate: [-4, 0, 0], rotateX: [-32, 0, 0], scale: [0.9, 1, 0.94], y: [-80, -10, 73] }}
        className="absolute left-[30px] right-[30px] top-5 rounded-[22px] bg-[linear-gradient(135deg,#71cee2,#3d94bb)] p-4 text-[#123346] shadow-[0_12px_20px_rgb(7_45_69_/_30%)]"
        initial={{ opacity: 0, rotate: -4, rotateX: -32, scale: 0.9, y: -80 }}
        key={replayKey}
        style={{ transformOrigin: '50% 100%' }}
        transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1], times: [0, 0.18, 1] }}
      >
        <div className="flex items-center justify-between text-[10px] font-black">
          <span>WHALER WAVE</span>
          <CreditCard size={16} />
        </div>
        <div className="mt-7 flex items-end justify-between">
          <span className="font-number text-[22px] font-black">¥ 12,480</span>
          <span className="text-[10px] font-bold">储蓄卡</span>
        </div>
      </m.div>
      <div className="absolute bottom-8 left-9 right-9 flex items-center justify-between text-white">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-white/62">
          <Landmark size={16} />
          资产账户
        </span>
        <span className="font-number text-[17px] font-black">¥ 38,240</span>
      </div>
    </div>
  );
}

function PrototypeSwitcher({ current, onChange }: { current: MotionPrototypeVariant; onChange: (variant: MotionPrototypeVariant) => void }) {
  const index = variants.findIndex(variant => variant.id === current);
  const selectOffset = useCallback(
    (offset: number) => onChange(variants[(index + offset + variants.length) % variants.length]!.id),
    [index, onChange],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, [contenteditable="true"]'))
        return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        selectOffset(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        selectOffset(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectOffset]);

  return (
    <div className="fixed bottom-[max(18px,env(safe-area-inset-bottom))] left-1/2 z-[220] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-[#17202d]/95 p-1.5 text-white shadow-[0_12px_32px_rgb(10_20_34_/_32%)] backdrop-blur-xl">
      <button aria-label="上一个动效样板" className="flex h-10 w-10 items-center justify-center rounded-full border-0 bg-white/8 text-white" onClick={() => selectOffset(-1)} type="button"><ChevronLeft size={18} /></button>
      <span className="min-w-[142px] text-center text-[11px] font-black">{variants[index]!.label}</span>
      <button aria-label="下一个动效样板" className="flex h-10 w-10 items-center justify-center rounded-full border-0 bg-white/8 text-white" onClick={() => selectOffset(1)} type="button"><ChevronRight size={18} /></button>
    </div>
  );
}

function MotionPrototypeContent() {
  const [variant, setVariant] = useState<MotionPrototypeVariant>(getInitialVariant);
  const [replayKey, setReplayKey] = useState(0);
  const { isMotionEnabled } = useMotionPreference();
  const current = variants.find(item => item.id === variant)!;

  const selectVariant = (nextVariant: MotionPrototypeVariant) => {
    updateVariantInUrl(nextVariant);
    setVariant(nextVariant);
    setReplayKey(current => current + 1);
  };

  const content = variant === 'record'
    ? <RecordSuccessVariant key={replayKey} replayKey={replayKey} />
    : variant === 'archive'
      ? <MonthlyArchiveVariant replayKey={replayKey} />
      : <AssetStackVariant replayKey={replayKey} />;

  return (
    <div className="min-h-screen bg-[#eef2f5] px-[18px] pb-28 pt-8 text-ww-ink">
      <main className="mx-auto max-w-[430px]">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary-deep">Motion prototype · dev only</p>
        <h1 className="mt-3 text-[27px] font-black tracking-[-0.04em]">{current.title}</h1>
        <p className="mt-2 max-w-[310px] text-[13px] leading-5 text-ww-mid">{current.description}</p>
        <div className="mt-8 [perspective:900px]">{content}</div>
        <button className="mt-5 flex h-12 w-full items-center justify-center rounded-[18px] border-0 bg-primary text-[14px] font-black text-white shadow-[0_10px_18px_rgb(41_136_170_/_25%)]" onClick={() => setReplayKey(current => current + 1)} type="button">
          {isMotionEnabled ? '重新播放动效' : '减弱动效：显示终态'}
        </button>
        <p className="mt-4 text-center text-[11px] leading-4 text-ww-soft">← / → 也可切换场景；此样板不会写入任何业务数据。</p>
      </main>
      <PrototypeSwitcher current={variant} onChange={selectVariant} />
    </div>
  );
}

/**
 * PROTOTYPE — Which one-time confirmation placement best fits the card-fold motion?
 * Three development-only variants, switchable by ?motion-prototype=record|archive|asset.
 */
export function BalanceCardMotionPrototype() {
  return <MotionProvider enabled><MotionPrototypeContent /></MotionProvider>;
}

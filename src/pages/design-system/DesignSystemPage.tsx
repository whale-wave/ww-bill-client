/* eslint-disable style/max-statements-per-line */

import type { StudioToken, StudioTokenOverrides } from './token-registry';
import type { AppearanceTemplate } from '@/entities/user-app-config';
import { Input, Popup, Toast } from 'antd-mobile';
import { BarChart3, Bell, ChevronRight, Compass, Copy, CreditCard, House, Layers3, LayoutGrid, Plus, ReceiptText, RotateCcw, Search, Settings2, Sparkles, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CategoryIcon } from '@/entities/category';
import { RecordOverviewPresentation } from '@/entities/record';
import { UserSummaryCard } from '@/entities/user';
import { applyAppearancePreference } from '@/features/appearance';
import { ChartOverviewContext, ChartOverviewPresentation } from '@/features/chart-overview';
import { AppButton, BottomTabBarPresentation, FormField, Surface } from '@/shared/ui';
import { BalanceCardMotionPrototype } from './BalanceCardMotionPrototype';
import { channelsToColor, colorToChannels, createThemeCss, createThemeExport, filterValidStudioOverrides, getDependentOverrides, isValidTokenValue, readStudioDrafts, STUDIO_TOKENS, writeStudioDrafts } from './token-registry';
import './design-system.scss';

const templates: readonly AppearanceTemplate[] = ['glass', 'fresh', 'minimal'];
const labels: Record<AppearanceTemplate, string> = { glass: '玻璃鲸浪', fresh: '清新海风', minimal: '极简沉静' };
const previewUrl = `${window.location.pathname}?design-system-preview=1`;
const navigationItems: Array<{ icon: typeof LayoutGrid; label: string }> = [
  { icon: LayoutGrid, label: '业务场景' },
  { icon: Layers3, label: '基础组件' },
  { icon: CreditCard, label: '表单与操作' },
  { icon: Settings2, label: '导航与反馈' },
];
interface ThemeMessage { type: 'ww-design-studio:theme'; template: AppearanceTemplate; overrides: StudioTokenOverrides }

function sendTheme(target: Window | null, template: AppearanceTemplate, overrides: StudioTokenOverrides) {
  target?.postMessage({ type: 'ww-design-studio:theme', template, overrides } satisfies ThemeMessage, window.location.origin);
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value).then(
    () => Toast.show({ content: '已复制到剪贴板' }),
    () => Toast.show({ content: '复制失败，请手动选择文本' }),
  );
}

function getColorInputValue(token: StudioToken, value: string, defaultValue: string): string {
  const resolvedValue = value || defaultValue;
  if (token.kind === 'channel-color')
    return channelsToColor(resolvedValue) ?? (token.name.includes('income') || token.name.includes('success') ? channelsToColor('42 148 96')! : channelsToColor('192 72 112')!);
  return /^#[\da-f]{6}$/i.test(resolvedValue) ? resolvedValue : channelsToColor('63 159 190')!;
}

function getColorOverrideValue(token: StudioToken, value: string): string {
  return token.kind === 'channel-color' ? colorToChannels(value) ?? '' : value;
}

function ChartPreview() {
  const [currentRange, setCurrentRange] = useState<'week' | 'month' | 'year'>('week');
  const [amountType, setAmountType] = useState<'add' | 'sub'>('sub');
  const [tabActive, setTabActive] = useState('week-1');
  const contextValue = {
    currentAmountType: amountType,
    currentTimeRangeCategory: currentRange,
    tabActive,
    tabs: [{ key: 'week-1', name: '9/1 - 9/7' }, { key: 'week-2', name: '9/8 - 9/14' }],
    curTab: {
      key: tabActive,
      name: '9/1 - 9/7',
      amount: 5915.5,
      average: '845.07',
      data: [
        { value: '2026-09-01', displayLabel: '一', amount: 480, data: [] },
        { value: '2026-09-02', displayLabel: '二', amount: 620, data: [] },
        { value: '2026-09-03', displayLabel: '三', amount: 90, data: [] },
        { value: '2026-09-04', displayLabel: '四', amount: 850, data: [] },
        { value: '2026-09-05', displayLabel: '五', amount: 410, data: [] },
      ],
      ranking: [],
    },
    setTabActive,
    setCurrentTimeRangeCategory: setCurrentRange,
    setCurrentAmountType: setAmountType,
  };
  return (
    <ChartOverviewContext.Provider value={contextValue}>
      <ChartOverviewPresentation />
    </ChartOverviewContext.Provider>
  );
}

function BookkeepingPreview() {
  const [remark, setRemark] = useState('和朋友吃饭');
  const [amount, setAmount] = useState('86.00');
  return (
    <div className="page-new px-[22px] pb-24 pt-5">
      <div className="flex items-center justify-between">
        <button className="flex h-11 w-11 items-center justify-center rounded-full border border-border-primary bg-ww-surface-raised text-ww-mid" type="button">×</button>
        <span className="rounded-full bg-primary-light px-4 py-2 text-[13px] font-bold text-primary-deep">餐饮</span>
      </div>
      <div className="mt-10 text-center">
        <p className="text-[12px] font-bold text-ww-mid">支出金额</p>
        <div className="mt-2 font-number text-[48px] font-black text-ww-ink">
          ¥
          {amount || '0.00'}
        </div>
      </div>
      <Surface className="mt-8 p-4" material="content">
        <FormField label="备注" onChange={setRemark} placeholder="写点什么…" value={remark} />
        <div className="mt-4 grid grid-cols-3 gap-2">{['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(value => <AppButton className="h-12 !px-0 text-[18px]" key={value} onClick={() => setAmount(current => `${current}${value}`)} variant="secondary">{value}</AppButton>)}</div>
      </Surface>
      <AppButton className="mt-4" fullWidth>完成记账</AppButton>
    </div>
  );
}

function MinePreview() {
  const [checkedIn, setCheckedIn] = useState(false);
  return (
    <div className="page-new space-y-4 px-[18px] pb-24 pt-6">
      <UserSummaryCard checkIn={checkedIn} name="鲸浪体验员" numberInfo={{ checkInAll: 28, checkInKeep: 7, recordCount: 168 }} onCheckIn={() => setCheckedIn(true)} onProfileClick={() => undefined} />
      <Surface className="divide-y divide-border-primary px-4" material="content">
        {['外观设置', '通知与提醒', '数据导出'].map(label => (
          <button className="flex h-14 w-full items-center justify-between border-0 bg-transparent text-left text-[14px] font-bold text-ww-ink" key={label} type="button">
            {label}
            <ChevronRight size={17} className="text-ww-soft" />
          </button>
        ))}
      </Surface>
    </div>
  );
}

function StudioPreview() {
  const [template, setTemplate] = useState<AppearanceTemplate>('glass');
  const [overrides, setOverrides] = useState<StudioTokenOverrides>({});
  const [activeTab, setActiveTab] = useState('detail');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const isMotionPrototype = new URLSearchParams(window.location.search).has('motion-prototype');
  useEffect(() => {
    const receive = (event: MessageEvent<ThemeMessage>) => { if (event.origin === window.location.origin && event.data?.type === 'ww-design-studio:theme') { setTemplate(event.data.template); setOverrides(event.data.overrides); } };
    window.addEventListener('message', receive); window.parent.postMessage({ type: 'ww-design-studio:ready' }, window.location.origin); return () => window.removeEventListener('message', receive);
  }, []);
  useEffect(() => {
    applyAppearancePreference({ template });
    const validOverrides = filterValidStudioOverrides(overrides);
    Object.entries(validOverrides).forEach(([name, value]) => {
      if (typeof value === 'string')
        document.documentElement.style.setProperty(name, value);
    });
    return () => Object.keys(validOverrides).forEach(name => document.documentElement.style.removeProperty(name));
  }, [overrides, template]);
  useEffect(() => {
    const values = Object.fromEntries(STUDIO_TOKENS.map(token => [token.name, getComputedStyle(document.documentElement).getPropertyValue(token.name).trim()]));
    window.parent.postMessage({ type: 'ww-design-studio:defaults', values }, window.location.origin);
  }, [overrides, template]);
  return (
    <div className="page-new relative overflow-hidden pb-24" data-design-studio-preview>
      {isMotionPrototype && <BalanceCardMotionPrototype />}
      {!isMotionPrototype && activeTab === 'detail' && (
        <RecordOverviewPresentation
          groups={[{ key: '2026-09-03', dateLabel: '09/03 周三', summaries: [{ key: 'expense', label: '支出', value: '¥90.00' }], records: [{ id: 'lunch', iconName: 'food', categoryName: '餐饮', primary: '和朋友吃饭', overviewSecondary: '午餐 · 3 人', amount: '¥86.00', amountTone: 'expense' }, { id: 'metro', iconName: 'traffic', categoryName: '交通', primary: '地铁通勤', amount: '¥4.00', amountTone: 'expense' }] }]}
          header={{ actions: <button aria-label="通知" className="border-border-primary bg-ww-surface text-primary-deep shadow-ww-xs" onClick={() => setIsPopupVisible(true)} type="button"><Bell size={19} /></button>, metrics: [{ key: 'income', label: '收入', value: '¥ 8,600' }, { key: 'expense', label: '支出', value: '¥ 5,915.50' }], period: { label: '账单周期', value: <span className="font-number text-[30px] font-black">¥ 2,684.50</span> }, renderTitle: className => <h1 className={className}>我的账本</h1>, shortcuts: [{ key: 'food', label: '餐饮', icon: '🍜', onClick: () => setIsPopupVisible(true) }, { key: 'traffic', label: '出行', icon: '🚇', onClick: () => setIsPopupVisible(true) }, { key: 'shopping', label: '购物', icon: '🛍️', onClick: () => setIsPopupVisible(true) }], titleIcon: <WalletCards size={17} />, titleAlignment: 'start' }}
          renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
          state="ready"
        />
      )}
      {!isMotionPrototype && activeTab === 'chart' && <ChartPreview />}
      {!isMotionPrototype && activeTab === 'create' && <BookkeepingPreview />}
      {!isMotionPrototype && activeTab === 'discovery' && (
        <div className="page-new px-[18px] pb-24 pt-6">
          <Surface className="p-5" material="raised">
            <Compass className="text-primary-deep" size={24} />
            <h2 className="mt-4 text-[20px] font-black text-ww-ink">发现</h2>
            <p className="mt-2 text-[13px] leading-5 text-ww-mid">静态样板保留正式应用的五页导航结构。</p>
          </Surface>
        </div>
      )}
      {!isMotionPrototype && activeTab === 'mine' && <MinePreview />}
      {!isMotionPrototype && <BottomTabBarPresentation activeKey={activeTab} ariaLabel="演示底部导航" items={[{ key: 'detail', label: '明细', icon: <ReceiptText />, onSelect: () => setActiveTab('detail') }, { key: 'chart', label: '图表', icon: <BarChart3 />, onSelect: () => setActiveTab('chart') }, { key: 'create', label: '记账', icon: <Plus />, prominent: true, onSelect: () => setActiveTab('create') }, { key: 'discovery', label: '发现', icon: <Compass />, onSelect: () => setActiveTab('discovery') }, { key: 'mine', label: '我的', icon: <House />, onSelect: () => setActiveTab('mine') }]} />}
      {!isMotionPrototype && (
        <Popup bodyClassName="ww-app-bottom-sheet" destroyOnClose position="bottom" visible={isPopupVisible} onMaskClick={() => setIsPopupVisible(false)}>
          <div className="p-5">
            <div className="mx-auto h-1 w-10 rounded-full bg-ww-soft/40" />
            <h2 className="mt-4 text-[18px] font-black text-ww-ink">提醒与浮层</h2>
            <p className="mt-1 text-[13px] leading-5 text-ww-mid">这里的弹层与底栏都在隔离预览里，能直接观察 token 的影响。</p>
            <AppButton className="mt-5" fullWidth onClick={() => setIsPopupVisible(false)}>知道了</AppButton>
          </div>
        </Popup>
      )}
    </div>
  );
}

export default function DesignSystemPage() {
  return new URLSearchParams(window.location.search).has('design-system-preview') ? <StudioPreview /> : <StudioConsole />;
}

function StudioConsole() {
  const [template, setTemplate] = useState<AppearanceTemplate>('glass'); const [drafts, setDrafts] = useState(() => readStudioDrafts()); const [query, setQuery] = useState(''); const [width, setWidth] = useState<375 | 430>(375); const [fallback, setFallback] = useState(''); const [defaults, setDefaults] = useState<StudioTokenOverrides>({}); const frameRef = useRef<HTMLIFrameElement>(null); const overrides = useMemo(() => drafts[template] ?? {}, [drafts, template]); const effectiveOverrides = useMemo(() => filterValidStudioOverrides(overrides), [overrides]); const changedCount = Object.keys(overrides).length;
  const visibleTokens = useMemo(() => STUDIO_TOKENS.filter(token => `${token.title} ${token.name} ${token.description}`.toLowerCase().includes(query.toLowerCase())), [query]);
  useEffect(() => { writeStudioDrafts(drafts); }, [drafts]); useEffect(() => { sendTheme(frameRef.current?.contentWindow ?? null, template, effectiveOverrides); }, [effectiveOverrides, template]);
  useEffect(() => {
    const receive = (event: MessageEvent<{ type?: string; values?: StudioTokenOverrides }>) => {
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.type === 'ww-design-studio:ready')
        sendTheme(frameRef.current?.contentWindow ?? null, template, effectiveOverrides);
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.type === 'ww-design-studio:defaults')
        setDefaults(event.data.values ?? {});
    }; window.addEventListener('message', receive); return () => window.removeEventListener('message', receive);
  }, [effectiveOverrides, template]);
  const update = (name: string, value: string) => setDrafts((current) => {
    const next = { ...current[template], [name]: value, ...getDependentOverrides(name, value) };
    return { ...current, [template]: next };
  });
  const reset = (token: StudioToken) => setDrafts((current) => {
    const next = { ...(current[template] ?? {}) };
    delete next[token.name];
    token.dependsOn?.forEach(name => delete next[name]);
    return { ...current, [template]: next };
  });
  const resetAll = () => setDrafts(current => ({ ...current, [template]: {} }));
  const exportValue = (format: 'css' | 'json') => format === 'css' ? createThemeCss(template, effectiveOverrides) : JSON.stringify(createThemeExport(template, effectiveOverrides), null, 2);
  const copy = (format: 'css' | 'json') => { const value = exportValue(format); setFallback(value); copyText(value); };
  return (
    <div data-design-studio-shell>
      <header className="design-studio__header px-5 py-3">
        <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-primary text-white"><Sparkles size={18} /></span>
            <div>
              <p className="text-[15px] font-black">鲸浪主题工坊</p>
              <p className="text-[11px] text-fg-muted">内部调试 · 不会读写账号外观</p>
            </div>
          </div>
          <span className="hidden rounded-full bg-action-primary/10 px-3 py-1 text-[11px] font-bold text-primary-deep sm:inline">本地草稿已自动保存</span>
        </div>
      </header>
      <div className="design-studio__grid">
        <aside className="design-studio__rail design-studio__panel p-3">
          <p className="px-2 pb-2 pt-1 text-[11px] font-black uppercase tracking-[.14em] text-fg-muted">内置主题</p>
          {templates.map(value => (
            <button className="design-studio__template mb-1 flex w-full items-center gap-3 rounded-[14px] border border-transparent px-2 py-2 text-left" data-selected={template === value} key={value} onClick={() => setTemplate(value)} type="button">
              <span className="h-9 w-9 rounded-[11px] bg-primary-light" />
              <span>
                <span className="block text-[13px] font-extrabold">{labels[value]}</span>
                <span className="block text-[10px] text-fg-muted">{value}</span>
              </span>
            </button>
          ))}
          <div className="mt-5 border-t border-stroke/10 pt-4">
            <p className="px-2 text-[11px] font-black uppercase tracking-[.14em] text-fg-muted">预览目录</p>
            {navigationItems.map(({ icon: ItemIcon, label }) => {
              return (
                <a className="mt-2 flex items-center gap-2 rounded-lg px-2 py-2 text-[12px] font-bold text-fg hover:bg-action-primary/10" href="#preview" key={String(label)}>
                  <ItemIcon size={15} />
                  {label}
                </a>
              );
            })}
          </div>
        </aside>
        <main id="preview" className="design-studio__panel min-w-0 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-[17px] font-black">真实组件预览</h1>
              <p className="mt-1 text-[12px] text-fg-muted">模拟账单数据，交互只在预览内发生</p>
            </div>
            <div className="flex rounded-full bg-action-primary/10 p-1">
              {([375, 430] as const).map(value => (
                <button aria-pressed={width === value} className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold ${width === value ? 'bg-ww-surface-raised text-primary-deep shadow-sm' : 'text-fg-muted'}`} key={value} onClick={() => setWidth(value)} type="button">
                  {value}
                  px
                </button>
              ))}
            </div>
          </div>
          <div className="design-studio__frame-wrap" style={{ width }}><iframe className="design-studio__frame" onLoad={() => sendTheme(frameRef.current?.contentWindow ?? null, template, effectiveOverrides)} ref={frameRef} src={previewUrl} title="鲸浪主题实时预览" /></div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-fg-muted">
            <span className="rounded-xl bg-action-primary/10 p-3">✓ 业务场景：账单、预算、资产、图表</span>
            <span className="rounded-xl bg-action-primary/10 p-3">✓ 状态：输入、禁用、弹层、导航</span>
          </div>
        </main>
        <aside className="design-studio__editor design-studio__panel p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[16px] font-black">Token 调试</h2>
              <p className="mt-1 text-[11px] text-fg-muted">
                {changedCount}
                {' '}
                项覆盖 ·
                {' '}
                {labels[template]}
              </p>
            </div>
            <button aria-label="重置当前主题" className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-action-primary/10 text-primary-deep" onClick={resetAll} type="button"><RotateCcw size={16} /></button>
          </div>
          <label className="mt-4 flex h-10 items-center gap-2 rounded-[12px] border border-stroke/20 bg-ww-surface-raised px-3">
            <Search size={15} className="text-fg-muted" />
            <Input className="text-[12px]" onChange={setQuery} placeholder="搜索 token" value={query} />
          </label>
          <div className="mt-4 space-y-3">
            {visibleTokens.map((token) => {
              const value = overrides[token.name] ?? ''; const isCustomValueValid = !value || isValidTokenValue(token, value); return (
                <div className="rounded-[14px] bg-action-primary/10 p-3" key={token.name}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[12px] font-extrabold">{token.title}</p>
                      <p className="mt-0.5 text-[10px] text-fg-muted">{token.description}</p>
                    </div>
                    {value && <button className="text-[10px] font-bold text-primary-deep" onClick={() => reset(token)} type="button">恢复</button>}
                  </div>
                  <div className="mt-2">
                    {(token.kind === 'color' || token.kind === 'channel-color') && (
                      <label className="flex h-9 items-center gap-2 rounded-lg border border-stroke/20 bg-ww-surface-raised px-2 text-[11px] font-bold text-fg" htmlFor={token.name}>
                        <input aria-label={`${token.title} 颜色`} className="h-6 w-8 rounded border-0 bg-transparent p-0" id={token.name} onChange={event => update(token.name, getColorOverrideValue(token, event.target.value))} type="color" value={getColorInputValue(token, value, defaults[token.name] ?? '')} />
                        <span>{value ? '已覆盖' : '使用模板默认'}</span>
                      </label>
                    )}
                    {token.kind === 'slider' && (
                      <label className="flex items-center gap-3" htmlFor={token.name}>
                        <input aria-label={token.title} className="min-w-0 flex-1 accent-primary" id={token.name} max={token.max} min={token.min} onChange={event => update(token.name, `${event.target.value}${token.unit ?? ''}`)} step={token.step} type="range" value={Number.parseFloat(value || defaults[token.name] || String(token.min))} />
                        <span className="w-10 text-right font-number text-[11px] font-black text-primary-deep">{value || defaults[token.name] || '默认'}</span>
                      </label>
                    )}
                    {token.kind === 'select' && (
                      <select aria-label={token.title} className="h-9 w-full rounded-lg border border-stroke/20 bg-ww-surface-raised px-2 text-[11px] font-bold text-fg outline-none focus:border-primary" onChange={event => event.target.value && update(token.name, event.target.value)} value={value}>
                        <option value="">使用模板默认</option>
                        {token.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    )}
                  </div>
                  <p className="mt-1 truncate font-mono text-[9px] text-fg-muted">
                    {token.name}
                    {token.dependsOn ? ' · 自动同步关联语义色' : ''}
                  </p>
                  <details className="mt-1 text-[10px] text-fg-muted">
                    <summary className="cursor-pointer font-bold text-primary-deep">输入自定义值</summary>
                    <input aria-invalid={!isCustomValueValid} aria-label={`${token.title} 自定义值`} className="mt-2 h-8 w-full rounded-lg border border-stroke/20 bg-ww-surface-raised px-2 font-mono text-[10px] outline-none focus:border-primary" onChange={event => update(token.name, event.target.value)} placeholder="遵循当前 token 的值类型" value={value} />
                    {!isCustomValueValid && <p className="mt-1 text-feedback-danger">格式无效，预览会保留最近一次有效值</p>}
                  </details>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="flex h-10 items-center justify-center gap-1 rounded-[12px] border border-stroke/20 bg-ww-surface-raised text-[11px] font-extrabold text-primary-deep" onClick={() => copy('json')} type="button">
              <Copy size={14} />
              复制 JSON
            </button>
            <button className="flex h-10 items-center justify-center gap-1 rounded-[12px] border-0 bg-primary text-[11px] font-extrabold text-white" onClick={() => copy('css')} type="button">
              <Copy size={14} />
              复制 CSS
            </button>
          </div>
          {fallback && <textarea aria-label="导出内容" className="mt-3 h-24 w-full rounded-xl border border-stroke/20 bg-ww-surface-raised p-2 font-mono text-[10px]" readOnly value={fallback} />}
        </aside>
      </div>
    </div>
  );
}

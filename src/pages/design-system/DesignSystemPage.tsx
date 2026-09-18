import type { StudioInspectorSelection } from './PreviewElementInspector';
/* eslint-disable style/max-statements-per-line */

import type { StudioDebugRecord, StudioTemplate, StudioToken, StudioTokenOverrides } from './token-registry';
import { Input } from 'antd-mobile';
import dayjs from 'dayjs';
import { BarChart3, BookmarkPlus, CalendarDays, ChevronLeft, ChevronRight, Compass, Copy, CreditCard, Crosshair, House, Layers3, LayoutGrid, MessageCircleMore, Plus, ReceiptText, RotateCcw, Search, Settings2, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AssetSummaryCardPresentation } from '@/entities/asset';
import { CurrentMonthBillCard } from '@/entities/bill';
import { CurrentBudgetSummaryCardPresentation } from '@/entities/budget';
import { CategoryIcon } from '@/entities/category';
import { RecordMonthPicker, RecordOverviewPresentation } from '@/entities/record';
import { UserSummaryCard } from '@/entities/user';
import { applyAppearancePreference } from '@/features/appearance';
import { ChartOverviewContext, ChartOverviewPresentation } from '@/features/chart-overview';
import AssetOverviewPreviewPage from '@/pages/asset/asset-chart/AssetOverviewPreviewPage';
import { ActionMenuCard, AppButton, AppDatePicker, AppSheet, BottomTabBarPresentation, confirmAppAction, DesignIcon, FormField, MotionProvider, SettingsListCard, SheetHeader, showAppActionSheet, Surface, useMotionPreference } from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';
import { BalanceCardMotionPrototype } from './BalanceCardMotionPrototype';
import { PreviewElementInspector } from './PreviewElementInspector';
import { StudioIosExtras, StudioIosField, StudioIosOverlay, StudioIosSegmented, StudioIosTabbar } from './StudioIosAdapters';
import { channelsToColor, colorToChannels, createStudioDebugRecord, createThemeCss, createThemeExport, filterValidStudioOverrides, getDependentOverrides, getStudioTemplateTokens, isValidTokenValue, readStudioDebugRecords, resolveStudioAppearanceTemplate, STUDIO_TEMPLATES, STUDIO_TOKENS, writeStudioDebugRecords } from './token-registry';
import './design-system.scss';

const templates = STUDIO_TEMPLATES;
const konstaIosLabel: Record<'konsta-ios', string> = { 'konsta-ios': 'Konsta iOS · 候选' };
const labels: Record<StudioTemplate, string> = { glass: '玻璃鲸浪', fresh: '清新海风', minimal: '极简沉静', mono: 'MONO · 软黑紫', ...konstaIosLabel };
const previewTabKeys = ['showcase', 'detail', 'chart', 'create', 'discovery', 'mine', 'asset-overview'] as const;
type PreviewTabKey = typeof previewTabKeys[number];
const navigationItems: Array<{ icon: typeof LayoutGrid; label: string; tab: PreviewTabKey }> = [
  { icon: Layers3, label: '风格组件', tab: 'showcase' },
  { icon: LayoutGrid, label: '业务场景', tab: 'detail' },
  { icon: CreditCard, label: '表单与操作', tab: 'create' },
  { icon: BarChart3, label: '导航示例', tab: 'asset-overview' },
  { icon: Settings2, label: '导航与反馈', tab: 'mine' },
];
interface ThemeMessage { type: 'ww-design-studio:theme'; template: StudioTemplate; overrides: StudioTokenOverrides }
interface InspectorModeMessage { type: 'ww-design-studio:inspect-mode'; enabled: boolean }
interface InspectorSelectionMessage { type: 'ww-design-studio:inspect-selection'; selection: StudioInspectorSelection }
interface InspectorExitMessage { type: 'ww-design-studio:inspect-exit' }
interface MotionMessage { type: 'ww-design-studio:motion'; reduced: boolean }
type StudioPreviewMessage = ThemeMessage | InspectorModeMessage | InspectorSelectionMessage | InspectorExitMessage;
type StudioConsoleMessage = StudioPreviewMessage | { type: 'ww-design-studio:ready' } | { type: 'ww-design-studio:defaults'; values: StudioTokenOverrides };

function sendTheme(target: Window | null, template: StudioTemplate, overrides: StudioTokenOverrides) {
  target?.postMessage({ type: 'ww-design-studio:theme', template, overrides } satisfies ThemeMessage, window.location.origin);
}

function sendInspectorMode(target: Window | null, enabled: boolean) {
  target?.postMessage({ type: 'ww-design-studio:inspect-mode', enabled } satisfies InspectorModeMessage, window.location.origin);
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value).then(
    () => undefined,
    () => showAppError(undefined, { message: '复制失败，请手动选择文本' }),
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

function readPreviewTab(): PreviewTabKey {
  const tab = window.location.hash.split('?')[1] ? new URLSearchParams(window.location.hash.split('?')[1]).get('tab') : null;
  return previewTabKeys.includes(tab as PreviewTabKey) ? tab as PreviewTabKey : 'detail';
}

function getPreviewUrl(tab: PreviewTabKey): string {
  return `${window.location.pathname}#/design-system/preview?tab=${tab}`;
}

function ChartPreview() {
  const [currentRange, setCurrentRange] = useState<'week' | 'month' | 'year'>('week');
  const [amountType, setAmountType] = useState<'add' | 'sub'>('sub');
  const [tabActive, setTabActive] = useState('this-week');
  const [displayMode, setDisplayMode] = useState<'line' | 'pie'>('line');
  const contextValue = {
    currentAmountType: amountType,
    currentTimeRangeCategory: currentRange,
    tabActive,
    displayMode,
    onDisplayModeChange: setDisplayMode,
    rankingInteraction: 'none' as const,
    tabs: [
      { key: 'week-31', name: '第31周' },
      { key: 'week-32', name: '第32周' },
      { key: 'week-33', name: '第33周' },
      { key: 'week-34', name: '第34周' },
      { key: 'last-week', name: '上周' },
      { key: 'this-week', name: '本周' },
    ],
    curTab: {
      key: tabActive,
      name: '本周',
      amount: 104.1,
      average: '14.87',
      data: [
        { value: '2026-09-01', displayLabel: '一', amount: 22, data: [] },
        { value: '2026-09-02', displayLabel: '二', amount: 31.6, data: [] },
        { value: '2026-09-03', displayLabel: '三', amount: 0, data: [] },
        { value: '2026-09-04', displayLabel: '四', amount: 0, data: [] },
        { value: '2026-09-05', displayLabel: '五', amount: 0, data: [] },
        { value: '2026-09-06', displayLabel: '六', amount: 0, data: [] },
        { value: '2026-09-07', displayLabel: '日', amount: 50.5, data: [] },
      ],
      ranking: [
        { category: { id: 'catering', icon: 'catering', name: '餐饮' }, amount: 78.6, percentage: '75.5', type: 'sub' as const },
        { category: { id: 'snacks', icon: 'snacks', name: '零食' }, amount: 13.5, percentage: '13.0', type: 'sub' as const },
      ],
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

function BookkeepingPreview({ isIos = false, onExit }: { isIos?: boolean; onExit: () => void }) {
  const [isPickingCategory, setIsPickingCategory] = useState(true);
  const [category, setCategory] = useState({ label: '餐饮', icon: 'food' });
  const [remark, setRemark] = useState('和朋友吃饭');
  const [amount, setAmount] = useState('86.00');
  const categories = [
    ['餐饮', 'food'],
    ['交通', 'traffic'],
    ['购物', 'shopping'],
    ['娱乐', 'entertainment'],
    ['数码', 'digital'],
    ['住房', 'housing'],
    ['零食', 'snacks'],
    ['日用', 'daily'],
    ['蔬菜', 'vegetables'],
    ['亲友', 'family'],
    ['水果', 'fruits'],
    ['运动', 'motion'],
    ['服饰', 'fress'],
    ['快递', 'express'],
    ['汽车', 'cars'],
    ['通讯', 'communication'],
    ['长辈', 'elder'],
    ['宠物', 'pet'],
    ['学习', 'study'],
    ['礼物', 'gift'],
    ['烟酒', 'alcohol'],
    ['居家', 'furniture'],
    ['社交', 'socializing'],
    ['办公', 'office'],
  ] as const;

  if (isPickingCategory) {
    return (
      <div className="page-new min-h-full px-4 pb-6 pt-4">
        <div className="flex items-center justify-between" data-studio-bookkeeping-category-header>
          <button aria-label="返回预览" className="flex h-11 w-11 items-center justify-center rounded-full border border-border-primary bg-ww-surface-raised text-ww-ink shadow-ww-xs" onClick={onExit} type="button"><ChevronLeft size={24} /></button>
          <div className="flex overflow-hidden rounded-[18px] border border-border-primary bg-ww-surface-raised p-1 shadow-ww-xs">
            <button className="rounded-[14px] bg-ww-pink px-7 py-2.5 text-[14px] font-black text-white" type="button">支出</button>
            <button className="px-7 py-2.5 text-[14px] font-black text-ww-soft" type="button">收入</button>
          </div>
          <span className="h-11 w-11" />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2.5">
          {categories.map(([label, icon]) => (
            <button className="flex aspect-[.92] flex-col items-center justify-center gap-2 rounded-[20px] border border-border-primary bg-ww-surface-raised shadow-ww-xs active:scale-95" key={label} onClick={() => { setCategory({ label, icon }); setIsPickingCategory(false); }} type="button">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--ww-surface-tint-color)] text-primary-deep"><CategoryIcon iconKey={icon} size={27} /></span>
              <span className="text-[12px] font-bold text-ww-mid">{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="page-new px-[22px] pb-24 pt-5">
      <div className="flex items-center justify-between">
        <button aria-label="返回分类" className="flex h-11 w-11 items-center justify-center rounded-full border border-border-primary bg-ww-surface-raised text-ww-mid" onClick={() => setIsPickingCategory(true)} type="button">×</button>
        <span className="rounded-full bg-primary-light px-4 py-2 text-[13px] font-bold text-primary-deep">{category.label}</span>
      </div>
      <div className="mt-10 text-center">
        <p className="text-[12px] font-bold text-ww-mid">支出金额</p>
        <div className="mt-2 font-number text-[48px] font-black text-ww-ink">
          ¥
          {amount || '0.00'}
        </div>
      </div>
      <Surface className="mt-8 p-4" material="content">
        {isIos ? <StudioIosField label="备注" onChange={setRemark} value={remark} /> : <FormField label="备注" onChange={setRemark} placeholder="写点什么…" value={remark} />}
        <div className="mt-4 grid grid-cols-3 gap-2">{['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(value => <AppButton className="h-12 !px-0 text-[18px]" key={value} onClick={() => setAmount(current => `${current}${value}`)} variant="secondary">{value}</AppButton>)}</div>
      </Surface>
      <AppButton className="mt-4" fullWidth>完成记账</AppButton>
    </div>
  );
}

function MinePreview() {
  return (
    <div className="page-new space-y-4 px-[18px] pb-24 pt-6">
      <UserSummaryCard checkIn name="小鲸鱼" numberInfo={{ checkInAll: 3, checkInKeep: 1, recordCount: 1095 }} onProfileClick={() => undefined} />
      <ActionMenuCard
        columns={5}
        items={[
          { key: 'message', label: '消息', icon: <DesignIcon name="mine-message" size={20} />, tone: 'blue' },
          { key: 'badges', label: '我的徽章', icon: <DesignIcon name="mine-badge" size={20} />, tone: 'blue' },
          { key: 'points', label: '我的积分', icon: <DesignIcon name="mine-points" size={20} />, tone: 'blue' },
          { key: 'invite', label: '邀请好友', icon: <DesignIcon name="mine-invite" size={20} />, tone: 'blue' },
          { key: 'settings', label: '设置', icon: <DesignIcon name="mine-settings" size={20} />, tone: 'blue' },
        ]}
        variant="mine-actions"
      />
      <SettingsListCard
        className="studio-ios-settings-list"
        density="compact"
        items={[
          { key: 'ledgers', label: '我的账本' },
          { key: 'household', label: '家庭账本' },
          { key: 'settings', label: '设置' },
          { key: 'feedback', label: '意见反馈' },
          { key: 'about', label: '关于鲸浪记账', extra: 'v1.0.5' },
        ]}
      />
    </div>
  );
}

function DiscoveryPreview() {
  return (
    <div className="page-new px-[18px] pb-24 pt-5">
      <h1 className="mb-[14px] text-[20px] font-extrabold leading-[30px] text-ww-ink">发现</h1>
      <div className="space-y-[14px]">
        <CurrentMonthBillCard billRecord={{ month: 9, income: 120, expend: 80.6, surplus: 39.4 }} />
        <CurrentBudgetSummaryCardPresentation data={{ id: 'studio-month-budget', amount: '0.00', budgetAmount: '0.00', remaining: '0.00', remainingPercentage: 0 }} title="09月预算总览" />
        <AssetSummaryCardPresentation asset="74000.00" liability="939090.00" netAsset="-865090.00" title="资产管家" />
        <section>
          <h2 className="pb-[10px] text-[14px] font-bold leading-[21px] text-ww-ink">常用功能</h2>
          <ActionMenuCard
            columns={3}
            items={[
              { key: 'asset', label: '资产管家', icon: <DesignIcon name="action-asset" size={22} />, tone: 'purple' },
              { key: 'invoice', label: '发票助手', icon: <DesignIcon name="action-invoice" size={22} />, tone: 'blue' },
              { key: 'fixed', label: '固定支出', icon: <CalendarDays size={22} strokeWidth={1.8} />, tone: 'green' },
            ]}
            variant="gradient-tiles"
          />
        </section>
      </div>
    </div>
  );
}

interface StudioShowcaseProps {
  isIos: boolean;
  onOpenActionSheet: () => void;
  onOpenDialog: () => void;
  onOpenSheet: () => void;
  onReturnToDetail: () => void;
}

function StudioShowcase({ isIos, onOpenActionSheet, onOpenDialog, onOpenSheet, onReturnToDetail }: StudioShowcaseProps) {
  const [activeSegment, setActiveSegment] = useState<'week' | 'month'>('week');
  const [inputValue, setInputValue] = useState('午餐 · 和朋友吃饭');
  const { isMotionEnabled } = useMotionPreference();

  return (
    <section className="studio-showcase page-new min-h-full px-4 pb-8 pt-4" aria-labelledby="studio-showcase-title" data-motion-enabled={isMotionEnabled}>
      {!isIos && (
        <header className="studio-showcase__navbar">
          <button aria-label="返回业务场景" className="studio-showcase__round-button" onClick={onReturnToDetail} type="button"><ChevronLeft size={20} /></button>
          <div>
            <h1 id="studio-showcase-title">Konsta iOS 风格组件</h1>
            <p>浅色候选 · 只在主题工坊预览</p>
          </div>
          <span aria-hidden className="studio-showcase__round-button studio-showcase__round-button--quiet"><Sparkles size={18} /></span>
        </header>
      )}

      <section className="studio-showcase__glass-card" aria-label="玻璃材质示例">
        <span className="studio-showcase__eyebrow">LIQUID GLASS</span>
        <strong>通透导航、轻亮边与安静的阴影</strong>
        <p>把材质留给 Chrome 和浮动操作，账单正文保持稳定的阅读对比度。</p>
      </section>

      <section className="studio-showcase__section" aria-labelledby="studio-showcase-actions">
        <div className="studio-showcase__section-heading">
          <h2 id="studio-showcase-actions">按钮与状态</h2>
          <span>44px 触控区域</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <AppButton fullWidth onClick={onOpenSheet}>主要操作</AppButton>
          <AppButton fullWidth onClick={onOpenDialog} variant="secondary">次要操作</AppButton>
          <AppButton disabled fullWidth>不可用</AppButton>
          <AppButton fullWidth onClick={onOpenActionSheet} variant="ghost">更多操作</AppButton>
        </div>
      </section>

      <section className="studio-showcase__section" aria-labelledby="studio-showcase-input">
        <div className="studio-showcase__section-heading">
          <h2 id="studio-showcase-input">输入与分段选择</h2>
          <span>聚焦与选中态</span>
        </div>
        {isIos
          ? <div className="studio-ios-input-group rounded-3xl p-4"><StudioIosField label="备注" onChange={setInputValue} value={inputValue} /></div>
          : (
              <div className="studio-showcase__input-wrap">
                <label htmlFor="studio-showcase-input-field">备注</label>
                <Input className="studio-showcase__input" id="studio-showcase-input-field" onChange={setInputValue} value={inputValue} />
              </div>
            )}
        {isIos
          ? <StudioIosSegmented activeIndex={activeSegment === 'week' ? 0 : 1}>{([['week', '本周'], ['month', '本月']] as const).map(([value, label]) => <button aria-checked={activeSegment === value} key={value} onClick={() => setActiveSegment(value)} role="radio" type="button">{label}</button>)}</StudioIosSegmented>
          : (
              <div aria-label="统计范围" className="studio-showcase__segmented" role="radiogroup">
                {([['week', '本周'], ['month', '本月']] as const).map(([value, label]) => (
                  <button aria-checked={activeSegment === value} key={value} onClick={() => setActiveSegment(value)} role="radio" type="button">{label}</button>
                ))}
              </div>
            )}
      </section>
      {isIos && <StudioIosExtras onOpenActions={onOpenActionSheet} onOpenDialog={onOpenDialog} onOpenSheet={onOpenSheet} />}

      <section className="studio-showcase__section" aria-labelledby="studio-showcase-list">
        <div className="studio-showcase__section-heading">
          <h2 id="studio-showcase-list">分组列表</h2>
          <span>内容优先</span>
        </div>
        <div className="studio-showcase__list">
          {[
            ['餐饮', '午餐 · 和朋友吃饭', '¥86.00'],
            ['交通', '地铁通勤', '¥4.00'],
          ].map(([category, description, amount]) => (
            <button className="studio-showcase__list-row" key={category} onClick={onOpenSheet} type="button">
              <span className="studio-showcase__list-icon"><CategoryIcon categoryName={category} iconKey={category === '餐饮' ? 'food' : 'traffic'} size={18} /></span>
              <span className="min-w-0 flex-1 text-left">
                <strong>{category}</strong>
                <small>{description}</small>
              </span>
              <strong className="text-feedback-danger">{amount}</strong>
              <ChevronRight className="text-ww-soft" size={16} />
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

function StudioPreview() {
  const [template, setTemplate] = useState<StudioTemplate>('glass');
  const [overrides, setOverrides] = useState<StudioTokenOverrides>({});
  const [activeTab, setActiveTab] = useState<PreviewTabKey>(readPreviewTab);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [previewDate] = useState(() => new Date());
  const [isInspectorEnabled, setIsInspectorEnabled] = useState(false);
  const [summaryMonth, setSummaryMonth] = useState(() => dayjs('2026-09-01'));
  const [isSummaryVisible, setIsSummaryVisible] = useState(true);
  const [iosOverlay, setIosOverlay] = useState<'actions' | 'dialog' | 'sheet' | null>(null);
  const [lastIosOverlay, setLastIosOverlay] = useState<'actions' | 'dialog' | 'sheet'>('sheet');
  const isIos = template === 'konsta-ios';
  const { isMotionEnabled } = useMotionPreference();
  const openIosOverlay = (kind: 'actions' | 'dialog' | 'sheet') => { setLastIosOverlay(kind); setIosOverlay(kind); };
  const isMotionPrototype = new URLSearchParams(window.location.search).has('motion-prototype');
  useEffect(() => {
    const receive = (event: MessageEvent<StudioPreviewMessage>) => {
      if (event.origin !== window.location.origin)
        return;
      if (event.data?.type === 'ww-design-studio:theme') {
        if (event.data.template !== template) {
          setIosOverlay(null);
          setIsPopupVisible(false);
          setIsDatePickerVisible(false);
        }
        setTemplate(event.data.template);
        setOverrides(event.data.overrides);
      }
      if (event.data?.type === 'ww-design-studio:inspect-mode')
        setIsInspectorEnabled(event.data.enabled);
    };
    window.addEventListener('message', receive); window.parent.postMessage({ type: 'ww-design-studio:ready' }, window.location.origin); return () => window.removeEventListener('message', receive);
  }, [template]);
  useEffect(() => {
    applyAppearancePreference({ template: resolveStudioAppearanceTemplate(template) });
    document.documentElement.dataset.designStudioTemplate = template;
    const templateTokens = filterValidStudioOverrides(getStudioTemplateTokens(template));
    Object.entries(templateTokens).forEach(([name, value]) => {
      if (typeof value === 'string')
        document.documentElement.style.setProperty(name, value);
    });
    const defaultValues = Object.fromEntries(STUDIO_TOKENS.map(token => [token.name, getComputedStyle(document.documentElement).getPropertyValue(token.name).trim()]));
    window.parent.postMessage({ type: 'ww-design-studio:defaults', values: defaultValues }, window.location.origin);
    const validOverrides = filterValidStudioOverrides(overrides);
    Object.entries(validOverrides).forEach(([name, value]) => {
      if (typeof value === 'string')
        document.documentElement.style.setProperty(name, value);
    });
    return () => {
      new Set([...Object.keys(templateTokens), ...Object.keys(validOverrides)]).forEach(name => document.documentElement.style.removeProperty(name));
      delete document.documentElement.dataset.designStudioTemplate;
    };
  }, [overrides, template]);
  useEffect(() => {
    const syncPreviewTab = () => setActiveTab(readPreviewTab());
    window.addEventListener('hashchange', syncPreviewTab);
    return () => window.removeEventListener('hashchange', syncPreviewTab);
  }, []);
  const selectPreviewTab = (tab: PreviewTabKey) => {
    window.location.hash = `#/design-system/preview?tab=${tab}`;
  };
  const previewConfirmDialog = () => {
    if (isIos) { openIosOverlay('dialog'); return; }
    setIsPopupVisible(false);
    window.setTimeout(() => {
      void confirmAppAction({ cancelText: '取消', confirmText: '确认', description: '确认框与其他产品浮层使用同一套材质 token。', title: '确认弹窗' });
    }, 180);
  };
  const previewActionSheet = () => {
    if (isIos) { openIosOverlay('actions'); return; }
    setIsPopupVisible(false);
    window.setTimeout(() => {
      showAppActionSheet({ actions: [{ key: 'edit', text: '编辑' }, { danger: true, key: 'delete', text: '删除' }], cancelText: '取消', description: '操作菜单沿用同一遮罩与表面', title: '操作菜单' });
    }, 180);
  };
  const previewDatePicker = () => {
    setIosOverlay(null);
    setIsPopupVisible(false);
    setIsDatePickerVisible(true);
  };
  const handleInspectorSelection = useCallback((selection: StudioInspectorSelection) => {
    window.parent.postMessage({ type: 'ww-design-studio:inspect-selection', selection } satisfies InspectorSelectionMessage, window.location.origin);
  }, []);
  const handleInspectorExit = useCallback(() => {
    window.parent.postMessage({ type: 'ww-design-studio:inspect-exit' } satisfies InspectorExitMessage, window.location.origin);
  }, []);
  const tabItems = [{ key: 'detail', label: '明细', icon: <ReceiptText />, onSelect: () => selectPreviewTab('detail') }, { key: 'chart', label: '图表', icon: <BarChart3 />, onSelect: () => selectPreviewTab('chart') }, { key: 'create', label: '记账', icon: <Plus />, prominent: true, onSelect: () => selectPreviewTab('create') }, { key: 'discovery', label: '发现', icon: <Compass />, onSelect: () => selectPreviewTab('discovery') }, { key: 'mine', label: '我的', icon: <House />, onSelect: () => selectPreviewTab('mine') }];
  const openSheet = () => isIos ? openIosOverlay('sheet') : setIsPopupVisible(true);
  return (
    <div className="page-new relative overflow-hidden pb-24" data-design-studio-preview data-local-scroll={activeTab === 'asset-overview' || undefined} data-motion-enabled={isMotionEnabled}>
      <PreviewElementInspector enabled={isInspectorEnabled} onExit={handleInspectorExit} onSelect={handleInspectorSelection} tokens={STUDIO_TOKENS} />
      {isMotionPrototype && <BalanceCardMotionPrototype />}
      {!isMotionPrototype && activeTab === 'showcase' && (
        <StudioShowcase
          isIos={isIos}
          onOpenActionSheet={previewActionSheet}
          onOpenDialog={previewConfirmDialog}
          onOpenSheet={openSheet}
          onReturnToDetail={() => selectPreviewTab('detail')}
        />
      )}
      {!isMotionPrototype && activeTab === 'detail' && (
        <RecordOverviewPresentation
          groups={[{ key: '2026-09-03', dateLabel: '09/03 周三', summaries: [{ key: 'expense', label: '支出', value: '¥90.00' }], records: [{ id: 'lunch', iconName: 'food', categoryName: '餐饮', primary: '和朋友吃饭', overviewSecondary: '午餐 · 3 人', amount: '¥86.00', amountTone: 'expense' }, { id: 'metro', iconName: 'traffic', categoryName: '交通', primary: '地铁通勤', amount: '¥4.00', amountTone: 'expense' }] }]}
          header={{
            actions: (
              <>
                <button aria-label="智能记账" onClick={openSheet} type="button"><MessageCircleMore size={17} /></button>
                <button aria-label="搜索" onClick={openSheet} type="button"><DesignIcon name="search" size={16} /></button>
                <button aria-label="日历" onClick={openSheet} type="button"><DesignIcon name="calendar" size={16} /></button>
              </>
            ),
            amountToggle: { content: <DesignIcon name={isSummaryVisible ? 'amount-visible' : 'amount-hidden'} size={16} />, onClick: () => setIsSummaryVisible(value => !value) },
            metrics: [{ key: 'income', label: '收入', value: isSummaryVisible ? '8,600.00' : '＊＊＊＊＊' }, { key: 'expense', label: '支出', value: isSummaryVisible ? '5,915.50' : '＊＊＊＊＊' }],
            period: { label: '账单周期', value: <RecordMonthPicker month={summaryMonth} monthLabel="月" onChange={setSummaryMonth} testId="studio-summary-month" /> },
            renderTitle: className => <h1 className={className}>鲸浪记账</h1>,
            shortcuts: [{ key: 'bill', label: '账单', icon: <DesignIcon name="shortcut-bill" size={20} />, onClick: openSheet }, { key: 'budget', label: '预算', icon: <DesignIcon name="shortcut-budget" size={20} />, onClick: openSheet }, { key: 'asset', label: '资产管家', icon: <DesignIcon name="shortcut-asset" size={20} />, onClick: openSheet }],
            titleAlignment: 'start',
          }}
          renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
          state="ready"
        />
      )}
      {!isMotionPrototype && activeTab === 'chart' && <MemoryRouter><ChartPreview /></MemoryRouter>}
      {!isMotionPrototype && activeTab === 'create' && <BookkeepingPreview isIos={isIos} onExit={() => selectPreviewTab('detail')} />}
      {!isMotionPrototype && activeTab === 'discovery' && <DiscoveryPreview />}
      {!isMotionPrototype && activeTab === 'mine' && <MinePreview />}
      {!isMotionPrototype && activeTab === 'asset-overview' && <AssetOverviewPreviewPage onBack={() => selectPreviewTab('detail')} studioNavigation />}
      {!isMotionPrototype && activeTab !== 'create' && activeTab !== 'asset-overview' && (isIos ? <StudioIosTabbar activeKey={activeTab === 'showcase' ? 'detail' : activeTab} isInteractive={!isInspectorEnabled} items={tabItems} /> : activeTab !== 'showcase' && <BottomTabBarPresentation activeKey={activeTab} ariaLabel="演示底部导航" items={tabItems} />)}
      {!isMotionPrototype && !isIos && (
        <AppSheet destroyOnClose position="bottom" visible={isPopupVisible} onMaskClick={() => setIsPopupVisible(false)}>
          <SheetHeader
            closeLabel="关闭浮层预览"
            description="共享浮层样式"
            icon={<Layers3 size={20} strokeWidth={1.8} />}
            onClose={() => setIsPopupVisible(false)}
            title="提醒与浮层"
          />
          <div className="px-[var(--ww-component-sheet-padding-x)] pb-5 pt-4">
            <p className="text-[13px] leading-5 text-ww-mid">打开下面的组件，直接观察材质、间距和交互 token 的效果。</p>
            <div className="mt-4 space-y-2">
              {[
                { description: '主次操作与语义状态', icon: <MessageCircleMore size={18} />, label: '确认框', onClick: previewConfirmDialog },
                { description: '单层列表与危险操作', icon: <LayoutGrid size={18} />, label: '操作菜单', onClick: previewActionSheet },
                { description: '滚轮选中态与顶部操作', icon: <CalendarDays size={18} />, label: '日期选择', onClick: previewDatePicker },
              ].map(item => (
                <button className="flex min-h-14 w-full items-center gap-3 rounded-[var(--ww-radius-control)] border-0 bg-[var(--ww-component-sheet-subtle-background)] px-3 text-left text-primary-deep active:bg-[var(--ww-component-sheet-selected-background)]" key={item.label} onClick={item.onClick} type="button">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--ww-component-sheet-close-radius)] bg-ww-surface-raised">{item.icon}</span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-[14px] font-extrabold text-ww-ink">{item.label}</strong>
                    <span className="mt-0.5 block text-[12px] text-ww-mid">{item.description}</span>
                  </span>
                  <ChevronRight className="shrink-0 text-ww-soft" size={17} />
                </button>
              ))}
            </div>
            <AppButton className="mt-5" fullWidth onClick={() => setIsPopupVisible(false)}>知道了</AppButton>
          </div>
        </AppSheet>
      )}
      {isIos && (
        <StudioIosOverlay key={lastIosOverlay} kind={lastIosOverlay} onClose={() => setIosOverlay(null)} title={lastIosOverlay === 'dialog' ? '确认弹窗' : lastIosOverlay === 'actions' ? '操作菜单' : '提醒与浮层'} visible={iosOverlay !== null}>
          {lastIosOverlay === 'dialog'
            ? (
                <div className="p-6">
                  <h2 className="text-center text-[17px] font-semibold">确认弹窗</h2>
                  <p className="mt-3 text-sm text-ww-mid">确认保存这笔示例账单？仅演示弹窗反馈，不会写入真实账本。</p>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <AppButton onClick={() => setIosOverlay(null)} variant="secondary">取消</AppButton>
                    <AppButton onClick={() => setIosOverlay(null)}>确认</AppButton>
                  </div>
                </div>
              )
            : (
                <>
                  <SheetHeader closeLabel="关闭浮层预览" description="Konsta iOS 候选 · 400ms 动画" onClose={() => setIosOverlay(null)} title={lastIosOverlay === 'actions' ? '操作菜单' : '提醒与浮层'} />
                  <div className="space-y-3 p-4">
                    {lastIosOverlay === 'actions'
                      ? (
                          <>
                            <AppButton fullWidth onClick={() => setIosOverlay(null)} variant="secondary">编辑</AppButton>
                            <AppButton fullWidth onClick={() => setIosOverlay(null)} variant="danger">删除</AppButton>
                            <AppButton fullWidth onClick={() => setIosOverlay(null)} variant="ghost">取消</AppButton>
                          </>
                        )
                      : (
                          <>
                            <p className="text-sm text-ww-mid">白色内容表面、底部滑入与遮罩淡入淡出。</p>
                            <AppButton fullWidth onClick={previewConfirmDialog} variant="secondary">打开确认框</AppButton>
                            <AppButton fullWidth onClick={previewActionSheet} variant="secondary">打开操作菜单</AppButton>
                            <AppButton fullWidth onClick={previewDatePicker} variant="secondary">选择月份</AppButton>
                            <AppButton fullWidth onClick={() => setIosOverlay(null)}>完成</AppButton>
                          </>
                        )}
                  </div>
                </>
              )}
        </StudioIosOverlay>
      )}
      <AppDatePicker defaultValue={previewDate} onClose={() => setIsDatePickerVisible(false)} onConfirm={() => setIsDatePickerVisible(false)} precision="month" title="选择月份" visible={isDatePickerVisible} />
    </div>
  );
}

export default function DesignSystemPage() {
  const [isMotionReduced, setIsMotionReduced] = useState(false);
  useEffect(() => {
    const receive = (event: MessageEvent<MotionMessage>) => {
      if (event.origin === window.location.origin && event.data?.type === 'ww-design-studio:motion')
        setIsMotionReduced(event.data.reduced);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);
  return <MotionProvider isSeniorMode={isMotionReduced}>{window.location.hash.startsWith('#/design-system/preview') ? <StudioPreview /> : <StudioConsole />}</MotionProvider>;
}

function StudioConsole() {
  const [isMotionReduced, setIsMotionReduced] = useState(false);
  const [template, setTemplate] = useState<StudioTemplate>('glass'); const [overrides, setOverrides] = useState<StudioTokenOverrides>({}); const [records, setRecords] = useState<StudioDebugRecord[]>(() => readStudioDebugRecords()); const [selectedRecordId, setSelectedRecordId] = useState(''); const [query, setQuery] = useState(''); const [width, setWidth] = useState<375 | 430>(375); const [fallback, setFallback] = useState(''); const [defaults, setDefaults] = useState<StudioTokenOverrides>({}); const [isInspectorEnabled, setIsInspectorEnabled] = useState(false); const [inspectorSelection, setInspectorSelection] = useState<StudioInspectorSelection | null>(null); const [previewTab, setPreviewTab] = useState<PreviewTabKey>('detail'); const frameRef = useRef<HTMLIFrameElement>(null); const effectiveOverrides = useMemo(() => filterValidStudioOverrides({ ...getStudioTemplateTokens(template), ...overrides }), [overrides, template]); const changedCount = Object.keys(overrides).length;
  const sendMotionPreference = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({ type: 'ww-design-studio:motion', reduced: isMotionReduced } satisfies MotionMessage, window.location.origin);
  }, [isMotionReduced]);
  const visibleTokens = useMemo(() => {
    const candidateTokens = isInspectorEnabled && inspectorSelection
      ? STUDIO_TOKENS.filter(token => inspectorSelection.tokenNames.includes(token.name))
      : STUDIO_TOKENS;
    return candidateTokens.filter(token => `${token.title} ${token.name} ${token.description}`.toLowerCase().includes(query.toLowerCase()));
  }, [inspectorSelection, isInspectorEnabled, query]);
  useEffect(() => { sendTheme(frameRef.current?.contentWindow ?? null, template, effectiveOverrides); }, [effectiveOverrides, template]);
  useEffect(() => { sendInspectorMode(frameRef.current?.contentWindow ?? null, isInspectorEnabled); }, [isInspectorEnabled]);
  useEffect(sendMotionPreference, [sendMotionPreference]);
  useEffect(() => {
    const receive = (event: MessageEvent<StudioConsoleMessage>) => {
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.type === 'ww-design-studio:ready')
        sendTheme(frameRef.current?.contentWindow ?? null, template, effectiveOverrides);
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.type === 'ww-design-studio:ready')
        sendInspectorMode(frameRef.current?.contentWindow ?? null, isInspectorEnabled);
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.type === 'ww-design-studio:ready')
        sendMotionPreference();
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.type === 'ww-design-studio:defaults')
        setDefaults(event.data.values ?? {});
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.type === 'ww-design-studio:inspect-selection')
        setInspectorSelection(event.data.selection);
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.type === 'ww-design-studio:inspect-exit') {
        setIsInspectorEnabled(false);
        setInspectorSelection(null);
      }
    }; window.addEventListener('message', receive); return () => window.removeEventListener('message', receive);
  }, [effectiveOverrides, isInspectorEnabled, sendMotionPreference, template]);
  const selectTemplate = (nextTemplate: StudioTemplate) => {
    setTemplate(nextTemplate);
    setOverrides({});
    setSelectedRecordId('');
  };
  const toggleInspector = () => {
    setIsInspectorEnabled(current => !current);
    setInspectorSelection(null);
  };
  const update = (name: string, value: string) => setOverrides(current => ({ ...current, [name]: value, ...getDependentOverrides(name, value) }));
  const reset = (token: StudioToken) => setOverrides((current) => {
    const next = { ...current };
    delete next[token.name];
    token.dependsOn?.forEach(name => delete next[name]);
    return next;
  });
  const resetAll = () => { setOverrides({}); setSelectedRecordId(''); };
  const saveDebugRecord = () => {
    const nextRecords = [createStudioDebugRecord(template, overrides), ...records].slice(0, 20);
    if (!writeStudioDebugRecords(nextRecords)) {
      showAppError(undefined, { message: '无法保存调试记录' });
      return;
    }
    setRecords(nextRecords);
    setSelectedRecordId(nextRecords[0].id);
  };
  const loadDebugRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    const record = records.find(item => item.id === recordId);
    if (!record)
      return;
    setTemplate(record.template);
    setOverrides(record.overrides);
  };
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
          <label className="flex min-h-11 items-center gap-2 text-xs text-ww-mid">
            <input checked={isMotionReduced} onChange={event => setIsMotionReduced(event.target.checked)} type="checkbox" />
            减少动态效果
          </label>
        </div>
      </header>
      <div className="design-studio__grid">
        <aside className="design-studio__rail design-studio__panel p-3">
          <p className="px-2 pb-2 pt-1 text-[11px] font-black uppercase tracking-[.14em] text-fg-muted">内置主题</p>
          {templates.map(value => (
            <button className="design-studio__template mb-1 flex w-full items-center gap-3 rounded-[14px] border border-transparent px-2 py-2 text-left" data-selected={template === value} key={value} onClick={() => selectTemplate(value)} type="button">
              <span className="h-9 w-9 rounded-[11px] bg-primary-light" />
              <span>
                <span className="block text-[13px] font-extrabold">{labels[value]}</span>
                <span className="block text-[10px] text-fg-muted">{value}</span>
              </span>
            </button>
          ))}
          <div className="mt-5 border-t border-stroke/10 pt-4">
            <p className="px-2 text-[11px] font-black uppercase tracking-[.14em] text-fg-muted">预览目录</p>
            {navigationItems.map(({ icon: ItemIcon, label, tab }) => {
              return (
                <button className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] font-bold text-fg hover:bg-action-primary/10" key={String(label)} onClick={() => setPreviewTab(tab)} type="button">
                  <ItemIcon size={15} />
                  {label}
                </button>
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
            <div className="design-studio__viewport-picker flex rounded-full bg-action-primary/10 p-1">
              {([375, 430] as const).map(value => (
                <button aria-pressed={width === value} className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold ${width === value ? 'bg-ww-surface-raised text-primary-deep shadow-sm' : 'text-fg-muted'}`} key={value} onClick={() => setWidth(value)} type="button">
                  {value}
                  px
                </button>
              ))}
            </div>
          </div>
          <div className="design-studio__frame-wrap" data-preview-width={width}><iframe className="design-studio__frame" onLoad={() => { sendTheme(frameRef.current?.contentWindow ?? null, template, effectiveOverrides); sendInspectorMode(frameRef.current?.contentWindow ?? null, isInspectorEnabled); }} ref={frameRef} src={getPreviewUrl(previewTab)} title="鲸浪主题实时预览" /></div>
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
          <button aria-pressed={isInspectorEnabled} className="design-studio__inspect-trigger mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border text-[11px] font-extrabold" data-active={isInspectorEnabled} onClick={toggleInspector} type="button">
            <Crosshair size={15} />
            {isInspectorEnabled ? '退出元素检查' : '检查预览元素'}
          </button>
          {isInspectorEnabled && <p className="mt-2 text-[10px] leading-4 text-fg-muted">移动到预览元素上查看边框，点击后只显示它关联的 token；按 Esc 退出。</p>}
          {isInspectorEnabled && inspectorSelection && (
            <p className="mt-2 truncate rounded-lg bg-action-primary/10 px-2 py-1.5 text-[10px] font-bold text-primary-deep">
              已选：
              {inspectorSelection.label}
              {' '}
              ·
              {inspectorSelection.tokenNames.length}
              {' '}
              个相关 token
            </p>
          )}
          <div className="design-studio__record-controls mt-3">
            <select aria-label="选择调试记录" className="h-10 min-w-0 rounded-[12px] border border-stroke/20 bg-ww-surface-raised px-3 text-[11px] font-bold text-fg outline-none focus:border-primary" onChange={event => loadDebugRecord(event.target.value)} value={selectedRecordId}>
              <option value="">选择已保存调试记录</option>
              {records.map(record => <option key={record.id} value={record.id}>{record.label}</option>)}
            </select>
            <button className="flex h-10 items-center justify-center gap-1 rounded-[12px] border-0 bg-action-primary/10 px-3 text-[11px] font-extrabold text-primary-deep" onClick={saveDebugRecord} type="button">
              <BookmarkPlus size={14} />
              保存记录
            </button>
          </div>
          <p className="mt-1 text-[10px] leading-4 text-fg-muted">只在点击保存后写入本机；选择内置主题会回到它的固定样式。</p>
          <label className="mt-4 flex h-10 items-center gap-2 rounded-[12px] border border-stroke/20 bg-ww-surface-raised px-3">
            <Search size={15} className="text-fg-muted" />
            <Input className="text-[12px]" onChange={setQuery} placeholder="搜索 token" value={query} />
          </label>
          <div className="mt-4 space-y-3">
            {isInspectorEnabled && !inspectorSelection && <div className="rounded-[14px] border border-dashed border-primary/30 bg-action-primary/10 p-4 text-center text-[11px] leading-5 text-fg-muted">点击预览中的任意元素，右侧会切换到它实际引用的 token。</div>}
            {isInspectorEnabled && inspectorSelection && !visibleTokens.length && <div className="rounded-[14px] border border-dashed border-primary/30 bg-action-primary/10 p-4 text-center text-[11px] leading-5 text-fg-muted">这个元素没有引用可编辑 token。可继续选择它的容器或其他元素。</div>}
            {visibleTokens.map((token) => {
              const value = overrides[token.name] ?? ''; const isOverridden = Object.hasOwn(overrides, token.name); const isCustomValueValid = !value || isValidTokenValue(token, value); return (
                <div className="rounded-[14px] bg-action-primary/10 p-3" key={token.name}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[12px] font-extrabold">{token.title}</p>
                      <p className="mt-0.5 text-[10px] text-fg-muted">{token.description}</p>
                    </div>
                    {isOverridden && (
                      <button aria-label={`复原${token.title}的原始值`} className="flex min-h-8 items-center gap-1 rounded-lg bg-ww-surface-raised px-2 text-[10px] font-bold text-primary-deep" onClick={() => reset(token)} title="复原到当前模板的原始值" type="button">
                        <RotateCcw size={12} />
                        复原原始值
                      </button>
                    )}
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
                  {isOverridden && (
                    <p className="mt-1 truncate text-[9px] text-fg-muted">
                      原始值：
                      {defaults[token.name] || '模板默认值'}
                    </p>
                  )}
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

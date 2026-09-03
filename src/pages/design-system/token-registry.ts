import type { AppearanceTemplate } from '@/entities/user-app-config';

export type StudioTokenKind = 'channel-color' | 'color' | 'select' | 'slider';

export interface StudioTokenOption {
  label: string;
  value: string;
}

export interface StudioToken {
  dependsOn?: readonly string[];
  description: string;
  group: 'color' | 'material' | 'shape' | 'semantic';
  kind: StudioTokenKind;
  max?: number;
  min?: number;
  name: string;
  options?: readonly StudioTokenOption[];
  step?: number;
  title: string;
  unit?: 'px';
}

export type StudioTokenOverrides = Partial<Record<string, string>>;

export interface StudioThemeExport {
  baseTemplate: AppearanceTemplate;
  name: string;
  tokens: StudioTokenOverrides;
  version: 1;
}

const surfaceOptions = [
  { label: '纯白', value: 'rgb(255 255 255)' },
  { label: '轻透白', value: 'rgba(255, 255, 255, 0.76)' },
  { label: '中透白', value: 'rgba(255, 255, 255, 0.88)' },
  { label: '深透白', value: 'rgba(255, 255, 255, 0.94)' },
] as const;

const borderOptions = [
  { label: '柔和', value: 'rgba(20, 20, 24, 0.07)' },
  { label: '清晰', value: 'rgba(20, 20, 24, 0.14)' },
  { label: '主题描边', value: 'rgba(63, 159, 190, 0.20)' },
] as const;

const shadowOptions = [
  { label: '无阴影', value: 'none' },
  { label: '轻柔', value: '0 3px 10px rgba(20, 20, 24, 0.05)' },
  { label: '标准', value: '0 10px 24px rgba(20, 20, 24, 0.07)' },
  { label: '浮起', value: '0 16px 32px rgba(20, 20, 24, 0.08)' },
] as const;

const gradientOptions = [
  { label: '纯色背景', value: 'var(--ww-background-color)' },
  { label: '清新渐变', value: 'linear-gradient(155deg, rgb(231 247 255) 0%, rgb(246 252 255) 48%, rgb(255 244 248) 100%)' },
  { label: '极简渐变', value: 'linear-gradient(180deg, rgb(250 251 252) 0%, rgb(244 246 248) 100%)' },
] as const;

export const STUDIO_TOKENS: readonly StudioToken[] = [
  { name: '--ww-theme-color', title: '主色', description: '主操作、强调与进度，同时同步语义主色', group: 'color', kind: 'color', dependsOn: ['--ww-color-action-primary'] },
  { name: '--ww-theme-color-mid', title: '主色深阶', description: '渐变与按下层级', group: 'color', kind: 'color' },
  { name: '--ww-theme-color-light', title: '主色浅阶', description: '选中态与图标底色', group: 'color', kind: 'color' },
  { name: '--ww-theme-color-deep', title: '主色墨阶', description: '强调文字与深色图标', group: 'color', kind: 'color' },
  { name: '--ww-primary-foreground', title: '主按钮文字', description: '主要操作与中间记账按钮文字', group: 'color', kind: 'color' },
  { name: '--ww-pink-color', title: '辅助强调色', description: '清新模板的第二强调色', group: 'color', kind: 'color' },
  { name: '--ww-pink-color-light', title: '辅助浅色', description: '辅助强调的浅底色', group: 'color', kind: 'color' },
  { name: '--ww-theme-text-color', title: '正文颜色', description: '标题与主要文字，同时同步语义正文', group: 'color', kind: 'color', dependsOn: ['--ww-color-fg'] },
  { name: '--ww-text-color-mid', title: '次要文字', description: '说明与次级信息，同时同步语义次级文字', group: 'color', kind: 'color', dependsOn: ['--ww-color-fg-muted'] },
  { name: '--ww-text-color-soft', title: '弱化文字', description: '占位与弱层级说明，同时同步语义弱化文字', group: 'color', kind: 'color', dependsOn: ['--ww-color-fg-subtle'] },
  { name: '--ww-background-color', title: '页面背景', description: '页面画布底色', group: 'color', kind: 'color' },
  { name: '--ww-surface-tint-color', title: '浅色表面', description: '图标、分组和弱强调底色', group: 'color', kind: 'color' },
  { name: '--ww-surface-accent-color', title: '强调表面', description: '辅助高亮底色', group: 'color', kind: 'color' },
  { name: '--ww-surface-secondary-color', title: '第二表面', description: '图标渐变与次级区域', group: 'color', kind: 'color' },
  { name: '--ww-border-color', title: '描边', description: '卡片和控件边界', group: 'material', kind: 'select', options: borderOptions },
  { name: '--ww-card-color', title: '卡片表面', description: '常规卡片背景', group: 'material', kind: 'select', options: surfaceOptions },
  { name: '--ww-surface-color', title: '内容表面', description: '内容容器背景', group: 'material', kind: 'select', options: surfaceOptions },
  { name: '--ww-surface-raised-color', title: '抬升表面', description: '摘要卡、浮层与控制台表面', group: 'material', kind: 'select', options: surfaceOptions },
  { name: '--ww-control-surface', title: '控件表面', description: '输入、筛选和页头操作', group: 'material', kind: 'select', options: surfaceOptions },
  { name: '--ww-page-gradient', title: '页面材质', description: '页面背景的预设渐变', group: 'material', kind: 'select', options: gradientOptions },
  { name: '--ww-card-shadow', title: '卡片阴影', description: '普通卡片层次', group: 'material', kind: 'select', options: shadowOptions },
  { name: '--ww-card-shadow-xs', title: '轻阴影', description: '轻量控件与小卡片', group: 'material', kind: 'select', options: shadowOptions },
  { name: '--ww-card-shadow-lg', title: '大阴影', description: '大卡片与覆盖层', group: 'material', kind: 'select', options: shadowOptions },
  { name: '--ww-card-shadow-floating', title: '浮层阴影', description: '弹层与浮动内容', group: 'material', kind: 'select', options: shadowOptions },
  { name: '--ww-control-shadow', title: '控件阴影', description: '页头操作和筛选控件', group: 'material', kind: 'select', options: shadowOptions },
  { name: '--ww-page-gutter', title: '页面边距', description: '移动页面左右留白', group: 'shape', kind: 'slider', min: 8, max: 28, step: 1, unit: 'px' },
  { name: '--ww-section-gap', title: '区块间距', description: '页面区块之间的垂直间距', group: 'shape', kind: 'slider', min: 4, max: 28, step: 1, unit: 'px' },
  { name: '--ww-card-padding', title: '卡片内边距', description: '业务卡片内容留白', group: 'shape', kind: 'slider', min: 8, max: 28, step: 1, unit: 'px' },
  { name: '--ww-control-height', title: '控件高度', description: '按钮和输入控件的标准高度', group: 'shape', kind: 'slider', min: 36, max: 60, step: 2, unit: 'px' },
  { name: '--ww-list-row-height', title: '列表行高', description: '列表单行最小高度', group: 'shape', kind: 'slider', min: 40, max: 68, step: 2, unit: 'px' },
  { name: '--ww-radius-card', title: '卡片圆角', description: '常规业务卡片', group: 'shape', kind: 'slider', min: 8, max: 28, step: 1, unit: 'px' },
  { name: '--ww-radius-panel', title: '面板圆角', description: '弹层与大面板', group: 'shape', kind: 'slider', min: 10, max: 32, step: 1, unit: 'px' },
  { name: '--ww-radius-control', title: '控件圆角', description: '输入、按钮和小控件', group: 'shape', kind: 'slider', min: 6, max: 24, step: 1, unit: 'px' },
  { name: '--ww-card-blur', title: '玻璃模糊', description: 'Chrome 和浮层模糊半径', group: 'shape', kind: 'slider', min: 0, max: 24, step: 1, unit: 'px' },
  { name: '--ww-color-finance-income', title: '收入语义色', description: '收入金额和收入图表，独立于主色', group: 'semantic', kind: 'channel-color' },
  { name: '--ww-color-finance-expense', title: '支出语义色', description: '支出金额和支出图表，独立于主色', group: 'semantic', kind: 'channel-color' },
  { name: '--ww-color-feedback-success', title: '成功反馈色', description: '成功提示与完成状态', group: 'semantic', kind: 'channel-color' },
  { name: '--ww-color-feedback-warning', title: '警告反馈色', description: '风险提示与注意状态', group: 'semantic', kind: 'channel-color' },
  { name: '--ww-color-feedback-danger', title: '错误反馈色', description: '错误提示，不与支出色联动', group: 'semantic', kind: 'channel-color' },
  ...[1, 2, 3, 4, 5, 6].map(index => ({ name: `--ww-chart-${index}`, title: `图表色 ${index}`, description: '图表数据序列，独立于主色', group: 'semantic' as const, kind: 'color' as const })),
];

const tokenByName = new Map(STUDIO_TOKENS.map(token => [token.name, token]));
const linkedChannelTokens: Record<string, string> = {
  '--ww-theme-color': '--ww-color-action-primary',
  '--ww-theme-text-color': '--ww-color-fg',
  '--ww-text-color-mid': '--ww-color-fg-muted',
  '--ww-text-color-soft': '--ww-color-fg-subtle',
};

export const STUDIO_TOKEN_STORAGE_KEY = 'ww:design-studio:overrides:v1';

export function createThemeExport(template: AppearanceTemplate, overrides: StudioTokenOverrides): StudioThemeExport {
  return { version: 1, name: `鲸浪主题 · ${template}`, baseTemplate: template, tokens: filterValidStudioOverrides(overrides) };
}

export function createThemeCss(template: AppearanceTemplate, overrides: StudioTokenOverrides): string {
  const lines = Object.entries(filterValidStudioOverrides(overrides)).map(([name, value]) => `  ${name}: ${value};`);
  return `html[data-appearance-template='${template}'] {\n${lines.join('\n')}\n}`;
}

export function colorToChannels(value: string): string | null {
  const match = /^#([\da-f]{6})$/i.exec(value.trim());
  if (!match)
    return null;
  const color = match[1];
  return [color.slice(0, 2), color.slice(2, 4), color.slice(4, 6)].map(part => Number.parseInt(part, 16)).join(' ');
}

export function channelsToColor(value: string): string | null {
  const channels = value.trim().split(/\s+/).map(Number);
  if (channels.length !== 3 || channels.some(channel => !Number.isInteger(channel) || channel < 0 || channel > 255))
    return null;
  return `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

export function getDependentOverrides(name: string, value: string): StudioTokenOverrides {
  const dependent = linkedChannelTokens[name];
  const channels = dependent ? colorToChannels(value) : null;
  return dependent && channels ? { [dependent]: channels } : {};
}

export function isValidTokenValue(token: StudioToken, value: string): boolean {
  if (!value.trim())
    return false;
  if (token.kind === 'color')
    return /^#[\da-f]{6}$/i.test(value.trim());
  if (token.kind === 'channel-color')
    return channelsToColor(value) !== null;
  if (token.kind === 'slider') {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) && numeric >= (token.min ?? 0) && numeric <= (token.max ?? Number.POSITIVE_INFINITY);
  }
  if (token.options?.some(option => option.value === value))
    return true;
  if (token.name === '--ww-page-gradient')
    return /^linear-gradient\([^{};]+\)$/i.test(value);
  if (token.name.includes('shadow'))
    return value === 'none' || /^(?:inset )?-?\d+(?:\.\d+)?px\s+-?\d+(?:\.\d+)?px\s+(?:\d+(?:\.\d+)?px\s+)?(?:rgba?\([^{};]+\)|#[\da-f]{6})$/i.test(value);
  return /^(?:#[\da-f]{6}|rgba?\([^{};]+\)|hsla?\([^{};]+\)|color-mix\([^{};]+\)|transparent|var\(--ww-[\w-]+\))$/i.test(value);
}

export function filterValidStudioOverrides(overrides: StudioTokenOverrides): StudioTokenOverrides {
  return Object.fromEntries(Object.entries(overrides).filter(([name, value]) => {
    const token = tokenByName.get(name);
    if (typeof value !== 'string')
      return false;
    if (token)
      return isValidTokenValue(token, value);
    return Object.values(linkedChannelTokens).includes(name) && channelsToColor(value) !== null;
  }));
}

export function readStudioDrafts(): Partial<Record<AppearanceTemplate, StudioTokenOverrides>> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STUDIO_TOKEN_STORAGE_KEY) ?? '{}');
    return value && typeof value === 'object' ? value as Partial<Record<AppearanceTemplate, StudioTokenOverrides>> : {};
  }
  catch {
    return {};
  }
}

export function writeStudioDrafts(drafts: Partial<Record<AppearanceTemplate, StudioTokenOverrides>>): void {
  localStorage.setItem(STUDIO_TOKEN_STORAGE_KEY, JSON.stringify(drafts));
}

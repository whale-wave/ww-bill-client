import type { AppearanceTemplate } from '@/entities/user-app-config';
import { MONO_DEVELOPMENT_TOKENS } from '@/features/appearance/model/development-appearance';

/** Studio templates stay local to the isolated preview until explicitly promoted. */
export const STUDIO_TEMPLATES = ['glass', 'fresh', 'minimal', 'mono'] as const;
export type StudioTemplate = typeof STUDIO_TEMPLATES[number];

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
  baseTemplate: StudioTemplate;
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

const overlaySurfaceOptions = [
  { label: '洁净浮层', value: 'rgb(255 255 255 / 0.98)' },
  { label: '纯白浮层', value: 'rgb(255 255 255)' },
  { label: '轻透浮层', value: 'rgba(255, 255, 255, 0.88)' },
  { label: '玻璃浮层', value: 'rgb(248 250 252 / 0.88)' },
  { label: '跟随抬升表面', value: 'var(--ww-surface-raised-color)' },
] as const;

const overlayBorderOptions = [
  { label: '克制蓝灰', value: 'rgb(36 82 106 / 0.1)' },
  { label: '无描边', value: 'transparent' },
  { label: '玻璃亮边', value: 'rgb(255 255 255 / 0.76)' },
  { label: '跟随全局描边', value: 'var(--ww-border-color)' },
  ...borderOptions,
] as const;

const overlayShadowOptions = [
  { label: '无阴影', value: 'none' },
  { label: '克制浮层', value: '0 8px 14px rgb(27 54 70 / 0.14)' },
  { label: '标准浮层', value: '0 18px 36px rgb(20 20 24 / 0.16)' },
  { label: '跟随浮层阴影', value: 'var(--ww-card-shadow-floating)' },
  ...shadowOptions.slice(1),
] as const;

const overlayBlurOptions = [
  { label: '关闭虚化', value: 'none' },
  { label: '微量虚化', value: 'blur(3px)' },
  { label: '轻度虚化', value: 'blur(6px) saturate(1.04)' },
  { label: '标准虚化', value: 'blur(10px) saturate(1.08)' },
  { label: '强虚化', value: 'blur(16px) saturate(1.12)' },
] as const;

const scrimOptions = [
  { label: '轻遮罩', value: 'rgb(20 20 24 / 0.24)' },
  { label: '蓝灰遮罩', value: 'rgb(25 42 54 / 0.32)' },
  { label: '标准遮罩', value: 'rgb(20 20 24 / 0.36)' },
  { label: '深遮罩', value: 'rgb(20 20 24 / 0.48)' },
] as const;

const sheetSurfaceOptions = [
  { label: '无填充', value: 'transparent' },
  { label: '玻璃表面', value: 'rgb(255 255 255 / 0.56)' },
  { label: '控件玻璃', value: 'rgb(255 255 255 / 0.7)' },
  { label: '跟随抬升表面', value: 'var(--ww-surface-raised-color)' },
  { label: '跟随浅色表面', value: 'var(--ww-surface-tint-color)' },
  { label: '主题浅选中', value: 'color-mix(in srgb, var(--ww-theme-color-light) 68%, white)' },
  { label: '日期浅选中', value: 'color-mix(in srgb, var(--ww-theme-color-light) 46%, transparent)' },
] as const;

const overlayForegroundOptions = [
  { label: '主要文字', value: 'var(--ww-theme-text-color)' },
  { label: '次要文字', value: 'var(--ww-text-color-mid)' },
  { label: '反白文字', value: 'var(--ww-primary-foreground)' },
] as const;

const overlayActionOptions = [
  { label: '品牌深色操作', value: 'color-mix(in srgb, var(--ww-theme-color-deep) 82%, black)' },
  { label: '跟随主操作', value: 'var(--ww-action-primary-background)' },
  { label: '跟随主题色', value: 'var(--ww-theme-color)' },
  { label: '跟随浅色表面', value: 'var(--ww-surface-tint-color)' },
] as const;

const sheetBorderOptions = [
  { label: '玻璃亮边', value: 'rgb(255 255 255 / 0.64)' },
  { label: '控件亮边', value: 'rgb(255 255 255 / 0.72)' },
  { label: '跟随全局描边', value: 'var(--ww-border-color)' },
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
  { name: '--ww-material-overlay-background', title: '浮层 · 表面', description: '弹窗、操作菜单、日期选择器与上下 Sheet 共用表面', group: 'material', kind: 'select', options: overlaySurfaceOptions },
  { name: '--ww-material-overlay-border', title: '浮层 · 描边', description: '所有产品浮层共用边界', group: 'material', kind: 'select', options: overlayBorderOptions },
  { name: '--ww-material-overlay-shadow', title: '浮层 · 阴影', description: '所有产品浮层共用抬升层次', group: 'material', kind: 'select', options: overlayShadowOptions },
  { name: '--ww-material-overlay-blur', title: '浮层 · 背景虚化', description: '遮罩和浮层表面共用的背景虚化强度', group: 'material', kind: 'select', options: overlayBlurOptions },
  { name: '--ww-material-scrim-background', title: '浮层 · 背景遮罩', description: '弹窗、菜单、日期选择器与 Sheet 共用遮罩', group: 'material', kind: 'select', options: scrimOptions },
  { name: '--ww-page-gutter', title: '页面边距', description: '移动页面左右留白', group: 'shape', kind: 'slider', min: 8, max: 28, step: 1, unit: 'px' },
  { name: '--ww-section-gap', title: '区块间距', description: '页面区块之间的垂直间距', group: 'shape', kind: 'slider', min: 4, max: 28, step: 1, unit: 'px' },
  { name: '--ww-card-padding', title: '卡片内边距', description: '业务卡片内容留白', group: 'shape', kind: 'slider', min: 8, max: 28, step: 1, unit: 'px' },
  { name: '--ww-control-height', title: '控件高度', description: '按钮和输入控件的标准高度', group: 'shape', kind: 'slider', min: 36, max: 60, step: 2, unit: 'px' },
  { name: '--ww-list-row-height', title: '列表行高', description: '列表单行最小高度', group: 'shape', kind: 'slider', min: 40, max: 68, step: 2, unit: 'px' },
  { name: '--ww-radius-card', title: '卡片圆角', description: '常规业务卡片', group: 'shape', kind: 'slider', min: 8, max: 28, step: 1, unit: 'px' },
  { name: '--ww-radius-panel', title: '面板圆角', description: '弹层与大面板', group: 'shape', kind: 'slider', min: 10, max: 32, step: 1, unit: 'px' },
  { name: '--ww-material-overlay-radius', title: '浮层 · 弹窗圆角', description: '居中确认框与顶部 Sheet 的圆角', group: 'shape', kind: 'slider', min: 12, max: 32, step: 1, unit: 'px' },
  { name: '--ww-radius-control', title: '控件圆角', description: '输入、按钮和小控件', group: 'shape', kind: 'slider', min: 6, max: 24, step: 1, unit: 'px' },
  { name: '--ww-card-blur', title: '玻璃模糊', description: 'Chrome 和浮层模糊半径', group: 'shape', kind: 'slider', min: 0, max: 24, step: 1, unit: 'px' },
  { name: '--ww-color-finance-income', title: '收入语义色', description: '收入金额和收入图表，独立于主色', group: 'semantic', kind: 'channel-color' },
  { name: '--ww-color-finance-expense', title: '支出语义色', description: '支出金额和支出图表，独立于主色', group: 'semantic', kind: 'channel-color' },
  { name: '--ww-color-feedback-success', title: '成功反馈色', description: '成功提示与完成状态', group: 'semantic', kind: 'channel-color' },
  { name: '--ww-color-feedback-warning', title: '警告反馈色', description: '风险提示与注意状态', group: 'semantic', kind: 'channel-color' },
  { name: '--ww-color-feedback-danger', title: '错误反馈色', description: '错误提示，不与支出色联动', group: 'semantic', kind: 'channel-color' },
  { name: '--ww-component-sheet-padding-x', title: '表单弹层 · 横向内边距', description: '表单类 Bottom Sheet 的内容边距', group: 'shape', kind: 'slider', min: 14, max: 24, step: 1, unit: 'px' },
  { name: '--ww-component-sheet-section-gap', title: '表单弹层 · 区块间距', description: '标签、账户和输入区之间的纵向节奏', group: 'shape', kind: 'slider', min: 10, max: 20, step: 1, unit: 'px' },
  { name: '--ww-component-sheet-control-height', title: '表单弹层 · 控件高度', description: '账户选择与金额输入控件的最小高度', group: 'shape', kind: 'slider', min: 48, max: 60, step: 2, unit: 'px' },
  { name: '--ww-component-sheet-radius', title: '表单弹层 · 顶部圆角', description: '底部 Sheet、操作菜单和日期选择器共用圆角', group: 'shape', kind: 'slider', min: 16, max: 36, step: 1, unit: 'px' },
  { name: '--ww-component-sheet-close-size', title: '表单弹层 · 关闭按钮尺寸', description: 'Sheet 右上角关闭按钮的点击表面尺寸', group: 'shape', kind: 'slider', min: 30, max: 44, step: 1, unit: 'px' },
  { name: '--ww-component-sheet-close-radius', title: '表单弹层 · 关闭按钮圆角', description: 'Sheet 右上角关闭按钮的圆角', group: 'shape', kind: 'slider', min: 8, max: 22, step: 1, unit: 'px' },
  { name: '--ww-component-sheet-heading-size', title: '表单弹层 · 标题字号', description: '所有 Sheet 标题的字号', group: 'shape', kind: 'slider', min: 15, max: 22, step: 1, unit: 'px' },
  { name: '--ww-component-sheet-header-background', title: '表单弹层 · 顶栏表面', description: 'SheetHeader 的背景材质', group: 'material', kind: 'select', options: sheetSurfaceOptions },
  { name: '--ww-component-sheet-header-border', title: '表单弹层 · 顶栏描边', description: 'SheetHeader 的分隔边界', group: 'material', kind: 'select', options: sheetBorderOptions },
  { name: '--ww-component-sheet-header-blur', title: '表单弹层 · 顶栏虚化', description: 'SheetHeader 的背景虚化强度', group: 'material', kind: 'select', options: overlayBlurOptions },
  { name: '--ww-component-sheet-icon-background', title: '表单弹层 · 图标表面', description: '标题图标和关闭按钮背景', group: 'material', kind: 'select', options: sheetSurfaceOptions },
  { name: '--ww-component-sheet-control-background', title: '表单弹层 · 控件表面', description: 'Sheet 内输入和选择控件背景', group: 'material', kind: 'select', options: sheetSurfaceOptions },
  { name: '--ww-component-sheet-control-border', title: '表单弹层 · 控件描边', description: 'Sheet 内输入和选择控件边界', group: 'material', kind: 'select', options: sheetBorderOptions },
  { name: '--ww-component-sheet-control-shadow', title: '表单弹层 · 控件阴影', description: 'Sheet 内输入和选择控件层次', group: 'material', kind: 'select', options: shadowOptions },
  { name: '--ww-component-sheet-subtle-background', title: '表单弹层 · 弱表面', description: 'Sheet 内弱强调区域', group: 'material', kind: 'select', options: sheetSurfaceOptions },
  { name: '--ww-component-sheet-selected-background', title: '表单弹层 · 选中表面', description: 'Sheet 内选中状态背景', group: 'material', kind: 'select', options: sheetSurfaceOptions },
  { name: '--ww-component-sheet-divider', title: '表单弹层 · 分隔线', description: 'Sheet 内分组边界', group: 'material', kind: 'select', options: sheetBorderOptions },
  { name: '--ww-component-sheet-focus-ring', title: '表单弹层 · 聚焦环', description: 'Sheet 内键盘聚焦与输入聚焦轮廓', group: 'material', kind: 'select', options: borderOptions },
  { name: '--ww-component-sheet-placeholder', title: '表单弹层 · 占位文字', description: 'Sheet 内输入提示文字', group: 'color', kind: 'color', dependsOn: ['--ww-text-color-mid'] },
  { name: '--ww-component-sheet-action-background', title: '表单弹层 · 主操作背景', description: 'Sheet 底部主操作按钮背景', group: 'material', kind: 'select', options: [{ label: '跟随主操作', value: 'var(--ww-action-primary-background)' }, { label: '跟随主题色', value: 'var(--ww-theme-color)' }] },
  { name: '--ww-component-sheet-action-shadow', title: '表单弹层 · 主操作阴影', description: 'Sheet 底部主操作按钮阴影', group: 'material', kind: 'select', options: overlayShadowOptions },
  { name: '--ww-component-sheet-handle-width', title: '表单弹层 · 拖动条宽度', description: '底部 Sheet、操作菜单和日期选择器共用拖动条', group: 'shape', kind: 'slider', min: 24, max: 52, step: 1, unit: 'px' },
  { name: '--ww-component-sheet-handle-color', title: '表单弹层 · 拖动条颜色', description: '所有底部浮层共用的弱提示颜色', group: 'material', kind: 'select', options: [{ label: '跟随弱文字', value: 'color-mix(in srgb, var(--ww-text-color-ghost) 72%, transparent)' }, { label: '跟随分隔线', value: 'var(--ww-divider-color)' }, { label: '跟随主题浅色', value: 'var(--ww-theme-color-light)' }] },
  { name: '--ww-component-sheet-handle-space', title: '表单弹层 · 拖动条留白', description: '拖动条与 Sheet 内容之间的顶部空间', group: 'shape', kind: 'slider', min: 12, max: 24, step: 1, unit: 'px' },
  { name: '--ww-component-overlay-width', title: '确认弹窗 · 面板宽度', description: '居中确认框在手机上的最大宽度', group: 'shape', kind: 'slider', min: 280, max: 360, step: 2, unit: 'px' },
  { name: '--ww-component-overlay-padding-x', title: '确认弹窗 · 内容边距', description: '居中确认框的横向与顶部留白', group: 'shape', kind: 'slider', min: 16, max: 30, step: 1, unit: 'px' },
  { name: '--ww-component-overlay-control-height', title: '确认弹窗 · 按钮高度', description: '确认和取消按钮的最小高度', group: 'shape', kind: 'slider', min: 40, max: 56, step: 1, unit: 'px' },
  { name: '--ww-component-overlay-control-radius', title: '确认弹窗 · 按钮圆角', description: '确认和取消按钮圆角', group: 'shape', kind: 'slider', min: 8, max: 24, step: 1, unit: 'px' },
  { name: '--ww-component-overlay-title-size', title: '确认弹窗 · 标题字号', description: '确认框标题字号', group: 'shape', kind: 'slider', min: 15, max: 22, step: 1, unit: 'px' },
  { name: '--ww-component-overlay-body-size', title: '确认弹窗 · 正文字号', description: '确认框说明文字字号', group: 'shape', kind: 'slider', min: 11, max: 16, step: 1, unit: 'px' },
  { name: '--ww-component-overlay-icon-size', title: '确认弹窗 · 图标尺寸', description: '确认框顶部图标表面尺寸', group: 'shape', kind: 'slider', min: 40, max: 60, step: 1, unit: 'px' },
  { name: '--ww-component-overlay-icon-radius', title: '确认弹窗 · 图标圆角', description: '确认框顶部图标表面圆角', group: 'shape', kind: 'slider', min: 10, max: 28, step: 1, unit: 'px' },
  { name: '--ww-component-overlay-secondary-background', title: '确认弹窗 · 次操作背景', description: '取消按钮与操作菜单取消区的背景', group: 'material', kind: 'select', options: sheetSurfaceOptions },
  { name: '--ww-component-overlay-secondary-foreground', title: '确认弹窗 · 次操作文字', description: '取消按钮与操作菜单取消区的文字颜色', group: 'color', kind: 'select', options: overlayForegroundOptions },
  { name: '--ww-component-overlay-primary-background', title: '确认弹窗 · 主操作背景', description: '普通确认操作的强调背景', group: 'material', kind: 'select', options: overlayActionOptions },
  { name: '--ww-component-overlay-primary-foreground', title: '确认弹窗 · 主操作文字', description: '普通确认操作的文字颜色', group: 'color', kind: 'select', options: overlayForegroundOptions },
  { name: '--ww-component-action-sheet-row-height', title: '操作菜单 · 行高', description: '操作菜单每一项的触控与阅读高度', group: 'shape', kind: 'slider', min: 48, max: 64, step: 2, unit: 'px' },
  { name: '--ww-component-date-picker-height', title: '日期选择器 · 总高度', description: '月历顶部时间选择器与其他日期选择器共用高度', group: 'shape', kind: 'slider', min: 280, max: 400, step: 2, unit: 'px' },
  { name: '--ww-component-date-picker-header-height', title: '日期选择器 · 顶栏高度', description: '日期选择器取消、标题和确认区域高度', group: 'shape', kind: 'slider', min: 52, max: 80, step: 2, unit: 'px' },
  { name: '--ww-component-date-picker-item-height', title: '日期选择器 · 选项行高', description: '日期滚轮每一项的高度', group: 'shape', kind: 'slider', min: 36, max: 52, step: 1, unit: 'px' },
  { name: '--ww-component-date-picker-selection-background', title: '日期选择器 · 选中背景', description: '滚轮中间当前日期的强调表面', group: 'material', kind: 'select', options: sheetSurfaceOptions },
  { name: '--ww-component-summary-padding-x', title: '汇总卡 · 横向内边距', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 8, max: 24, step: 1, unit: 'px' },
  { name: '--ww-component-summary-padding-y', title: '汇总卡 · 纵向内边距', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 8, max: 24, step: 1, unit: 'px' },
  { name: '--ww-component-summary-gap', title: '汇总卡 · 区块间距', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 4, max: 20, step: 1, unit: 'px' },
  { name: '--ww-component-summary-period-gap', title: '汇总卡 · 日期间距', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 2, max: 12, step: 1, unit: 'px' },
  { name: '--ww-component-summary-period-size', title: '汇总卡 · 日期字号', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 16, max: 24, step: 1, unit: 'px' },
  { name: '--ww-component-summary-metric-gap', title: '汇总卡 · 收支列间距', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 8, max: 32, step: 1, unit: 'px' },
  { name: '--ww-component-summary-label-size', title: '汇总卡 · 收支标签字号', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 10, max: 14, step: 1, unit: 'px' },
  { name: '--ww-component-summary-value-size', title: '汇总卡 · 金额字号', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 16, max: 28, step: 1, unit: 'px' },
  { name: '--ww-component-summary-value-gap', title: '汇总卡 · 金额上下间距', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 2, max: 10, step: 1, unit: 'px' },
  { name: '--ww-component-summary-shortcut-height', title: '汇总卡 · 快捷入口高度', description: '等宽入口采用上图标、下文字，内容增大时高度自动撑开', group: 'shape', kind: 'slider', min: 44, max: 72, step: 1, unit: 'px' },
  { name: '--ww-component-summary-shortcut-gap', title: '汇总卡 · 快捷图文间距', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 2, max: 10, step: 1, unit: 'px' },
  { name: '--ww-component-summary-shortcut-icon-size', title: '汇总卡 · 快捷图标尺寸', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 16, max: 24, step: 1, unit: 'px' },
  { name: '--ww-component-summary-shortcut-icon-surface-size', title: '汇总卡 · 图标底尺寸', description: '浅色图标底，与实际图标尺寸分开调整', group: 'shape', kind: 'slider', min: 28, max: 40, step: 1, unit: 'px' },
  { name: '--ww-component-summary-shortcut-icon-radius', title: '汇总卡 · 图标底圆角', description: '快捷入口图标底的柔和程度', group: 'shape', kind: 'slider', min: 6, max: 20, step: 1, unit: 'px' },
  { name: '--ww-component-summary-shortcut-icon-background', title: '汇总卡 · 图标底颜色', description: '沿用主题浅色表面，轻量提示可点击入口', group: 'color', kind: 'color', dependsOn: ['--ww-surface-tint-color'] },
  { name: '--ww-component-summary-shortcut-label-size', title: '汇总卡 · 快捷文字字号', description: '个人、家庭与自定义账本共用的顶部汇总卡', group: 'shape', kind: 'slider', min: 10, max: 14, step: 1, unit: 'px' },
  { name: '--ww-component-summary-period-muted', title: '汇总卡 · 年份颜色', description: '跟随次要文字色，可独立微调', group: 'color', kind: 'color', dependsOn: ['--ww-component-summary-label-foreground'] },
  { name: '--ww-component-summary-period-foreground', title: '汇总卡 · 月份颜色', description: '跟随主题语义色，可独立微调', group: 'color', kind: 'color', dependsOn: ['--ww-theme-text-color'] },
  { name: '--ww-component-summary-shortcut-foreground', title: '汇总卡 · 快捷文字颜色', description: '跟随主题语义色，可独立微调', group: 'color', kind: 'color', dependsOn: ['--ww-theme-text-color'] },
  { name: '--ww-component-summary-control-active', title: '汇总卡 · 按下背景', description: '跟随主题语义色，可独立微调', group: 'color', kind: 'color', dependsOn: ['--ww-surface-tint-color'] },
  { name: '--ww-component-summary-label-foreground', title: '汇总卡 · 收支标签颜色', description: '兼顾浅色表面的文字对比度', group: 'color', kind: 'color', dependsOn: ['--ww-text-color-mid', '--ww-theme-text-color'] },
  { name: '--ww-component-summary-shortcut-offset', title: '汇总卡 · 快捷区留白', description: '通过留白分组收支和快捷入口', group: 'shape', kind: 'slider', min: 4, max: 24, step: 1, unit: 'px' },
  { name: '--ww-component-summary-icon-foreground', title: '汇总卡 · 快捷图标颜色', description: 'Lucide 图标直接使用主题前景色', group: 'color', kind: 'color', dependsOn: ['--ww-theme-text-color'] },
  { name: '--ww-component-overview-icon-foreground', title: '汇总卡 · 显隐按钮颜色', description: '金额显隐控件的前景色', group: 'color', kind: 'color', dependsOn: ['--ww-theme-text-color'] },
  ...[1, 2, 3, 4, 5, 6].map(index => ({ name: `--ww-chart-${index}`, title: `图表色 ${index}`, description: '图表数据序列，独立于主色', group: 'semantic' as const, kind: 'color' as const })),
];

const tokenByName = new Map(STUDIO_TOKENS.map(token => [token.name, token]));
const linkedChannelTokens: Record<string, string> = {
  '--ww-theme-color': '--ww-color-action-primary',
  '--ww-theme-text-color': '--ww-color-fg',
  '--ww-text-color-mid': '--ww-color-fg-muted',
  '--ww-text-color-soft': '--ww-color-fg-subtle',
};

export const STUDIO_DEBUG_RECORD_STORAGE_KEY = 'ww:design-studio:debug-records:v1';

export interface StudioDebugRecord {
  id: string;
  label: string;
  overrides: StudioTokenOverrides;
  savedAt: string;
  template: StudioTemplate;
}

export function resolveStudioAppearanceTemplate(template: StudioTemplate): AppearanceTemplate {
  return template === 'mono' ? 'minimal' : template;
}

export function getStudioTemplateTokens(template: StudioTemplate): StudioTokenOverrides {
  return template === 'mono' ? { ...MONO_DEVELOPMENT_TOKENS } : {};
}

export function createThemeExport(template: StudioTemplate, overrides: StudioTokenOverrides): StudioThemeExport {
  return { version: 1, name: `鲸浪主题 · ${template}`, baseTemplate: template, tokens: filterValidStudioOverrides(overrides) };
}

export function createThemeCss(template: StudioTemplate, overrides: StudioTokenOverrides): string {
  const lines = Object.entries(filterValidStudioOverrides(overrides)).map(([name, value]) => `  ${name}: ${value};`);
  const selector = template === 'mono'
    ? 'html[data-design-studio-template=\'mono\']'
    : `html[data-appearance-template='${template}']`;
  return `${selector} {\n${lines.join('\n')}\n}`;
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
    return /^#[\da-f]{6}$/i.test(value.trim()) || /^var\(--ww-[\w-]+\)$/.test(value.trim());
  if (token.kind === 'channel-color')
    return channelsToColor(value) !== null;
  if (token.kind === 'slider') {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) && numeric >= (token.min ?? 0) && numeric <= (token.max ?? Number.POSITIVE_INFINITY);
  }
  if (/^var\(--ww-[\w-]+\)$/.test(value.trim()))
    return true;
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

function isStudioTemplate(value: unknown): value is StudioTemplate {
  return typeof value === 'string' && STUDIO_TEMPLATES.includes(value as StudioTemplate);
}

export function createStudioDebugRecord(template: StudioTemplate, overrides: StudioTokenOverrides, savedAt = new Date().toISOString()): StudioDebugRecord {
  const timeLabel = savedAt.replace('T', ' ').slice(0, 16);
  return {
    id: `${template}-${savedAt}-${Math.random().toString(36).slice(2, 8)}`,
    label: `${template.toUpperCase()} · ${timeLabel}`,
    overrides: filterValidStudioOverrides(overrides),
    savedAt,
    template,
  };
}

export function readStudioDebugRecords(): StudioDebugRecord[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STUDIO_DEBUG_RECORD_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(value))
      return [];
    return value.flatMap((record): StudioDebugRecord[] => {
      if (!record || typeof record !== 'object')
        return [];
      const candidate = record as Partial<StudioDebugRecord>;
      if (typeof candidate.id !== 'string' || typeof candidate.label !== 'string' || typeof candidate.savedAt !== 'string' || !isStudioTemplate(candidate.template) || !candidate.overrides || typeof candidate.overrides !== 'object')
        return [];
      return [{ id: candidate.id, label: candidate.label, savedAt: candidate.savedAt, template: candidate.template, overrides: filterValidStudioOverrides(candidate.overrides) }];
    }).slice(0, 20);
  }
  catch {
    return [];
  }
}

export function writeStudioDebugRecords(records: readonly StudioDebugRecord[]): boolean {
  try {
    localStorage.setItem(STUDIO_DEBUG_RECORD_STORAGE_KEY, JSON.stringify(records.slice(0, 20)));
    return true;
  }
  catch {
    return false;
  }
}

import type { CSSProperties, ReactNode } from 'react';
import type { BottomTabBarItem } from '@/shared/ui/bottom-tab-bar';
import { Search, X } from 'lucide-react';
import { animate, useMotionValue } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib';
import { AppButton, BottomTabBarPresentation, FormField, Surface, useMotionPreference } from '@/shared/ui';
import { attachTabbarGesture } from './ios-tabbar-gesture';
import './studio-ios.scss';

export function StudioIosTabbar({ activeKey, isInteractive = true, items }: { activeKey: string; isInteractive?: boolean; items: readonly BottomTabBarItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(0, items.findIndex(item => item.key === activeKey));
  const progress = useMotionValue(activeIndex);
  const activeRef = useRef(activeIndex);
  const itemsRef = useRef(items);
  const animationRef = useRef<ReturnType<typeof animate>>();
  const { isMotionEnabled } = useMotionPreference();
  useLayoutEffect(() => {
    activeRef.current = activeIndex;
    itemsRef.current = items;
  }, [activeIndex, items]);
  useEffect(() => {
    animationRef.current?.stop();
    if (isMotionEnabled)
      animationRef.current = animate(progress, activeIndex, { duration: 0.3, ease: 'easeOut' });
    else progress.set(activeIndex);
    return () => animationRef.current?.stop();
  }, [activeIndex, isMotionEnabled, progress]);
  useEffect(() => {
    const nav = rootRef.current?.querySelector<HTMLElement>('nav');
    if (!nav || !isInteractive)
      return;
    const snap = (index: number) => {
      animationRef.current?.stop();
      if (isMotionEnabled)
        animationRef.current = animate(progress, index, { duration: 0.3, ease: 'easeOut' });
      else progress.set(index);
    };
    const detach = attachTabbarGesture({
      element: nav,
      getActiveIndex: () => activeRef.current,
      onPress: (pressed) => { nav.dataset.iosPressed = String(pressed && isMotionEnabled); },
      onProgress: (value) => {
        animationRef.current?.stop();
        progress.set(value);
      },
      onRelease: (index, cancelled) => {
        snap(index);
        if (!cancelled && index !== activeRef.current)
          itemsRef.current[index]?.onSelect();
      },
    });
    return () => {
      animationRef.current?.stop();
      detach();
    };
  }, [isInteractive, isMotionEnabled, progress]);
  return <div className="studio-ios-tabbar" ref={rootRef}><BottomTabBarPresentation activeKey={activeKey} ariaLabel="演示底部导航" indicatorProgress={progress} items={items} /></div>;
}

export function StudioIosField({ label, value, onChange, disabled = false, errorMessage, readOnly = false }: {
  disabled?: boolean;
  errorMessage?: string;
  label: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  value: string;
}) {
  return <div className="studio-ios-field" data-empty={!value} data-error={Boolean(errorMessage)}><FormField disabled={disabled} errorMessage={errorMessage} label={label} onChange={onChange} readOnly={readOnly} value={value} /></div>;
}

export function StudioIosSearchbar({ value, onChange }: { onChange: (value: string) => void; value: string }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="studio-ios-searchbar flex items-center gap-0 overflow-hidden" data-enabled={isEnabled}>
      <div className="studio-ios-search-surface relative min-w-0 flex-1 rounded-full">
        <Search aria-hidden className="pointer-events-none absolute left-4 top-3.5 text-ww-mid" size={16} />
        <input
          aria-label="搜索示例账单"
          className="h-11 w-full rounded-full border-0 bg-transparent pl-10 pr-11 text-[17px] text-ww-ink outline-none placeholder:text-ww-soft"
          onBlur={() => {
            if (!value)
              setIsEnabled(false);
          }}
          onChange={event => onChange(event.target.value)}
          onFocus={() => setIsEnabled(true)}
          placeholder="搜索账单"
          ref={inputRef}
          type="search"
          value={value}
        />
        {value && (
          <button
            aria-label="清空搜索"
            className="absolute right-1 top-0 flex h-11 w-11 items-center justify-center border-0 bg-transparent text-ww-mid"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            onPointerDown={event => event.preventDefault()}
            type="button"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <button
        aria-label="取消搜索"
        aria-hidden={!isEnabled}
        className="studio-ios-search-cancel flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0"
        disabled={!isEnabled}
        onClick={() => {
          setIsEnabled(false);
          onChange('');
          inputRef.current?.blur();
        }}
        onPointerDown={event => event.preventDefault()}
        tabIndex={isEnabled ? 0 : -1}
        type="button"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export function StudioIosToggle({ checked, disabled = false, onChange, label }: { checked: boolean; disabled?: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <button aria-checked={checked} aria-label={label} className="studio-ios-toggle relative h-11 w-16 shrink-0 border-0 bg-transparent p-0 disabled:opacity-45" disabled={disabled} onClick={() => onChange(!checked)} role="switch" type="button"><span className="studio-ios-toggle-track absolute inset-x-0 top-2 h-7 rounded-full"><span className="studio-ios-toggle-thumb absolute left-0.5 top-0.5 h-6 rounded-full"><span className="studio-ios-toggle-thumb-glass absolute inset-0 rounded-full" /></span></span></button>;
}

export function StudioIosProgressbar({ progress, label }: { label: string; progress: number }) {
  const value = Math.max(0, Math.min(100, progress));
  return <span aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={value} className="studio-ios-progress block h-1.5 overflow-hidden rounded-full" role="progressbar"><span className="block h-full w-full rounded-full bg-primary" style={{ transform: `translateX(-${100 - value}%)` }} /></span>;
}

export type StudioIosOverlayKind = 'actions' | 'dialog' | 'sheet';

/** Native dialog supplies focus containment, background inertness, Escape and focus restoration. */
export function StudioIosOverlay({ children, kind, onClose, visible, title }: { children: ReactNode; kind: StudioIosOverlayKind; onClose: () => void; title: string; visible: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isMotionEnabled } = useMotionPreference();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog)
      return;
    let frame = 0;
    let secondFrame = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (visible) {
      if (!dialog.open)
        dialog.showModal();
      if (isMotionEnabled) {
        frame = requestAnimationFrame(() => {
          secondFrame = requestAnimationFrame(() => {
            dialog.dataset.open = 'true';
          });
        });
      }
      else {
        dialog.dataset.open = 'true';
      }
    }
    else {
      dialog.dataset.open = 'false';
      if (dialog.open) {
        const duration = Number.parseFloat(getComputedStyle(dialog).getPropertyValue('--ww-ios-overlay-duration')) || 400;
        if (isMotionEnabled)
          timeout = setTimeout(() => dialog.close(), duration);
        else dialog.close();
      }
    }
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(secondFrame);
      clearTimeout(timeout);
    };
  }, [isMotionEnabled, visible]);
  return (
    <dialog
      aria-label={title}
      aria-modal="true"
      className="studio-ios-overlay fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0"
      data-kind={kind}
      data-motion-enabled={isMotionEnabled}
      data-open="false"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
      <button aria-label="关闭预览弹层" className="studio-ios-overlay-mask absolute inset-0 h-full w-full border-0 p-0" onClick={onClose} tabIndex={-1} type="button" />
      <div className="studio-ios-overlay-layout pointer-events-none relative flex h-full items-center justify-center">
        <Surface className="studio-ios-overlay-panel pointer-events-auto max-h-[85dvh] overflow-y-auto" material="overlay">{children}</Surface>
      </div>
    </dialog>
  );
}

export function StudioIosExtras({ onOpenSheet, onOpenDialog, onOpenActions }: { onOpenActions: () => void; onOpenDialog: () => void; onOpenSheet: () => void }) {
  const [chips, setChips] = useState(['餐饮', '交通']);
  const [remark, setRemark] = useState('');
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState(true);
  const [progress, setProgress] = useState(35);
  return (
    <div className="space-y-5">
      <section aria-label="Badge 和 Chips" className="studio-showcase__section">
        <h2 className="mb-3 text-[17px] font-semibold">Badge · Chips</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="studio-ios-badge inline-flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-semibold leading-none">3</span>
          <span className="studio-ios-badge inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold leading-none">99+</span>
          <span className="studio-ios-chip rounded-full px-3 text-sm">已记账</span>
          <span className="studio-ios-chip studio-ios-chip--outline rounded-full px-3 text-sm">本月</span>
          {chips.map(chip => (
            <span className="studio-ios-chip rounded-full pl-3 pr-1 text-sm" key={chip}>
              {chip}
              <button aria-label={`移除${chip}标签`} className="flex h-11 w-6 items-center justify-center border-0 bg-transparent opacity-50 active:opacity-100" onClick={() => setChips(current => current.filter(value => value !== chip))} type="button"><X size={14} /></button>
            </span>
          ))}
          {chips.length < 2 && <AppButton onClick={() => setChips(['餐饮', '交通'])} size="compact" variant="ghost">恢复标签</AppButton>}
        </div>
      </section>
      <section aria-label="三种卡片" className="space-y-3">
        <h2 className="text-[17px] font-semibold">Cards</h2>
        {(['plain', 'raised', 'outline'] as const).map((variant, index) => (
          <Surface className={cn('studio-ios-card overflow-hidden', `studio-ios-card--${variant}`)} key={variant} material={variant === 'raised' ? 'raised' : 'content'}>
            <header className="studio-ios-card-header p-4 text-[17px] font-semibold">{['普通卡片', '阴影卡片', '描边卡片'][index]}</header>
            <div className="p-4 text-sm">
              餐饮预算
              <strong className="font-number">¥1,200.00</strong>
            </div>
            <footer className="studio-ios-card-footer p-4 text-sm text-ww-mid">原版圆角、内容留白与头尾分割线</footer>
          </Surface>
        ))}
      </section>
      <section aria-label="输入状态" className="studio-ios-input-group space-y-3 rounded-3xl p-4">
        <h2 className="text-[17px] font-semibold">Form Inputs</h2>
        <StudioIosField label="浮动备注" onChange={setRemark} value={remark} />
        <StudioIosField errorMessage="请输入有效金额" label="校验状态" value="金额格式错误" />
        <StudioIosField disabled label="禁用输入" value="暂不可编辑" />
        <StudioIosField label="只读输入" readOnly value="工资账户" />
      </section>
      <section aria-label="搜索账单" className="space-y-3">
        <h2 className="text-[17px] font-semibold">Searchbar</h2>
        <StudioIosSearchbar onChange={setSearch} value={search} />
        <p className="text-xs text-ww-mid" role="status">{search ? `搜索“${search}”：示例账单中暂无匹配` : '聚焦后输入区收缩，取消按钮渐显；阴影已减轻。'}</p>
      </section>
      <section aria-label="开关和进度" className="space-y-4">
        <h2 className="text-[17px] font-semibold">Toggle · Progressbar</h2>
        <div className="flex items-center justify-between">
          <span>显示金额</span>
          <StudioIosToggle checked={checked} label="显示金额" onChange={setChecked} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ww-mid">禁用开关</span>
          <StudioIosToggle checked disabled label="禁用开关" onChange={() => undefined} />
        </div>
        <StudioIosProgressbar label="预算使用进度" progress={progress} />
        <div className="flex items-center justify-between">
          <span className="font-number text-sm">
            {progress}
            %
          </span>
          <AppButton onClick={() => setProgress(value => value >= 100 ? 0 : value + 15)} size="compact" variant="secondary">更新进度</AppButton>
        </div>
      </section>
      <section aria-label="弹层和浮动操作" className="space-y-3">
        <h2 className="text-[17px] font-semibold">Dialog · Sheet · FAB</h2>
        <div className="grid grid-cols-2 gap-2">
          <AppButton onClick={onOpenDialog} variant="secondary">确认弹窗</AppButton>
          <AppButton onClick={onOpenSheet} variant="secondary">底部弹层</AppButton>
          <AppButton onClick={onOpenActions} variant="ghost">操作菜单</AppButton>
          <button aria-label="浮动记账" className="studio-ios-fab flex h-11 items-center justify-center gap-2 rounded-full border-0 px-4 text-sm font-semibold" onClick={onOpenSheet} type="button">
            <span className="text-xl">＋</span>
            记一笔
          </button>
        </div>
      </section>
    </div>
  );
}

export function StudioIosSegmented({ activeIndex, children }: { activeIndex: number; children: ReactNode }) {
  return (
    <div className="studio-ios-segmented relative grid grid-cols-2 rounded-[14px] p-1" role="radiogroup" aria-label="统计范围" style={{ '--ww-ios-segment-index': activeIndex } as CSSProperties}>
      <span aria-hidden className="studio-ios-segment-thumb pointer-events-none absolute bottom-1 left-1 top-1 rounded-[10px]" />
      {children}
    </div>
  );
}

import type { AppearanceTemplate } from '@/entities/user-app-config';
import { useLayoutEffect, useRef, useState } from 'react';
import { applyAppearancePreference, resolveAppearanceTemplate } from '@/features/appearance';
import { AppButton, FormField, Surface } from '@/shared/ui';

const templates: ReadonlyArray<AppearanceTemplate> = ['glass', 'minimal', 'fresh'];

export default function DesignSystemPage() {
  const [template, setTemplate] = useState<AppearanceTemplate>('glass');
  const originalTemplateRef = useRef(document.documentElement.dataset.appearanceTemplate);

  useLayoutEffect(() => {
    applyAppearancePreference({ template });
  }, [template]);

  useLayoutEffect(() => () => {
    applyAppearancePreference({ template: resolveAppearanceTemplate(originalTemplateRef.current) });
  }, []);

  return (
    <div className="page-new min-h-full overflow-auto px-4 pb-8 pt-6" data-design-system-matrix>
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-fg-muted">Development only</p>
        <h1 className="mt-1 text-2xl font-black text-fg">WW Design System v2</h1>
        <p className="mt-2 text-sm leading-6 text-fg-muted">Static visual matrix. It never reads or writes account configuration.</p>
      </header>

      <section aria-label="Appearance templates" className="mb-5 grid grid-cols-3 gap-2">
        {templates.map(value => (
          <button
            aria-pressed={template === value}
            className="min-h-11 rounded-[var(--ww-ref-radius-sm)] border border-stroke/20 bg-action-primary/10 px-2 text-sm font-extrabold text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-action-primary"
            key={value}
            onClick={() => setTemplate(value)}
            type="button"
          >
            {value}
          </button>
        ))}
      </section>

      <div className="grid gap-3">
        <Surface className="flex flex-col gap-3 p-4" material="content">
          <div>
            <p className="text-sm font-extrabold text-fg">Content</p>
            <p className="mt-1 text-sm text-fg-muted">Readable grouped information; never blurred.</p>
          </div>
          <FormField label="Preview field" onChange={() => {}} placeholder="Input surface" value="" />
        </Surface>

        <Surface className="flex items-center justify-between gap-4 p-4" material="raised">
          <div>
            <p className="text-sm font-extrabold text-fg">Raised</p>
            <p className="mt-1 text-sm text-fg-muted">Summary and contained product patterns.</p>
          </div>
          <span className="font-number text-lg font-black text-finance-income">¥ 1,280.00</span>
        </Surface>

        <Surface className="flex items-center justify-between gap-4 p-3" material="chrome">
          <span className="text-sm font-extrabold text-fg">Chrome</span>
          <AppButton className="h-11 px-3" variant="secondary">Action</AppButton>
        </Surface>

        <Surface className="flex flex-col gap-3 p-4" material="floating">
          <p className="text-sm font-extrabold text-fg">Floating</p>
          <AppButton fullWidth>Primary action</AppButton>
        </Surface>
      </div>
    </div>
  );
}

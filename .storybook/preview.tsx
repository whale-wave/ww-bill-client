/* eslint react-refresh/only-export-components: "off" -- Storybook preview exports a configuration object alongside its decorator component. */
import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import { applyAppearancePreference } from '@/features/appearance';
import { DEFAULT_LANG, i18n } from '@/shared/i18n';
import { MotionProvider } from '@/shared/ui/motion';
import '@/assets/styles/index.scss';
import './preview.scss';

const mobileViewports = {
  compact: { name: '375 × 812', styles: { height: '812px', width: '375px' }, type: 'mobile' as const },
  standard: { name: '390 × 844', styles: { height: '844px', width: '390px' }, type: 'mobile' as const },
  plus: { name: '430 × 932', styles: { height: '932px', width: '430px' }, type: 'mobile' as const },
};

function PreviewEnvironment({ children, globals }: { children: React.ReactNode; globals: Record<string, unknown> }) {
  const template = globals.appearanceTemplate === 'fresh' || globals.appearanceTemplate === 'minimal'
    ? globals.appearanceTemplate
    : 'glass';
  const language = globals.language === 'en' ? 'en' : DEFAULT_LANG;

  useEffect(() => {
    applyAppearancePreference({ template });
    void i18n.changeLanguage(language);
    document.documentElement.classList.toggle('senior', globals.seniorMode === 'enabled');
    return () => document.documentElement.classList.remove('senior');
  }, [language, template, globals.seniorMode]);

  return <MotionProvider isSeniorMode={globals.seniorMode === 'enabled'}>{children}</MotionProvider>;
}

const preview: Preview = {
  decorators: [(Story, context) => <PreviewEnvironment globals={context.globals}><Story /></PreviewEnvironment>],
  parameters: {
    a11y: { test: 'todo' },
    controls: { expanded: true },
    layout: 'centered',
    viewport: { options: mobileViewports },
  },
  globalTypes: {
    appearanceTemplate: {
      description: 'WW appearance template',
      toolbar: { icon: 'paintbrush', items: ['glass', 'fresh', 'minimal'], title: 'Theme', dynamicTitle: true },
    },
    language: {
      description: 'Preview language',
      toolbar: { icon: 'globe', items: ['zh-CN', 'en'], title: 'Language', dynamicTitle: true },
    },
    seniorMode: {
      description: 'Senior mode',
      toolbar: { icon: 'accessibility', items: ['disabled', 'enabled'], title: 'Senior', dynamicTitle: true },
    },
  },
  initialGlobals: {
    appearanceTemplate: 'glass',
    language: 'zh-CN',
    seniorMode: 'disabled',
    viewport: { value: 'compact', isRotated: false },
  },
};

export default preview;

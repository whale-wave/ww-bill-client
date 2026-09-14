import type { AppDatePickerProps } from './AppDatePicker';
import { App as KonstaApp } from 'konsta/react';
import { createRoot } from 'react-dom/client';
import { AppDatePicker } from './AppDatePicker';

export type AppDatePickerPromptProps = Omit<AppDatePickerProps, 'onClose' | 'onConfirm' | 'value' | 'visible'>;

export function promptAppDatePicker(props: AppDatePickerPromptProps) {
  if (typeof document === 'undefined')
    return Promise.resolve<Date | undefined>(undefined);
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  return new Promise<Date | undefined>((resolve) => {
    const finish = (value?: Date) => {
      resolve(value);
      queueMicrotask(() => {
        root.unmount();
        container.remove();
      });
    };
    root.render(
      <KonstaApp className="contents" dark={false} safeAreas={false} theme="ios">
        <AppDatePicker {...props} onClose={() => finish()} onConfirm={finish} visible />
      </KonstaApp>,
    );
  });
}

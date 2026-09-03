import type { FC } from 'react';
import classNames from 'classnames';
import { useCallback } from 'react';

export const TabList: FC<{ className?: string; selectValue: any; tabs: { name: string; value: any }[]; onChange: (value: any) => void }> = ({ className, selectValue, tabs, onChange }) => {
  const handleChange = useCallback((value: any) => () => {
    onChange(value);
  }, [onChange]);

  return (
    <div
      className={classNames('inline-flex overflow-hidden rounded-lg border-[1px] border-solid border-fg', className)}
    >
      {tabs.map(tab => (
        <button
          aria-pressed={selectValue === tab.value}
          className={classNames('flex min-h-11 flex-1 items-center justify-center px-4 py-[7px]', {
            'bg-fg text-fg-inverse': selectValue === tab.value,
          })}
          key={tab.value}
          onClick={handleChange(tab.value)}
          type="button"
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
};

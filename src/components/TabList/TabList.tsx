import classNames from 'classnames';
import { type FC, useCallback } from 'react';

export const TabList: FC<{ className?: string; selectValue: any; tabs: { name: string; value: any }[]; onChange: (value: any) => void }> = ({ className, selectValue, tabs, onChange }) => {
  const handleChange = useCallback((value: any) => () => {
    onChange(value);
  }, [onChange]);

  return (
    <div
      className={classNames('border-[1px] border-solid border-[#333] inline-flex rounded-lg overflow-hidden', className)}
    >
      {tabs.map(tab => (
        <div
          className={classNames('py-[7px] px-4 flex-1 flex justify-center items-center', {
            'bg-[#333] text-[#fff]': selectValue === tab.value,
          })}
          key={tab.value}
          onClick={handleChange(tab.value)}
        >
          {tab.name}
        </div>
      ))}
    </div>
  );
};

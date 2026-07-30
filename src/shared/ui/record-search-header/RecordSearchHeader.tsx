import type { SearchBarRef } from 'antd-mobile';
import type { FC, ReactNode } from 'react';
import { SearchBar } from 'antd-mobile';
import { useEffect, useRef } from 'react';

export interface RecordSearchHeaderProps {
  action?: {
    label: ReactNode;
    onClick: () => void;
    testId?: string;
  };
  autoFocus?: boolean;
  onBack: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export const RecordSearchHeader: FC<RecordSearchHeaderProps> = ({
  action,
  autoFocus = true,
  onBack,
  onChange,
  placeholder,
  value,
}) => {
  const searchBarRef = useRef<SearchBarRef>(null);

  useEffect(() => {
    if (autoFocus)
      searchBarRef.current?.focus();
  }, [autoFocus]);

  const searchBar = (
    <SearchBar
      ref={searchBarRef}
      className="[--background:#fff]"
      value={value}
      placeholder={placeholder}
      showCancelButton={() => true}
      onCancel={onBack}
      onChange={onChange}
    />
  );

  return (
    <div className="fixed right-0 top-0 z-10 w-full bg-primary py-2 pl-4 pr-1">
      {action
        ? (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-grow">{searchBar}</div>
              <button
                className="shrink-0 border-0 bg-transparent px-2 text-sm text-font-black"
                data-testid={action.testId}
                onClick={action.onClick}
                type="button"
              >
                {action.label}
              </button>
            </div>
          )
        : searchBar}
    </div>
  );
};

import type { SearchBarRef } from 'antd-mobile';
import type { FC, ReactNode } from 'react';
import { SearchBar } from 'antd-mobile';
import { useEffect, useRef } from 'react';

export interface RecordSearchHeaderProps {
  action?: ReactNode;
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
      style={{ '--background': '#fff' }}
      value={value}
      placeholder={placeholder}
      showCancelButton={() => true}
      onCancel={onBack}
      onChange={onChange}
    />
  );

  return (
    <div className="bg-primary py-2 pl-4 pr-1 fixed top-0 right-0 w-full">
      {action
        ? (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-grow">{searchBar}</div>
              {action}
            </div>
          )
        : searchBar}
    </div>
  );
};

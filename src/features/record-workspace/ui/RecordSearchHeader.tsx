import type { SearchBarRef } from 'antd-mobile';
import type { FC, ReactNode } from 'react';
import { SearchBar } from 'antd-mobile';
import { useEffect, useRef } from 'react';

interface RecordSearchHeaderProps {
  children?: ReactNode;
  onBack: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  title?: string;
  value: string;
}

export const RecordSearchHeader: FC<RecordSearchHeaderProps> = ({
  children,
  onBack,
  onChange,
  placeholder,
  title,
  value,
}) => {
  const searchBarRef = useRef<SearchBarRef>(null);

  useEffect(() => {
    searchBarRef.current?.focus();
  }, []);

  return (
    <header className="flex-shrink-0 bg-primary px-4 pb-3 pt-2">
      {title && <h1 className="mb-2 text-center text-lg font-medium">{title}</h1>}
      <SearchBar
        onCancel={onBack}
        onChange={onChange}
        placeholder={placeholder}
        ref={searchBarRef}
        showCancelButton={() => true}
        style={{ '--background': '#fff' }}
        value={value}
      />
      {children}
    </header>
  );
};

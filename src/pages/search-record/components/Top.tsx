import type { SearchBarRef } from 'antd-mobile';
import { SearchBar } from 'antd-mobile';
import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface TopProps {
}

const Top: React.FC<TopProps> = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRecordKeyword = searchParams.get('q') ?? '';
  const searchBarRef = useRef<SearchBarRef>(null);

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  const onChange = useCallback((v: string) => {
    setSearchParams({ q: v }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    searchBarRef.current?.focus();
  }, []);

  return (
    <div className="bg-primary py-2 pl-4 pr-1 fixed top-0 right-0 w-full">
      <SearchBar ref={searchBarRef} style={{ '--background': '#fff' }} value={searchRecordKeyword} placeholder="搜索类别/标签/备注" showCancelButton={() => true} onCancel={onBack} onChange={onChange} />
    </div>
  );
};

export default Top;

import React, { useCallback } from 'react';
import { SearchBar } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useRecordStore } from '@/store';

interface TopProps {
}

const Top: React.FC<TopProps> = () => {
  const navigate = useNavigate();
  const setSearchRecordKeyword = useRecordStore(({ setSearchRecordKeyword }) => setSearchRecordKeyword);

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  return (
    <div className="bg-primary py-2 pl-4 pr-1">
      <SearchBar style={{ '--background': '#fff' }} placeholder="搜索类别/标签/备注" showCancelButton={() => true} onCancel={onBack} onChange={setSearchRecordKeyword} />
    </div>
  );
};

export default Top;

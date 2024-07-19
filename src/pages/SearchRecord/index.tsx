import React, { useEffect } from 'react';
import { RecordList, Top } from '@/pages/SearchRecord/components';

interface SearchRecordProps {
}

const SearchRecord: React.FC<SearchRecordProps> = () => {
  useEffect(() => {
  }, []);

  return (
    <div className="page-new">
      <Top />
      <RecordList />
    </div>
  );
};

export default SearchRecord;

import React, { useEffect } from 'react';
import { RecordListContainer, Top } from '@/pages/record/search-record/ui';

interface SearchRecordProps {
}

const SearchRecord: React.FC<SearchRecordProps> = () => {
  useEffect(() => {
  }, []);

  return (
    <div className="page-new">
      <Top />
      <RecordListContainer />
    </div>
  );
};

export default SearchRecord;

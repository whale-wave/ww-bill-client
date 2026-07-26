import type { FC } from 'react';
import { useGetRecordBillQuery } from '@/entities/record';
import { useBillWorkspaceQueryParams } from '@/pages/bill/model';
import { PersonalBillWorkspaceView } from '@/pages/bill/ui/BillWorkspaceView';

const Bill: FC = () => {
  const params = useBillWorkspaceQueryParams();
  const query = useGetRecordBillQuery({ params });

  return <PersonalBillWorkspaceView query={query} />;
};

export default Bill;

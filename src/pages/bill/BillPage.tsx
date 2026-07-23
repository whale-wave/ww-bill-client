import type { FC } from 'react';
import { useGetRecordBillQuery } from '@/entities/record';
import { useBillWorkspaceQueryParams } from '@/pages/bill/model';
import { BillWorkspaceView } from '@/pages/bill/ui/BillWorkspaceView';

const Bill: FC = () => {
  const params = useBillWorkspaceQueryParams();
  const query = useGetRecordBillQuery({ params });

  return <BillWorkspaceView query={query} />;
};

export default Bill;

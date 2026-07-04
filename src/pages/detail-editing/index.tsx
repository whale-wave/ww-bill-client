import type { FC } from 'react';
import type { recordChildren } from '@/entities/record';
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useGetRecordByIdQuery } from '@/entities/record';
import Footer from '@/pages/detail-editing/footer';
import List from '@/pages/detail-editing/list';
import Top from '@/pages/detail-editing/Top';

const Editing: FC = () => {
  const navParams = useLocation();
  const params = useParams();
  const { data } = useGetRecordByIdQuery({
    params: { id: params.id! },
  });

  const state = useMemo(() => data ?? (navParams.state as recordChildren), [data]);

  return (
    <div className="page">
      <Top state={state} />
      <List state={state} />
      <Footer state={state} />
    </div>
  );
};

export default Editing;

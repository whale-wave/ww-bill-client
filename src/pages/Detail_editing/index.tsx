import type { FC } from 'react';
import type { recordChildren } from '../detail/List';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useGetRecordByIdQuery } from '@/hooks/query/useGetRecordByIdQuery.ts';
import Footer from '@/pages/Detail_editing/footer';
import List from '@/pages/Detail_editing/list';
import Top from '@/pages/Detail_editing/Top';

const Editing: FC = () => {
  const navParams = useLocation();
  const params = useParams();
  const dataList: recordChildren = navParams.state as recordChildren;
  const [_state, setState] = useState<recordChildren>(dataList);
  const { data } = useGetRecordByIdQuery({
    params: { id: params.id! },
  });

  const state = useMemo(() => data || _state, [data, _state]);

  useEffect(() => {
    setState(navParams.state as recordChildren);
  }, []);

  return (
    <div className="page">
      <Top state={state} />
      <List state={state} />
      <Footer state={state} />
    </div>
  );
};

export default Editing;

import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabBar } from '@/components';
import { FixedPin } from '@/components/ui/index.ts';
import { useGetTopicQuery } from '@/hooks';
import ItemList from '@/pages/community/ItemList';
import TopBar from '@/pages/community/TopBar';

const Community: FC = () => {
  const [tabIndex, setTabIndex] = useState(2);
  const navigate = useNavigate();
  const recommend = tabIndex === 1 ? true : undefined;
  const queryEnabled = tabIndex !== 0;
  const { data } = useGetTopicQuery({
    params: {
      recommend,
    },
    queryOptions: {
      enabled: queryEnabled,
    },
  });

  const tabs = useMemo(() => [
    { name: '关注', onClick: () => undefined },
    { name: '推荐', onClick: () => undefined },
    { name: '最新', onClick: () => undefined },
  ], []);

  const onChange = (key: number) => {
    setTabIndex(key);
  };

  const handlePostTopic = () => {
    navigate('/post-topic');
  };

  return (
    <div className="page">
      <TopBar data={tabs} index={tabIndex} onChange={onChange} />
      <ItemList data={queryEnabled ? data.topics : []} />
      <TabBar active={3} />
      <FixedPin onClick={handlePostTopic}>发帖</FixedPin>
    </div>
  );
};

export default Community;

import type { FC } from 'react';
import type { Topic } from '@/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopics } from '@/api';
import { TabBar } from '@/components';
import { FixedPin } from '@/components/ui/index.ts';
import ItemList from '@/pages/community/ItemList';
import TopBar from '@/pages/community/TopBar';

const Community: FC = () => {
  const [tabIndex, setTabIndex] = useState(2);
  const [topics, setTopics] = useState<Topic[]>([]);
  const navigate = useNavigate();

  const tabs = [
    {
      name: '关注',
      onClick: () => {
        setTopics([]);
      },
    },
    {
      name: '推荐',
      onClick: async () => {
        const { statusCode, data } = await getTopics(true);
        if (statusCode === 200)
          setTopics(data.topics);
      },
    },
    {
      name: '最新',
      onClick: async () => {
        const { statusCode, data } = await getTopics();
        if (statusCode === 200)
          setTopics(data.topics);
      },
    },
  ];

  useEffect(() => {
    tabs[tabIndex].onClick();
  }, []);

  const fetchData = async () => {
    const { statusCode, data } = await getTopics();
    if (statusCode === 200)
      setTopics(data.topics);
  };

  const onChange = (key: number) => {
    setTabIndex(key);
    tabs[key].onClick();
  };

  const handlePostTopic = () => {
    navigate('/post-topic');
  };

  return (
    <div className="page">
      <TopBar data={tabs} index={tabIndex} onChange={onChange} />
      <ItemList data={topics} fetch={fetchData} />
      <TabBar active={3} />
      <FixedPin onClick={handlePostTopic}>发帖</FixedPin>
    </div>
  );
};

export default Community;

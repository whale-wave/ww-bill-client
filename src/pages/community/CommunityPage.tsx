import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTopicQuery } from '@/entities/topic';
import ItemList from '@/pages/community/ItemList';
import TopBar from '@/pages/community/TopBar';
import { useTranslation } from '@/shared/i18n';
import { FixedPin } from '@/shared/ui';
import { TabBar } from '@/widgets/layout';

const Community: FC = () => {
  const [tabIndex, setTabIndex] = useState(2);
  const navigate = useNavigate();
  const { t } = useTranslation('community');
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
    { name: t('follow'), onClick: () => undefined },
    { name: '推荐', onClick: () => undefined },
    { name: '最新', onClick: () => undefined },
  ], [t]);

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
      <FixedPin onClick={handlePostTopic}>{t('postTopic')}</FixedPin>
    </div>
  );
};

export default Community;

import type { FC } from 'react';
import classNames from 'classnames';
import { useState } from 'react';
import { CheckInfo } from '@/entities/follow';
import { TopicItem } from '@/entities/topic';
import { useTranslation } from '@/shared/i18n';
import styles from './Tabs.module.scss';

interface TabsProps {
  checkInfo?: any;
  topics?: any;
}

const Tabs: FC<TabsProps> = ({ checkInfo, topics }) => {
  const { t } = useTranslation('community');
  const tabs = [{ name: t('personal.tab.home') }, { name: t('personal.tab.topics') }, { name: t('personal.tab.favorites') }];
  const [activeTab, setActiveTab] = useState(0);

  const changeIndex = (index: number) => {
    setActiveTab(index);
  };
  return (
    <>
      <div className={styles.tabs}>
        {tabs.map((tab, i) => (
          <div
            key={tab.name}
            className={classNames(styles.tab, {
              [styles.active]: activeTab === i,
            })}
            onClick={() => changeIndex(i)}
          >
            {tab.name}
          </div>
        ))}
      </div>
      <div style={{ backgroundColor: '#F6F7F8', height: 8 }} />
      {tabContent(activeTab, checkInfo, topics)}
    </>
  );
};

const Topics: FC<{ topics: any }> = ({ topics }) => {
  return (
    <div>
      {topics?.map((topic: any) => (
        <TopicItem key={topic.id} data={topic} />
      ))}
    </div>
  );
};

interface HomeProps {
  checkInfo: any;
  topics: any;
}

const Home: FC<HomeProps> = ({ checkInfo, topics }) => {
  const { t } = useTranslation('community');

  return (
    <div>
      <div>
        <div className={styles.achieve}>{t('personal.achievementTitle')}</div>
        <CheckInfo className={styles['check-info']} data={checkInfo} />
      </div>
      <div style={{ backgroundColor: '#F6F7F8', height: 8 }} />
      <Topics topics={topics} />
    </div>
  );
};

function tabContent(index: number, checkInfo: any, topics: any) {
  switch (index) {
    case 0:
      return <Home checkInfo={checkInfo} topics={topics} />;
    case 1:
      return <Topics topics={topics} />;
    case 2:
      return <Topics topics={topics} />;
    default:
      return <Home checkInfo={checkInfo} topics={topics} />;
  }
}

export default Tabs;

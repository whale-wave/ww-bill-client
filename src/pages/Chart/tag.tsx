import type { FC } from 'react';
import { Tabs } from 'antd-mobile';
import styles from './tag.module.scss';
import indexStyles from './index.module.scss';
import List from '@/pages/Chart/list';

const Tag: FC = () => {
  const tabChange = (key: any) => {
    console.info(key, 'key');
  };

  return (
    <div className={indexStyles.autoList}>
      <div className={styles.tabsContainer}>
        <Tabs
          activeLineMode="fixed"
          style={{
            '--fixed-active-line-width': '20px',
            '--title-font-size': '12px',
            '--active-title-color': '#000000',
          }}
          onChange={key => tabChange(key)}
        >
          <Tabs.Tab title="超长的tab111" key="1">
            <div className={styles.tag_wrapper}>
              <div className={styles.chartText_wrapper}>
                <div className={styles.left}>
                  <div>
                    总支出：
                    <span>10058.91</span>
                  </div>
                  <div>
                    平均值：
                    <span>838.24</span>
                  </div>
                </div>
                <div className={styles.right}>
                  <span>5424.95</span>
                </div>
              </div>
              <List></List>
            </div>
          </Tabs.Tab>
          <Tabs.Tab title="超长的tab2" key="2">
            <div className={styles.tag_wrapper}>
              <List></List>
            </div>
          </Tabs.Tab>
          <Tabs.Tab title="超长的tab333" key="3">
            3
          </Tabs.Tab>
          <Tabs.Tab title="超长的tab4444" key="4">
            4
          </Tabs.Tab>
          <Tabs.Tab title="超长的tab55555" key="5">
            5
          </Tabs.Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default Tag;

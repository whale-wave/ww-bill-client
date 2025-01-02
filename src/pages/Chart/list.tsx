import type { FC } from 'react';
import { useState } from 'react';
import { ProgressBar, Space } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import styles from './list.module.scss';

const List: FC = () => {
  const [moneyList] = useState([
    {
      moneyType: '',
      Percentage: '20%',
      name: '餐饮',
      money: '10234.12',
    },
    {
      moneyType: '',
      Percentage: '20%',
      name: '餐饮',
      money: '10234.12',
    },
    {
      moneyType: '',
      Percentage: '20%',
      name: '餐饮',
      money: '10234.12',
    },
    {
      moneyType: '',
      Percentage: '20%',
      name: '餐饮',
      money: '10234.12',
    },
    {
      moneyType: '',
      Percentage: '20%',
      name: '餐饮',
      money: '10234.12',
    },
    {
      moneyType: '',
      Percentage: '20%',
      name: '餐饮',
      money: '10234.12',
    },
    {
      moneyType: '',
      Percentage: '20%',
      name: '餐饮',
      money: '10234.12',
    },
    {
      moneyType: '',
      Percentage: '20%',
      name: '餐饮',
      money: '10234.12',
    },
  ]);

  const navigate = useNavigate();

  const detailsChange = () => {
    console.info('11');
    navigate('/ChartDetails');
  };

  return (
    <div className={styles.list_wrapper}>
      <div className={styles.title}>
        <h3>支出排行榜</h3>
      </div>
      <div className={styles.main_wrapper}>
        {moneyList.map((item, index) => (
          <div
            className={styles.item_wrapper}
            key={index}
            onClick={() => detailsChange()}
          >
            <div className={styles.left_wrapper}>
            </div>
            <div className={styles.right_wrapper}>
              <div className={styles.moneyType_wrapper}>
                <div className={styles.moneyType_left}>
                  <div></div>
                  <span>{item.name}</span>
                </div>
                <div className={styles.moneyType_right}>
                  <span>{item.Percentage}</span>
                  <span>{item.money}</span>
                </div>
              </div>
              <div className={styles.space_wrapper}>
                <Space direction="vertical" block>
                  <ProgressBar
                    percent={50}
                    style={{
                      '--track-width': '4px',
                      '--track-color': '#ffffff',
                      '--fill-color': '#aeeeff',
                    }}
                  />
                </Space>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;

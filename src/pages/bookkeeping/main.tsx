import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Icon } from 'bw-mobile';
import classNames from 'classnames';
import styles from './main.module.scss';
import type { CategoryEntity } from '@/api/category';

interface ChangePropsFn {
  change: (item: CategoryEntity) => void;
  keyToggle: number;
  categoryList: CategoryEntity[];
  keyInputPadding: boolean;
}

const Main: FC<ChangePropsFn> = ({
  change,
  keyToggle,
  categoryList,
  keyInputPadding,
}) => {
  const [active, setActive] = useState(-1);

  const changeMainFn = (item: CategoryEntity) => {
    setActive(item.id);
    change(item);
  };

  const changKeyFn = (num: number) => {
    setActive(num);
  };

  useEffect(() => {
    changKeyFn(Number(keyToggle));
  }, [keyToggle]);

  return (
    <div
      className={classNames(
        keyToggle > -1 && !keyInputPadding
          ? [styles.activeKey, styles.context]
          : styles.context,
      )}
    >
      <div className={styles.main_wrapper}>
        {categoryList.map((item, index) => (
          <div
            className={styles.wrapper_item}
            key={index}
            onClick={() => changeMainFn(item)}
          >
            <div
              className={
                active === item.id ? styles.newClass_icon_backGround : ''
              }
            >
              <Icon name={item.icon} style={{ fontSize: 30 }} />
            </div>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Main;

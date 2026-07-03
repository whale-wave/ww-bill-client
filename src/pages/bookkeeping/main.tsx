import type { FC } from 'react';
import type { CategoryEntity } from '@/api/category';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Icon } from '@/shared/ui';
import styles from './main.module.scss';

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
  const [activeId, setActiveId] = useState(-1);

  const handleSelectCategory = (item: CategoryEntity) => {
    setActiveId(item.id);
    change(item);
  };

  useEffect(() => {
    setActiveId(Number(keyToggle));
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
        {categoryList.map(item => (
          <div
            className={styles.wrapper_item}
            key={item.id}
            onClick={() => handleSelectCategory(item)}
          >
            <div
              className={
                activeId === item.id ? styles.newClass_icon_backGround : ''
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

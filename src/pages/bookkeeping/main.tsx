import { FC, useEffect, useState } from 'react';
import { Icon } from 'bw-mobile';
import styles from './main.module.scss';
import { iconObj } from '@/api/category';
import classNames from 'classnames';

type ChangePropsFn = {
  change: (item: iconObj, active: number, addActive: number) => void;
  keyToggle: iconObj;
  categoryList: iconObj[];
  keyInputPadding: boolean;
};

const Main: FC<ChangePropsFn> = ({
  change,
  keyToggle,
  categoryList,
  keyInputPadding,
}) => {
  const [active, setActive] = useState(-1);
  const [addActive, setAddActive] = useState(-1);

  const changeMainFn = (item: iconObj) => {
    if (item.type === 'sub') {
      setActive(item.id);
    } else if (item.type === 'add') {
      setAddActive(item.id);
    }
    change(item, Number(active), Number(addActive));
  };

  const changKeyFn = () => {
    // setActive(num);
    console.log(active, 'active liang');
    console.log(addActive, 'addActive liang');
  };

  useEffect(() => {
    changKeyFn();
  }, [keyToggle]);

  return (
    <div
      className={classNames(
        keyToggle.id > -1 && !keyInputPadding
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
                (item.type === 'sub' ? active : addActive) === item.id
                  ? styles.newClass_icon_backGround
                  : ''
              }
            >
              <Icon name={item.icon} style={{ fontSize: 30 }} />
            </div>
            <span>
              {item.name}
              {item.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Main;

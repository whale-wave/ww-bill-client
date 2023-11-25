import React, { FC } from 'react';
import style from './list.module.scss';
// import {Icon} from "bw-mobile";

const List: FC = () => {
  return (
    <div className={style.list_wrapper}>
      <div className={style.title}>
        <h3>支出排行榜</h3>
      </div>
      <div className={style.main_wrapper}>
        <div className={style.item_wrapper}>
          <div className={style.left_wrapper}>
            {/*<Icon name={chunk.category.icon} style={{ fontSize: 20 }} />*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import NavBar from './navBar';
import Main from './main';
import KeyBoard from '@/pages/bookkeeping/keyboard';
import type { CategoryAmountType, CategoryEntity } from '@/api/category';
import { getCategoryApi } from '@/api/category';
import type { recordChildren } from '@/pages/detail/List';

export type stateType = [amount: string, time: string, id: number];

const Bookkeeping: FC = () => {
  const [keyToggle, setKeyToggle] = useState<number>(-1); // 图标的id
  const [keyInputPadding, setKeyInputPadding] = useState<boolean>(false); // 图标的id
  const [name, setName] = useState(''); // 图标选项的名称
  const [type1, setType1] = useState<CategoryAmountType>('sub'); // 切换支出和收入
  const navParams = useLocation();
  const list: recordChildren = navParams.state as recordChildren;
  const state = list;
  const [stateList, setSateList] = useState<stateType>(['', '', 1]);

  const [searchParams] = useSearchParams();
  const selectTime = searchParams.get('selectTime');
  const defaultSelectDate = selectTime ? dayjs(Number(selectTime)).toDate() : undefined;

  const handleChangeTab = (item: CategoryEntity) => {
    if (item) {
      setName(item.name);
      setKeyToggle(item.id);
    }
  };

  const changeKeyInputToggle = (bool: boolean) => {
    setKeyInputPadding(bool);
  };

  const navBarType = (type: CategoryAmountType) => {
    setType1(type);
  };

  useEffect(() => {
    if (state) {
      // 回显
      const chunkKey: stateType = [state.amount, state.time, state.id];
      setSateList(chunkKey);
      navBarType(state.type as CategoryAmountType);
      const list = {
        createdAt: state.createdAt,
        icon: state.category.icon,
        id: state.category.id,
        name: state.remark,
        updatedAt: state.updatedAt,
      };
      handleChangeTab(list as any);
    }
  }, []);

  const [mainList, setMainList] = useState<CategoryEntity[]>([]);

  const cateFn = async (type: CategoryAmountType) => {
    const res = await getCategoryApi({
      type,
    });
    const data = res.data.data;
    setMainList(data);
  };

  useEffect(() => {
    void cateFn(type1);
  }, [type1]);

  return (
    <div className={styles.bookkeeping}>
      <NavBar defaultSelectDate={defaultSelectDate} change={navBarType} type={type1}></NavBar>
      <Main
        change={handleChangeTab}
        keyToggle={keyToggle}
        categoryList={mainList}
        keyInputPadding={keyInputPadding}
      >
      </Main>
      <KeyBoard
        defaultSelectDate={defaultSelectDate}
        categoryList={mainList}
        change={changeKeyInputToggle}
        keyToggle={keyToggle}
        name={name}
        type={type1}
        stateList={stateList}
        state={state}
      >
      </KeyBoard>
    </div>
  );
};

export default Bookkeeping;

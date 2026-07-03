import type { FC } from 'react';
import type { CategoryAmountType, CategoryEntity } from '@/api/category';
import type { recordChildren } from '@/entities/record';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useGetCategoryQuery } from '@/hooks';
import KeyBoard from '@/pages/bookkeeping/keyboard';
import styles from './index.module.scss';
import Main from './main';
import NavBar from './navBar';

export type stateType = [amount: string, time: string, id: number];

const Bookkeeping: FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(-1);
  const [keyInputPadding, setKeyInputPadding] = useState<boolean>(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [recordType, setRecordType] = useState<CategoryAmountType>('sub');
  const navParams = useLocation();
  const editState = navParams.state as recordChildren;
  const [stateList, setStateList] = useState<stateType>(['', '', 1]);

  const [searchParams] = useSearchParams();
  const selectTime = searchParams.get('selectTime');
  const defaultSelectDate = selectTime ? dayjs(Number(selectTime)).toDate() : undefined;

  const handleSelectCategory = (item: CategoryEntity) => {
    setSelectedCategoryName(item.name);
    setSelectedCategoryId(item.id);
  };

  const handleKeyInputToggle = (bool: boolean) => {
    setKeyInputPadding(bool);
  };

  const handleTypeChange = (type: CategoryAmountType) => {
    setRecordType(type);
  };

  useEffect(() => {
    if (editState) {
      const chunkKey: stateType = [editState.amount, editState.time, editState.id];
      setStateList(chunkKey);
      handleTypeChange(editState.type as CategoryAmountType);
      const category = {
        createdAt: editState.createdAt,
        icon: editState.category.icon,
        id: editState.category.id,
        name: editState.remark,
        updatedAt: editState.updatedAt,
      };
      handleSelectCategory(category as any);
    }
  }, [editState]);

  const { data: mainList } = useGetCategoryQuery({
    params: {
      type: recordType,
    },
  });

  return (
    <div className={styles.bookkeeping}>
      <NavBar defaultSelectDate={defaultSelectDate} change={handleTypeChange} type={recordType} />
      <Main
        change={handleSelectCategory}
        keyToggle={selectedCategoryId}
        categoryList={mainList}
        keyInputPadding={keyInputPadding}
      />
      <KeyBoard
        defaultSelectDate={defaultSelectDate}
        categoryList={mainList}
        change={handleKeyInputToggle}
        keyToggle={selectedCategoryId}
        name={selectedCategoryName}
        type={recordType}
        stateList={stateList}
        state={editState}
      />
    </div>
  );
};

export default Bookkeeping;

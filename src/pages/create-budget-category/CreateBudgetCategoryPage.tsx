import type { BudgetEntityType } from '@/entities/budget';
import type { CategoryEntity } from '@/entities/category';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BudgetEntityLevel } from '@/entities/budget';
import { useGetCategoryQuery } from '@/entities/category';
import { BudgetModel } from '@/pages/budget/ui';
import { Icon, NavBar } from '@/shared/ui';
import { useTranslation } from '@/shared/i18n';

interface CreateBudgetCategoryProps {
}

const CreateBudgetCategory: React.FC<CreateBudgetCategoryProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'budget']);
  const { type: _type } = useParams() as { type: string };
  const type = Number(_type) as BudgetEntityType;

  const [selectCategory, setSelectCategory] = useState<CategoryEntity | undefined>();
  const [visible, setVisible] = useState(false);

  const { data } = useGetCategoryQuery({ params: { type: 'sub' } });

  const onBack = useCallback(() => {
    navigate(`/budget?type=${type}`, { replace: true });
  }, []);

  const onSelectIcon = useCallback((category: CategoryEntity) => () => {
    setSelectCategory(category);
    setVisible(true);
  }, []);

  const onCloseModel = useCallback(() => {
    setSelectCategory(undefined);
  }, []);

  return (
    <div className="page-new">
      <NavBar back={false} backArrow={false} right={<div onClick={onBack}>{t('nav.cancel')}</div>}>{t('budget:createCategory')}</NavBar>
      <div className="flex flex-wrap flex-grow overflow-auto pb-8">
        {data.map(c => (
          <div className="w-[24.9%] flex flex-col justify-center items-center py-2" key={c.id} onClick={onSelectIcon(c)}>
            <div className={classNames('flex justify-center items-center w-[55px] h-[55px] rounded-full mb-2', {
              'bg-primary': selectCategory?.id === c.id,
              'bg-[#ccc]': selectCategory?.id !== c.id,
            })}
            >
              <Icon className="text-[30px]" name={c.icon} />
            </div>
            <div>{c.name}</div>
          </div>
        ))}
      </div>
      <BudgetModel visible={visible} setVisible={setVisible} type={type} level={BudgetEntityLevel.CATEGORY} onClose={onCloseModel} category={selectCategory} />
    </div>
  );
};

export default CreateBudgetCategory;

import React, { useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { ActionSheet, Button, Dialog, ErrorBlock, Skeleton } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import style from './index.module.scss';
import { useDeleteBudgetCategoryByBudgetIdMutation, useGetBudgetInfoQuery, usePostBudgetClearMutation } from '@/hooks';
import type { BudgetInfo, CategoryEntity } from '@/api';
import { BudgetEntityLevel, BudgetEntityType } from '@/api';
import { BudgetModel, BudgetModelModelType, BudgetTop } from '@/pages/Budget/components';
import { BudgetPageContext } from '@/pages/Budget/store/budgetPageContext.ts';
import { BottomAction, BudgetItem } from '@/components';

interface BudgetProps {
}

const Budget: React.FC<BudgetProps> = () => {
  const [searchParams] = useSearchParams();
  const typeByUrl = searchParams.get('type');
  const [budgetEntityType, setBudgetEntityType] = useState<BudgetEntityType>(typeByUrl ? Number(typeByUrl) : BudgetEntityType.MONTH);
  const budgetPageContentValue = useMemo(() => ({ budgetEntityType, setBudgetEntityType }), [budgetEntityType, setBudgetEntityType]);

  const navigate = useNavigate();

  const { data, isLoading } = useGetBudgetInfoQuery({ params: { type: budgetEntityType } });
  const [postBudgetClearMutate] = usePostBudgetClearMutation();
  const [deleteBudgetCategoryByBudgetIdMutate] = useDeleteBudgetCategoryByBudgetIdMutation();

  const dropDownWrapperRef = useRef<HTMLDivElement>(null);
  const [isAddSummaryBudgetVisible, setIsAddSummaryBudgetVisible] = useState(false);
  const [curLevel, setCurLevel] = useState<BudgetEntityLevel | undefined>();
  const [curBudgetId, setCurBudgetId] = useState<string | undefined>();
  const [curCategory, setCurCategory] = useState<CategoryEntity | undefined>();
  const [modelType, setModelType] = useState<BudgetModelModelType>(BudgetModelModelType.CREATE);

  const onBudgetClick = useCallback((budgetInfo: BudgetInfo, level: BudgetEntityLevel) => () => {
    const isSummaryBudget = level === BudgetEntityLevel.SUMMARY;
    const text = budgetPageContentValue.budgetEntityType === BudgetEntityType.MONTH ? '月' : '年';

    const actionSheet = ActionSheet.show({
      cancelText: '取消',
      actions: [
        {
          text: isSummaryBudget ? `编辑${text}度总预算` : `编辑${budgetInfo.category!.name}预算`,
          key: 'edit',
          onClick: async () => {
            actionSheet.close();

            setIsAddSummaryBudgetVisible(true);
            setCurLevel(level);
            setCurBudgetId(budgetInfo.id);
            setModelType(BudgetModelModelType.EDIT);

            if (level === BudgetEntityLevel.CATEGORY) {
              setCurCategory(budgetInfo.category!);
            }
          },
        },
        {
          text: isSummaryBudget ? `清除${text}度总预算` : `删除${budgetInfo.category!.name}预算`,
          key: 'clear',
          onClick: async () => {
            actionSheet.close();

            if (isSummaryBudget) {
              const confirm = await Dialog.confirm({
                title: '警告',
                content: '清除总预算将同时为您清除所有分类预算',
              });
              if (!confirm)
                return;

              await postBudgetClearMutate({
                type: budgetPageContentValue.budgetEntityType,
              });
            }
            else {
              await deleteBudgetCategoryByBudgetIdMutate({ budgetId: budgetInfo.id, data: { type: budgetPageContentValue.budgetEntityType } });
            }
          },
        },
      ],
    });
  }, [budgetPageContentValue.budgetEntityType]);

  const onAddSummaryBudget = useCallback(() => {
    setIsAddSummaryBudgetVisible(true);
    setCurLevel(BudgetEntityLevel.SUMMARY);
  }, []);

  const onCloseBudgetModel = useCallback(() => {
    setCurLevel(undefined);
    setCurBudgetId(undefined);
    setCurCategory(undefined);
    setModelType(BudgetModelModelType.CREATE);
  }, []);

  const onGoToCreateBudgetCategoryPage = useCallback(() => {
    navigate(`/budget/category/${budgetPageContentValue.budgetEntityType}`, { replace: true });
  }, [budgetPageContentValue.budgetEntityType]);

  return (
    <div className={classNames('page-new bg-[#f6f6f6] fixed top-0 left-0 h-screen w-full pt-[45px]', style['budget-page'])} ref={dropDownWrapperRef}>
      <BudgetPageContext.Provider value={budgetPageContentValue}>
        { typeof curLevel === 'number' && (
          <BudgetModel
            modelType={modelType}
            visible={isAddSummaryBudgetVisible}
            setVisible={setIsAddSummaryBudgetVisible}
            type={budgetPageContentValue.budgetEntityType}
            level={curLevel}
            onClose={onCloseBudgetModel}
            budgetId={curBudgetId}
            category={curCategory}
          />
        )}
        <BudgetTop dropDownWrapperRef={dropDownWrapperRef} />
        <div className="flex flex-grow flex-col overflow-auto min-h-0">
          {
            isLoading
              ? (
                  <div className="flex-grow flex flex-col px-4">
                    <Skeleton.Title animated />
                    <Skeleton.Paragraph lineCount={5} animated />
                  </div>
                )
              : !data?.summaryBudget
                  ? (
                      <div className="flex-grow flex flex-col justify-center items-center space-y-4">
                        <div
                          className="flex flex-col justify-center items-center space-y-4"
                          style={{
                            transform: 'translateY(-30%)',
                          }}
                        >
                          <ErrorBlock status="empty" title="暂无预算" description={false} />
                          <Button shape="rounded" color="primary" className="flex items-center w-[200px]" onClick={onAddSummaryBudget}>
                            <AddOutline />
                            <span>添加预算</span>
                          </Button>
                        </div>
                      </div>
                    )
                  : (
                      <div className="flex flex-grow flex-col">
                        <BudgetItem budgetEntityType={budgetEntityType} className="mb-3" data={data.summaryBudget} onClick={onBudgetClick(data.summaryBudget, BudgetEntityLevel.SUMMARY)} />
                        {!data?.categoryBudgets?.length
                          ? <div className="flex-grow bg-[#fff] flex justify-center items-center mb-[50px]"><ErrorBlock status="empty" title="未设置分类预算" description="" /></div>
                          : (
                              <div className="flex flex-grow flex-col overflow-auto min-h-0 pb-[50px]">
                                <div className="bg-[#fff] p-3 text-[15px]">分类预算</div>
                                {data.categoryBudgets.map((item, index) => (
                                  <BudgetItem
                                    index={index}
                                    lastIndex={data.categoryBudgets!.length - 1}
                                    budgetEntityType={budgetEntityType}
                                    key={item.category!.id}
                                    type={BudgetEntityLevel.CATEGORY}
                                    data={item}
                                    onClick={onBudgetClick(item, BudgetEntityLevel.CATEGORY)}
                                  />
                                ))}
                              </div>
                            )}
                        <BottomAction
                          className="h-[50px] shadow-md"
                          actions={[{
                            key: 'add',
                            render: () => (
                              <div className="flex items-center">
                                <AddOutline />
                                <span>添加分类预算</span>
                              </div>
                            ),
                            onClick: onGoToCreateBudgetCategoryPage,
                          }]}
                        />
                      </div>
                    )
          }
        </div>
      </BudgetPageContext.Provider>
    </div>
  );
};

export default Budget;

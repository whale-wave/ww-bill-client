import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { Tiny } from '@ant-design/charts';
import dayjs from 'dayjs';
import { ActionSheet, Button, Dialog, ErrorBlock, Skeleton } from 'antd-mobile';
import { Icon } from 'bw-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import useUrlState from '@ahooksjs/use-url-state';
import style from './index.module.scss';
import { useGetBudgetInfoQuery, usePostBudgetClearMutation } from '@/hooks';
import type { BudgetInfo } from '@/api';
import { BudgetEntityLevel, BudgetEntityType } from '@/api';
import { BudgetTop, CreateBudgetModel } from '@/pages/Budget/components';
import { BudgetPageContext } from '@/pages/Budget/store/budgetPageContext.ts';
import { BottomAction } from '@/components';

const THEME_COLOR = '#aeeeff';

export interface BudgetItemProps {
  className?: string;
  budgetEntityType: BudgetEntityType;
  type?: BudgetEntityLevel;
  data: BudgetInfo;
  style?: React.CSSProperties;
  index?: number;
  lastIndex?: number;
  onClick: () => void;
}

export const BudgetItem: React.FC<BudgetItemProps> = memo(({ budgetEntityType, type = BudgetEntityLevel.SUMMARY, className, data, style, index, lastIndex, onClick }) => {
  const isAll = type === BudgetEntityLevel.SUMMARY;

  const config = {
    height: 100,
    width: 100,
    paddingTop: isAll ? 10 : 15,
    paddingBottom: isAll ? 10 : 15,
    paddingRight: isAll ? 10 : 15,
    paddingLeft: -10,
    percent: Number(data.remainingPercentage) < 0 ? 0.0001 : Number(data.remainingPercentage) / 100,
    autoFit: true,
    color: ['#f2f2f2', THEME_COLOR],
    annotations: [
      {
        type: 'text',
        style: {
          text: `剩余`,
          x: '50%',
          y: '38%',
          textAlign: 'center',
          fontSize: isAll ? 12 : 11,
          fill: '#666',
        },
      },
      {
        type: 'text',
        style: {
          text: `${data.remainingPercentage}%`,
          x: '50%',
          y: '62%',
          textAlign: 'center',
          fontSize: isAll ? 14 : 13,
        },
      },
    ],
  };

  if (Number(data.remainingPercentage) < 0) {
    config.annotations = [
      {
        type: 'text',
        style: {
          text: `已超支`,
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: isAll ? 16 : 14,
          fill: '#e84149',
        },
      },
    ];
  }

  return (
    <div
      className={classNames('flex-shrink-0 bg-[#fff] flex flex-col pt-3 pr-3 relative', className, {
        'pl-3': isAll,
        'pl-5': !isAll,
      })}
      style={style}
      onClick={onClick}
    >
      {
        typeof index === 'number' && typeof lastIndex === 'number' && index !== lastIndex && <div className="absolute w-[95%] h-[1px] bg-[#f3f3f3] right-0 bottom-0"></div>
      }
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          { isAll
            ? (
              <div className="text-[15px]">
                {budgetEntityType === BudgetEntityType.MONTH ? `${dayjs().format('MM')}月` : `${dayjs().format('YYYY')}年`}
                总预算
              </div>
              )
            : (
              <div className="flex items-center justify-center space-x-2">
                <div className="rounded-full text-[15px] bg-[#f2f2f2] w-[22px] h-[22px] flex justify-center items-center">
                  <Icon name={data.category!.icon} />
                </div>
                <div className="flex items-center" style={{ transform: 'translateY(0px)' }}>{data.category!.name}</div>
              </div>
              )}
        </div>
        <div className="text-[13px] text-[#6C6C6C]">编辑</div>
      </div>
      <div className="flex flex-grow h-[110px]">
        <div className="flex justify-center items-center mr-2"><Tiny.Ring {...config} /></div>
        <div className="flex-grow flex flex-col justify-center space-y-3">
          <div className="flex justify-between items-center text-[15px] border-0 border-b-[1px] border-solid border-[#f3f3f3] pb-1">
            <div>剩余预算:</div>
            <div className="text-[15px]">{data.remaining}</div>
          </div>
          <div className="flex justify-between items-center text-[12px] text-[#666]">
            <div>
              {isAll && '本月'}
              预算:
            </div>
            <div>{data.budgetAmount}</div>
          </div>
          <div className="flex justify-between items-center text-[12px] text-[#666]">
            <div>
              {isAll && '本月'}
              支出:
            </div>
            <div>{data.amount}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

interface BudgetProps {
}

const Budget: React.FC<BudgetProps> = () => {
  const [urlState] = useUrlState();
  const typeByUrl = urlState.type;
  const [budgetEntityType, setBudgetEntityType] = useState<BudgetEntityType>(typeByUrl ? Number(typeByUrl) : BudgetEntityType.MONTH);
  const budgetPageContentValue = useMemo(() => ({ budgetEntityType, setBudgetEntityType }), [budgetEntityType, setBudgetEntityType]);

  const navigate = useNavigate();

  const { data, isLoading } = useGetBudgetInfoQuery({ params: { type: budgetEntityType } });
  const [postBudgetClearMutate] = usePostBudgetClearMutation();

  const dropDownWrapperRef = useRef<HTMLDivElement>(null);
  const [isAddSummaryBudgetVisible, setIsAddSummaryBudgetVisible] = useState(false);
  const [curLevel, setCurLevel] = useState<BudgetEntityLevel | undefined>();

  const onBudgetClick = useCallback((budgetInfo: BudgetInfo, level: BudgetEntityLevel) => () => {
    const isAll = level === BudgetEntityLevel.SUMMARY;
    const text = budgetPageContentValue.budgetEntityType === BudgetEntityType.MONTH ? '月' : '年';

    const actionSheet = ActionSheet.show({
      cancelText: '取消',
      actions: [
        {
          text: isAll ? `编辑${text}度总预算` : `编辑${budgetInfo.category!.name}预算`,
          key: 'edit',
          onClick: () => {
            actionSheet.close();
          },
        },
        {
          text: isAll ? `清除${text}度总预算` : `删除${budgetInfo.category!.name}预算`,
          key: 'clear',
          onClick: async () => {
            actionSheet.close();

            if (isAll) {
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
              // eslint-disable-next-line no-console
              console.log('清除分类预算');
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
  }, []);

  const onGoToCreateBudgetCategoryPage = useCallback(() => {
    navigate(`/budget/category/${budgetPageContentValue.budgetEntityType}`, { replace: true });
  }, [budgetPageContentValue.budgetEntityType]);

  return (
    <div className={classNames('page-new bg-[#f6f6f6] fixed top-0 left-0 h-screen w-full pt-[45px]', style['budget-page'])} ref={dropDownWrapperRef}>
      <BudgetPageContext.Provider value={budgetPageContentValue}>
        { typeof curLevel === 'number' && (
          <CreateBudgetModel
            visible={isAddSummaryBudgetVisible}
            setVisible={setIsAddSummaryBudgetVisible}
            type={budgetPageContentValue.budgetEntityType}
            level={curLevel}
            onClose={onCloseBudgetModel}
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

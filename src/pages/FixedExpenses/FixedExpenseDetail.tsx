import { Skeleton } from 'antd-mobile';
import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FixedExpenseCycle } from '@/api';
import { useGetFixedExpenseByIdQuery } from '@/hooks';
import { cn } from '@/shared/lib';
import { NavBar } from '@/shared/ui';
import { EditAndDeleteButton } from './components';
import {
  currencyLabelMap,
  cycleLabelMap,
  priorityLabelMap,
  statusColorMap,
  statusLabelMap,
  typeIconMap,
  typeLabelMap,
} from './constants';
import { formatAmountWithCurrency, formatDate, formatNextBillingDate } from './utils';

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between py-2.5">
    <span className="text-[13px] text-font-gray">{label}</span>
    <span className="ml-3 max-w-[60%] text-right text-[14px] text-font-black">
      {value || <span className="text-font-gray">--</span>}
    </span>
  </div>
);

const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={cn('rounded-xl bg-white p-3 shadow-sm', className)}>
    {title && (
      <div className="mb-1 text-[12px] font-medium text-font-gray">{title}</div>
    )}
    <div className="divide-y divide-bg-gray">{children}</div>
  </div>
);

const FixedExpenseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };

  const { data: detail, isLoading } = useGetFixedExpenseByIdQuery({ params: { id } });

  const onBack = useCallback(() => navigate(-1), [navigate]);

  const statusColor = useMemo(
    () => (detail ? statusColorMap[detail.status] : undefined),
    [detail],
  );

  return (
    <div className="page-new overflow-hidden">
      <NavBar onBack={onBack}>固定支出详情</NavBar>
      <div className="flex-grow space-y-3 overflow-auto bg-bg-gray px-3 py-3">
        {isLoading || !detail
          ? (
              <div className="rounded-xl bg-white p-3">
                <Skeleton.Title animated />
                <Skeleton.Paragraph animated lineCount={6} />
              </div>
            )
          : (
              <>
                <div
                  className="relative overflow-hidden rounded-2xl p-4 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #5ab8e8 0%, #4fa9dc 52%, #3a87c4 100%)' }}
                >
                  <div className="absolute -right-10 -top-14 h-36 w-36 rounded-full bg-white/15" />
                  <div className="absolute -bottom-14 -left-6 h-28 w-28 rounded-full bg-white/10" />
                  <div className="relative flex items-center space-x-2 text-white">
                    <span className="text-[22px]">{typeIconMap[detail.type]}</span>
                    <span className="text-[16px] font-medium">{detail.name}</span>
                    {statusColor && (
                      <span className="ml-auto inline-flex items-center space-x-1 rounded-full bg-white/25 px-2 py-0.5 text-[11px] backdrop-blur">
                        <span className={cn('h-1.5 w-1.5 rounded-full', statusColor.dot)} />
                        <span>{statusLabelMap[detail.status]}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative mt-3 flex items-baseline space-x-1 text-white">
                    <span className="text-[28px] font-bold leading-none drop-shadow-sm">
                      {formatAmountWithCurrency(detail.amount, detail.currency)}
                    </span>
                    <span className="text-[12px] text-white/80">
                      /
                      {cycleLabelMap[detail.cycle]}
                    </span>
                  </div>
                  {detail.nextBillingDate && (
                    <div className="relative mt-2 text-[12px] text-white/85">
                      {formatNextBillingDate(detail.nextBillingDate)}
                    </div>
                  )}
                </div>

                <Card title="基础信息">
                  <Row label="类型" value={typeLabelMap[detail.type]} />
                  <Row label="优先级" value={priorityLabelMap[detail.priority]} />
                  <Row label="币种" value={currencyLabelMap[detail.currency]} />
                  <Row label="支出周期" value={cycleLabelMap[detail.cycle]} />
                  {detail.cycle === FixedExpenseCycle.CUSTOM && (
                    <Row label="自定义天数" value={detail.customCycleDays ? `${detail.customCycleDays} 天` : undefined} />
                  )}
                </Card>

                <Card title="账单与日期">
                  <Row label="账单日" value={detail.billingDay ? `每月 ${detail.billingDay} 日` : undefined} />
                  <Row label="下次账单日期" value={formatDate(detail.nextBillingDate)} />
                  <Row label="开始日期" value={formatDate(detail.startDate)} />
                  <Row label="结束日期" value={formatDate(detail.endDate)} />
                </Card>

                <Card title="支付信息">
                  <Row label="服务商" value={detail.provider} />
                  <Row label="账号" value={detail.account} />
                  <Row label="支付方式" value={detail.paymentMethod} />
                </Card>

                <Card title="状态与提醒">
                  <Row label="自动续费" value={detail.autoRenew ? '是' : '否'} />
                  <Row label="开启提醒" value={detail.reminderEnabled ? '是' : '否'} />
                  {detail.reminderEnabled && (
                    <Row label="提前提醒" value={`${detail.reminderDaysBefore} 天`} />
                  )}
                  <Row label="纳入支出汇总" value={detail.includeInStatistics ? '是' : '否'} />
                  <Row label="排序权重" value={detail.sort} />
                </Card>

                {detail.comment && (
                  <Card title="备注">
                    <div className="py-2 text-[14px] text-font-black">{detail.comment}</div>
                  </Card>
                )}
              </>
            )}
      </div>
      <EditAndDeleteButton fixedExpenseId={detail?.id} />
    </div>
  );
};

export default FixedExpenseDetail;

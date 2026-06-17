import type {
  CreateFixedExpenseApiData,
} from '@/api';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Selector,
  Stepper,
  Switch,
  TextArea,
  Toast,
} from 'antd-mobile';
import { DownOutline, RightOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FixedExpenseCurrency,
  FixedExpenseCycle,
  FixedExpensePriority,
  FixedExpenseStatus,
  FixedExpenseType,
} from '@/api';
import {
  useGetFixedExpenseByIdQuery,
  usePatchFixedExpenseMutation,
  usePostFixedExpenseMutation,
} from '@/hooks';
import { cn, normalizeAmount } from '@/utils';
import {
  currencyOptions,
  cycleOptions,
  priorityOptions,
  statusOptions,
  typeOptions,
} from '../constants';

interface FixedExpenseFormProps {
  id?: string;
}

interface FormValues {
  name: string;
  amount: string;
  currency: FixedExpenseCurrency[];
  cycle: FixedExpenseCycle[];
  customCycleDays?: number;
  billingDay?: number;
  nextBillingDate?: Date;
  startDate?: Date;
  endDate?: Date;
  status: FixedExpenseStatus[];
  type: FixedExpenseType[];
  priority: FixedExpensePriority[];
  provider?: string;
  account?: string;
  paymentMethod?: string;
  autoRenew: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  includeInStatistics: boolean;
  sort: number;
  comment?: string;
}

const defaultValues: FormValues = {
  name: '',
  amount: '',
  currency: [FixedExpenseCurrency.CNY],
  cycle: [FixedExpenseCycle.MONTHLY],
  status: [FixedExpenseStatus.ACTIVE],
  type: [FixedExpenseType.OTHER],
  priority: [FixedExpensePriority.NORMAL],
  autoRenew: true,
  reminderEnabled: false,
  reminderDaysBefore: 3,
  includeInStatistics: true,
  sort: 0,
};

interface SectionProps {
  title: string;
  required?: boolean;
  description?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title,
  required,
  description,
  collapsible = false,
  defaultOpen = true,
  className,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const expanded = !collapsible || open;

  return (
    <div className={cn('mx-3 mb-3 overflow-hidden rounded-xl bg-white shadow-sm', className)}>
      <div
        className={cn(
          'flex items-center justify-between px-3 py-2.5',
          collapsible ? 'cursor-pointer active:bg-slate-50' : '',
          expanded ? 'border-b border-slate-100' : '',
        )}
        onClick={collapsible ? () => setOpen(v => !v) : undefined}
      >
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            {required && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            )}
            <span className="text-[13px] font-medium text-slate-800">{title}</span>
            {required && (
              <span className="rounded bg-rose-50 px-1 text-[10px] text-rose-500">必填</span>
            )}
          </div>
          {description && (
            <span className="mt-0.5 text-[11px] text-font-gray">{description}</span>
          )}
        </div>
        {collapsible && (
          <span className="text-font-gray">
            {open ? <DownOutline /> : <RightOutline />}
          </span>
        )}
      </div>
      {expanded && <div>{children}</div>}
    </div>
  );
};

interface DatePickerFieldProps {
  value?: Date;
  onChange?: (value?: Date) => void;
  placeholder?: string;
  clearable?: boolean;
  min?: Date;
  max?: Date;
}

const DatePickerField: React.FC<DatePickerFieldProps> = (props) => {
  const { value, onChange, placeholder = '请选择日期', clearable = true, min, max } = props;
  const [visible, setVisible] = useState(false);

  const display = useMemo(() => (value ? dayjs(value).format('YYYY-MM-DD') : ''), [value]);

  return (
    <>
      <div
        className="flex w-full items-center justify-between"
        onClick={() => setVisible(true)}
      >
        <span className={cn(display ? 'text-slate-800' : 'text-font-gray')}>
          {display || placeholder}
        </span>
        {clearable && display && (
          <span
            className="ml-2 text-[12px] text-font-gray"
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(undefined);
            }}
          >
            清除
          </span>
        )}
      </div>
      <DatePicker
        visible={visible}
        value={value}
        min={min}
        max={max}
        onClose={() => setVisible(false)}
        onConfirm={(val) => {
          onChange?.(val);
          setVisible(false);
        }}
      />
    </>
  );
};

interface BillingDayFieldProps {
  value?: number;
  onChange?: (value?: number) => void;
}

const BillingDayField: React.FC<BillingDayFieldProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Stepper min={1} max={31} allowEmpty value={value as any} onChange={onChange as any} />
      {typeof value === 'number' && value >= 1 && value <= 31 && (
        <span className="text-[12px] text-font-gray">
          每月第
          {' '}
          {value}
          {' '}
          日
        </span>
      )}
    </div>
  );
};

const RequiredLabel: React.FC<{ text: string }> = ({ text }) => (
  <span className="flex items-center">
    <span className="mr-1 text-rose-500">*</span>
    <span>{text}</span>
  </span>
);

const FixedExpenseForm: React.FC<FixedExpenseFormProps> = (props) => {
  const { id } = props;
  const navigate = useNavigate();

  const isEdit = useMemo(() => !!id, [id]);

  const { data: detail, isLoading } = useGetFixedExpenseByIdQuery({
    params: { id: id! },
    queryOptions: { enabled: isEdit },
  });

  const [postMutate] = usePostFixedExpenseMutation();
  const [patchMutate] = usePatchFixedExpenseMutation();

  const [formAction] = Form.useForm();
  const [cycleValue, setCycleValue] = useState<FixedExpenseCycle>(FixedExpenseCycle.MONTHLY);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const isDisabled = useMemo(() => (isEdit ? isLoading : false), [isEdit, isLoading]);

  useEffect(() => {
    if (!detail)
      return;
    const next: FormValues = {
      name: detail.name,
      amount: detail.amount,
      currency: [detail.currency],
      cycle: [detail.cycle],
      customCycleDays: detail.customCycleDays,
      billingDay: detail.billingDay,
      nextBillingDate: detail.nextBillingDate ? new Date(detail.nextBillingDate) : undefined,
      startDate: detail.startDate ? new Date(detail.startDate) : undefined,
      endDate: detail.endDate ? new Date(detail.endDate) : undefined,
      status: [detail.status],
      type: [detail.type],
      priority: [detail.priority],
      provider: detail.provider,
      account: detail.account,
      paymentMethod: detail.paymentMethod,
      autoRenew: detail.autoRenew,
      reminderEnabled: detail.reminderEnabled,
      reminderDaysBefore: detail.reminderDaysBefore,
      includeInStatistics: detail.includeInStatistics,
      sort: detail.sort,
      comment: detail.comment,
    };
    formAction.setFieldsValue(next);
    setCycleValue(detail.cycle);
    setReminderEnabled(detail.reminderEnabled);
  }, [detail, formAction]);

  const onValuesChange = useCallback((changed: Partial<FormValues>) => {
    if (changed.cycle?.[0]) {
      setCycleValue(changed.cycle[0]);
    }
    if (typeof changed.reminderEnabled === 'boolean') {
      setReminderEnabled(changed.reminderEnabled);
    }
  }, []);

  const onFinishFailed = useCallback((errorInfo: any) => {
    const first = errorInfo?.errorFields?.[0]?.errors?.[0];
    void Toast.show({ icon: 'fail', content: first || '请完善表单' });
  }, []);

  const onFinish = useCallback(async (values: FormValues) => {
    if (isDisabled)
      return;

    const payload: CreateFixedExpenseApiData = {
      name: values.name.trim(),
      amount: values.amount,
      currency: values.currency?.[0] ?? FixedExpenseCurrency.CNY,
      cycle: values.cycle?.[0] ?? FixedExpenseCycle.MONTHLY,
      customCycleDays: values.cycle?.[0] === FixedExpenseCycle.CUSTOM ? values.customCycleDays : undefined,
      billingDay: values.billingDay,
      nextBillingDate: values.nextBillingDate ? values.nextBillingDate.toISOString() : undefined,
      startDate: values.startDate ? values.startDate.toISOString() : undefined,
      endDate: values.endDate ? values.endDate.toISOString() : undefined,
      status: values.status?.[0] ?? FixedExpenseStatus.ACTIVE,
      type: values.type?.[0] ?? FixedExpenseType.OTHER,
      priority: values.priority?.[0] ?? FixedExpensePriority.NORMAL,
      provider: values.provider,
      account: values.account,
      paymentMethod: values.paymentMethod,
      autoRenew: values.autoRenew,
      reminderEnabled: values.reminderEnabled,
      reminderDaysBefore: values.reminderDaysBefore ?? 3,
      includeInStatistics: values.includeInStatistics,
      sort: values.sort ?? 0,
      comment: values.comment,
    };

    if (id) {
      await patchMutate({ id, params: payload });
      void Toast.show({ icon: 'success', content: '保存成功' });
    }
    else {
      await postMutate(payload);
      void Toast.show({ icon: 'success', content: '创建成功' });
    }

    navigate(-1);
  }, [id, isDisabled, patchMutate, postMutate, navigate]);

  return (
    <Form
      initialValues={defaultValues}
      form={formAction}
      layout="horizontal"
      requiredMarkStyle="none"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      onValuesChange={onValuesChange}
      disabled={isDisabled}
      className="ww-fixed-expense-form"
      footer={(
        <Button block type="submit" color="primary" size="large">
          {isEdit ? '保存修改' : '保存'}
        </Button>
      )}
    >
      <Section title="必填信息" required description="先填这些基本信息即可创建">
        <Form.Item
          name="name"
          label={<RequiredLabel text="名称" />}
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input placeholder="例如:百度云会员" clearable />
        </Form.Item>
        <Form.Item
          name="amount"
          label={<RequiredLabel text="金额" />}
          description="单期实际扣款金额,汇总会按周期换算到月"
          rules={[
            { required: true, message: '请输入金额' },
            {
              validator: async (_, value) => {
                if (!value || Number(value) <= 0)
                  throw new Error('金额必须大于 0');
              },
            },
          ]}
          normalize={normalizeAmount as any}
        >
          <Input type="text" inputMode="decimal" placeholder="请输入金额" clearable />
        </Form.Item>
        <Form.Item
          name="cycle"
          label={<RequiredLabel text="支出周期" />}
          description="决定金额按多久扣一次,系统会折算成月支出"
        >
          <Selector columns={3} options={cycleOptions} />
        </Form.Item>
        {cycleValue === FixedExpenseCycle.CUSTOM && (
          <Form.Item
            name="customCycleDays"
            label={<RequiredLabel text="自定义天数" />}
            description="例如每 45 天扣一次,就填 45"
            rules={[
              {
                validator: async (_, value) => {
                  if (!value || value < 1)
                    throw new Error('自定义天数必须 ≥ 1');
                },
              },
            ]}
            childElementPosition="right"
          >
            <Stepper min={1} max={3650} />
          </Form.Item>
        )}
        <Form.Item name="type" label="类型" description="影响列表中的图标与归类">
          <Selector columns={3} options={typeOptions} />
        </Form.Item>
      </Section>

      <Section title="状态与优先级">
        <Form.Item
          name="status"
          label="状态"
          description="只有 '生效中' 会计入 '生效中月支出'"
        >
          <Selector columns={4} options={statusOptions} />
        </Form.Item>
        <Form.Item
          name="priority"
          label="优先级"
          description="以左侧色条形式展示在列表 (红=必要)"
        >
          <Selector columns={3} options={priorityOptions} />
        </Form.Item>
        <Form.Item
          name="autoRenew"
          label="自动续费"
          description="到期是否会被自动扣款续约,仅作记录"
          childElementPosition="right"
        >
          <Switch />
        </Form.Item>
      </Section>

      <Section
        title="账单与日期"
        description="均为可选,填写后可获得到期倒计时"
        collapsible
        defaultOpen
      >
        <Form.Item
          name="nextBillingDate"
          label="下次账单日期"
          description="下一次实际扣款的日期,列表会显示倒计时"
          childElementPosition="right"
        >
          <DatePickerField placeholder="请选择" />
        </Form.Item>
        <Form.Item
          name="billingDay"
          label="账单日"
          description="每月固定第几号扣款,仅用于展示"
          childElementPosition="right"
        >
          <BillingDayField />
        </Form.Item>
        <Form.Item name="startDate" label="开始日期" childElementPosition="right">
          <DatePickerField placeholder="可选" />
        </Form.Item>
        <Form.Item
          name="endDate"
          label="结束日期"
          description="到期后请手动改为 '已过期' 状态"
          childElementPosition="right"
        >
          <DatePickerField placeholder="可选" />
        </Form.Item>
      </Section>

      <Section
        title="支付信息"
        description="可选,方便日后查找"
        collapsible
        defaultOpen={false}
      >
        <Form.Item name="provider" label="服务商">
          <Input placeholder="例如:百度云" clearable />
        </Form.Item>
        <Form.Item name="account" label="账号">
          <Input placeholder="可选" clearable />
        </Form.Item>
        <Form.Item name="paymentMethod" label="支付方式">
          <Input placeholder="例如:支付宝" clearable />
        </Form.Item>
      </Section>

      <Section title="提醒" collapsible defaultOpen={false}>
        <Form.Item
          name="reminderEnabled"
          label="开启提醒"
          description="开启后会在到期前推送提醒"
          childElementPosition="right"
        >
          <Switch />
        </Form.Item>
        {reminderEnabled && (
          <Form.Item
            name="reminderDaysBefore"
            label="提前提醒天数"
            description="例如设为 3,则在到期前 3 天提醒"
            childElementPosition="right"
          >
            <Stepper min={0} max={60} />
          </Form.Item>
        )}
      </Section>

      <Section title="其他">
        <Form.Item
          name="includeInStatistics"
          label="纳入支出汇总"
          description="关闭后仍显示在列表,但不计入顶部月/年总支出"
          childElementPosition="right"
        >
          <Switch />
        </Form.Item>
        <Form.Item name="comment" label="备注">
          <TextArea placeholder="可选" maxLength={200} rows={2} showCount />
        </Form.Item>
      </Section>

      <Section
        title="高级设置"
        description="一般无需调整"
        collapsible
        defaultOpen={false}
      >
        <Form.Item name="currency" label="币种" description="默认人民币">
          <Selector columns={3} options={currencyOptions} />
        </Form.Item>
        <Form.Item
          name="sort"
          label="排序权重"
          description="数字越小越靠前,推荐 10/20/30 间隔以便插入"
          childElementPosition="right"
        >
          <Stepper min={-99} max={99} />
        </Form.Item>
      </Section>
    </Form>
  );
};

export default FixedExpenseForm;

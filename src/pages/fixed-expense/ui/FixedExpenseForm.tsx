import {
  Button,
  DatePicker,
  Form,
  Input,
  Selector,
  Stepper,
  Switch,
  TextArea,
} from 'antd-mobile';
import { DownOutline, RightOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { cn, normalizeAmount } from '@/shared/lib';
import {
  currencyOptions,
  cycleOptions,
  priorityOptions,
  statusOptions,
  typeOptions,
} from '../constants';
import { useFixedExpenseForm } from '../model/useFixedExpenseForm';

interface FixedExpenseFormProps {
  id?: string;
}

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
  const { t } = useTranslation('fixed-expense');
  const {
    formAction,
    cycleValue,
    reminderEnabled,
    isEdit,
    isDisabled,
    defaultValues,
    onValuesChange,
    onFinishFailed,
    onFinish,
  } = useFixedExpenseForm(id);

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
          {isEdit ? t('form.save') : t('form.save')}
        </Button>
      )}
    >
      <Section title={t('form.basicInfo')} required description={t('form.basicInfo')}>
        <Form.Item
          name="name"
          label={<RequiredLabel text={t('form.name')} />}
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
                  throw new Error(t('form.amountRequired'));
              },
            },
          ]}
          normalize={normalizeAmount as any}
        >
          <Input type="text" inputMode="decimal" placeholder={t('form.amountPlaceholder')} clearable />
        </Form.Item>
        <Form.Item
          name="cycle"
          label={<RequiredLabel text={t('form.cycle')} />}
          description="决定金额按多久扣一次,系统会折算成月支出"
        >
          <Selector columns={3} options={cycleOptions} />
        </Form.Item>
        {cycleValue === FixedExpenseCycle.CUSTOM && (
          <Form.Item
            name="customCycleDays"
            label={<RequiredLabel text={t('form.customCycleDays')} />}
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
        <Form.Item name="type" label={t('form.type')} description="影响列表中的图标与归类">
          <Selector columns={3} options={typeOptions} />
        </Form.Item>
      </Section>

      <Section title={t('form.statusAndPriority')}>
        <Form.Item
          name="status"
          label={t('form.status')}
          description="只有 '生效中' 会计入 '生效中月支出'"
        >
          <Selector columns={4} options={statusOptions} />
        </Form.Item>
        <Form.Item
          name="priority"
          label={t('form.priority')}
          description="以左侧色条形式展示在列表 (红=必要)"
        >
          <Selector columns={3} options={priorityOptions} />
        </Form.Item>
        <Form.Item
          name="autoRenew"
          label={t('form.autoRenew')}
          description="到期是否会被自动扣款续约,仅作记录"
          childElementPosition="right"
        >
          <Switch />
        </Form.Item>
      </Section>

      <Section
        title={t('form.billAndDate')}
        description="均为可选,填写后可获得到期倒计时"
        collapsible
        defaultOpen
      >
        <Form.Item
          name="nextBillingDate"
          label={t('form.nextBillingDate')}
          description="下一次实际扣款的日期,列表会显示倒计时"
          childElementPosition="right"
        >
          <DatePickerField placeholder={t('form.selectDate')} />
        </Form.Item>
        <Form.Item
          name="billingDay"
          label={t('form.billingDay')}
          description="每月固定第几号扣款,仅用于展示"
          childElementPosition="right"
        >
          <BillingDayField />
        </Form.Item>
        <Form.Item name="startDate" label={t('form.startDate')} childElementPosition="right">
          <DatePickerField placeholder={t('form.optional')} />
        </Form.Item>
        <Form.Item
          name="endDate"
          label={t('form.endDate')}
          description="到期后请手动改为 '已过期' 状态"
          childElementPosition="right"
        >
          <DatePickerField placeholder={t('form.optional')} />
        </Form.Item>
      </Section>

      <Section
        title={t('form.paymentInfo')}
        description="可选,方便日后查找"
        collapsible
        defaultOpen={false}
      >
        <Form.Item name="provider" label={t('form.provider')}>
          <Input placeholder="例如:百度云" clearable />
        </Form.Item>
        <Form.Item name="account" label={t('form.account')}>
          <Input placeholder={t('form.optional')} clearable />
        </Form.Item>
        <Form.Item name="paymentMethod" label={t('form.paymentMethod')}>
          <Input placeholder="例如:支付宝" clearable />
        </Form.Item>
      </Section>

      <Section title={t('form.reminder')} collapsible defaultOpen={false}>
        <Form.Item
          name="reminderEnabled"
          label={t('form.reminderEnabled')}
          description={t('form.reminderEnabledDesc')}
          childElementPosition="right"
        >
          <Switch />
        </Form.Item>
        {reminderEnabled && (
          <Form.Item
            name="reminderDaysBefore"
            label={t('form.reminderDaysAhead')}
            description="例如设为 3,则在到期前 3 天提醒"
            childElementPosition="right"
          >
            <Stepper min={0} max={60} />
          </Form.Item>
        )}
      </Section>

      <Section title={t('form.reminder')}>
        <Form.Item
          name="includeInStatistics"
          label={t('form.includeInStats')}
          description="关闭后仍显示在列表,但不计入顶部月/年总支出"
          childElementPosition="right"
        >
          <Switch />
        </Form.Item>
        <Form.Item name="comment" label={t('form.comment')}>
          <TextArea placeholder={t('form.optional')} maxLength={200} rows={2} showCount />
        </Form.Item>
      </Section>

      <Section
        title={t('form.advanced')}
        description="一般无需调整"
        collapsible
        defaultOpen={false}
      >
        <Form.Item name="currency" label={t('form.currency')} description={t('form.currency.defaultCny')}>
          <Selector columns={3} options={currencyOptions} />
        </Form.Item>
        <Form.Item
          name="sort"
          label={t('form.sortOrder')}
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

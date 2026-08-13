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
import React, { useMemo, useState } from 'react';
import { FixedExpenseCycle } from '@/entities/fixed-expense';
import { useTranslation } from '@/shared/i18n';
import { cn, normalizeAmount } from '@/shared/lib';
import { GradientPanel } from '@/shared/ui';
import {
  getCurrencyOptions,
  getCycleOptions,
  getPriorityOptions,
  getStatusOptions,
  getTypeOptions,
} from '../constants';
import { useFixedExpenseForm } from '../model/useFixedExpenseForm';
import './fixed-expense-form.scss';

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
  const { t } = useTranslation('fixed-expense');
  const [open, setOpen] = useState(defaultOpen);
  const expanded = !collapsible || open;

  return (
    <GradientPanel className={cn('mb-4 overflow-hidden', className)} elevation="low" surface="glass">
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3.5',
          collapsible ? 'cursor-pointer active:bg-primary-light/20' : '',
          expanded ? 'border-b border-border-primary' : '',
        )}
        onClick={collapsible ? () => setOpen(v => !v) : undefined}
      >
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            {required && (
              <span className="h-1.5 w-1.5 rounded-full bg-ww-pink" />
            )}
            <span className="text-[13px] font-extrabold text-ww-ink">{title}</span>
            {required && (
              <span className="rounded-full bg-[#fff1f6] px-2 py-0.5 text-[9px] font-bold text-[#ad496b]">{t('form.required')}</span>
            )}
          </div>
          {description && (
            <span className="mt-1 text-[10px] font-semibold leading-4 text-ww-soft">{description}</span>
          )}
        </div>
        {collapsible && (
          <span className="text-primary-deep">
            {open ? <DownOutline /> : <RightOutline />}
          </span>
        )}
      </div>
      {expanded && <div>{children}</div>}
    </GradientPanel>
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
  const { t } = useTranslation('fixed-expense');
  const { value, onChange, placeholder = t('form.selectDate'), clearable = true, min, max } = props;
  const [visible, setVisible] = useState(false);

  const display = useMemo(() => (value ? dayjs(value).format('YYYY-MM-DD') : ''), [value]);

  return (
    <>
      <div
        className="flex min-h-10 w-full items-center justify-between rounded-[13px] bg-white/70 px-3"
        onClick={() => setVisible(true)}
      >
        <span className={cn(display ? 'text-slate-800' : 'text-font-gray')}>
          {display || placeholder}
        </span>
        {clearable && display && (
          <span
            className="ml-2 text-sm text-font-gray"
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(undefined);
            }}
          >
            {t('form.clear')}
          </span>
        )}
      </div>
      <DatePicker
        className="ww-app-date-picker"
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
  const { t } = useTranslation('fixed-expense');

  return (
    <div className="flex items-center space-x-2">
      <Stepper min={1} max={31} allowEmpty value={value as any} onChange={onChange as any} />
      {typeof value === 'number' && value >= 1 && value <= 31 && (
        <span className="text-sm text-font-gray">
          {t('detail.monthlyDay', { day: value })}
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
    isDisabled,
    isSaving,
    defaultValues,
    onValuesChange,
    onFinishFailed,
    onFinish,
  } = useFixedExpenseForm(id);
  const currencyOptions = getCurrencyOptions();
  const cycleOptions = getCycleOptions();
  const priorityOptions = getPriorityOptions();
  const statusOptions = getStatusOptions();
  const typeOptions = getTypeOptions();

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
      className="ww-fixed-expense-form !bg-transparent"
      footer={(
        <Button
          block
          className="!h-[50px] !rounded-[17px] !border-0 !bg-[linear-gradient(135deg,#6fc2dc,#4aaac4)] !text-[14px] !font-extrabold !text-white !shadow-ww"
          loading={isSaving}
          type="submit"
        >
          {t('form.save')}
        </Button>
      )}
    >
      <Section title={t('form.basicInfo')} required description={t('form.basicInfoDescription')}>
        <Form.Item
          name="name"
          label={<RequiredLabel text={t('form.name')} />}
          rules={[{ required: true, message: t('form.nameRequired') }]}
        >
          <Input placeholder={t('form.namePlaceholder')} clearable />
        </Form.Item>
        <Form.Item
          name="amount"
          label={<RequiredLabel text={t('form.amount')} />}
          description={t('form.amountDescription')}
          rules={[
            { required: true, message: t('form.amountRequired') },
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
          description={t('form.cycleDescription')}
        >
          <Selector columns={3} options={cycleOptions} />
        </Form.Item>
        {cycleValue === FixedExpenseCycle.CUSTOM && (
          <Form.Item
            name="customCycleDays"
            label={<RequiredLabel text={t('form.customCycleDays')} />}
            description={t('form.customCycleDaysDescription')}
            rules={[
              {
                validator: async (_, value) => {
                  if (!value || value < 1)
                    throw new Error(t('form.customDaysMin'));
                },
              },
            ]}
            childElementPosition="right"
          >
            <Stepper min={1} max={3650} />
          </Form.Item>
        )}
        <Form.Item name="type" label={t('form.type')} description={t('form.typeDescription')}>
          <Selector columns={3} options={typeOptions} />
        </Form.Item>
      </Section>

      <Section title={t('form.statusAndPriority')}>
        <Form.Item
          name="status"
          label={t('form.status')}
          description={t('form.statusDescription')}
        >
          <Selector columns={4} options={statusOptions} />
        </Form.Item>
        <Form.Item
          name="priority"
          label={t('form.priority')}
          description={t('form.priorityDescription')}
        >
          <Selector columns={3} options={priorityOptions} />
        </Form.Item>
        <Form.Item
          name="autoRenew"
          label={t('form.autoRenew')}
          description={t('form.autoRenewDesc')}
          childElementPosition="right"
        >
          <Switch />
        </Form.Item>
      </Section>

      <Section
        title={t('form.billAndDate')}
        description={t('form.billAndDateDescription')}
        collapsible
        defaultOpen
      >
        <Form.Item
          name="nextBillingDate"
          label={t('form.nextBillingDate')}
          description={t('form.nextBillingDateDescription')}
          childElementPosition="right"
        >
          <DatePickerField placeholder={t('form.selectDate')} />
        </Form.Item>
        <Form.Item
          name="billingDay"
          label={t('form.billingDay')}
          description={t('form.billingDayDescription')}
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
          description={t('form.endDateDescription')}
          childElementPosition="right"
        >
          <DatePickerField placeholder={t('form.optional')} />
        </Form.Item>
      </Section>

      <Section
        title={t('form.paymentInfo')}
        description={t('form.paymentInfoDescription')}
        collapsible
        defaultOpen={false}
      >
        <Form.Item name="provider" label={t('form.provider')}>
          <Input placeholder={t('form.providerPlaceholder')} clearable />
        </Form.Item>
        <Form.Item name="account" label={t('form.account')}>
          <Input placeholder={t('form.optional')} clearable />
        </Form.Item>
        <Form.Item name="paymentMethod" label={t('form.paymentMethod')}>
          <Input placeholder={t('form.paymentMethodPlaceholder')} clearable />
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
            description={t('form.reminderDaysBeforeDescription')}
            childElementPosition="right"
          >
            <Stepper min={0} max={60} />
          </Form.Item>
        )}
      </Section>

      <Section title={t('form.statisticsAndNote')}>
        <Form.Item
          name="includeInStatistics"
          label={t('form.includeInStats')}
          description={t('form.includeInStatsDesc')}
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
        description={t('form.advancedDescription')}
        collapsible
        defaultOpen={false}
      >
        <Form.Item name="currency" label={t('form.currency.label')} description={t('form.currency.defaultCny')}>
          <Selector columns={3} options={currencyOptions} />
        </Form.Item>
        <Form.Item
          name="sort"
          label={t('form.sortOrder')}
          description={t('form.sortOrderDesc')}
          childElementPosition="right"
        >
          <Stepper min={-99} max={99} />
        </Form.Item>
      </Section>
    </Form>
  );
};

export default FixedExpenseForm;

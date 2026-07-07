import type { CreateFixedExpenseApiData } from '@/entities/fixed-expense';
import { Form, Toast } from 'antd-mobile';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FixedExpenseCurrency,
  FixedExpenseCycle,
  FixedExpensePriority,
  FixedExpenseStatus,
  FixedExpenseType,
  useGetFixedExpenseByIdQuery,
  usePatchFixedExpenseMutation,
  usePostFixedExpenseMutation,
} from '@/entities/fixed-expense';
import { useTranslation } from '@/shared/i18n';

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

export function useFixedExpenseForm(id?: string) {
  const { t } = useTranslation('fixed-expense');
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
    void Toast.show({ icon: 'fail', content: first || t('form.pleaseComplete') });
  }, [t]);

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
      void Toast.show({ icon: 'success', content: t('form.saveSuccess') });
    }
    else {
      await postMutate(payload);
      void Toast.show({ icon: 'success', content: t('form.createSuccess') });
    }

    navigate(-1);
  }, [id, isDisabled, patchMutate, postMutate, navigate, t]);

  return {
    formAction,
    cycleValue,
    reminderEnabled,
    isEdit,
    isDisabled,
    defaultValues,
    onValuesChange,
    onFinishFailed,
    onFinish,
  };
}

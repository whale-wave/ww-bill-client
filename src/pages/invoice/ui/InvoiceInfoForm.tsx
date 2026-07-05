import type { InvoiceEntity } from '@/entities/invoice';
import { Button, Form, Input } from 'antd-mobile';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetInvoiceByIdQuery,
  usePatchInvoiceMutation,
  usePostInvoiceMutation,
} from '@/entities/invoice';
import { useTranslation } from '@/shared/i18n';

interface InvoiceInfoFormProps {
  id?: string;
}

const InvoiceInfoForm: React.FC<InvoiceInfoFormProps> = (props) => {
  const { id } = props;
  const navigate = useNavigate();

  const isEdit = useMemo(() => !!id, []);

  const { data: invoice, isLoading } = useGetInvoiceByIdQuery({
    params: { id: id! },
    options: {
      enabled: isEdit,
    },
  });

  const isDisabled = useMemo(() => {
    if (id) {
      return isLoading;
    }
    else {
      return false;
    }
  }, []);
  const [formAction] = Form.useForm();

  const { t } = useTranslation('invoice');

  const formOptions = [
    {
      label: t('form.companyName'),
      name: 'companyName',
      required: true,
      rules: [{ required: true, message: t('form.companyNameRequired') }],
    },
    {
      label: t('form.taxNumber'),
      name: 'taxNumber',
      required: true,
      rules: [{ required: true, message: t('form.taxNumberRequired') }],
    },
    {
      label: t('form.companyAddress'),
      name: 'companyAddress',
    },
    {
      label: t('form.phone'),
      name: 'phone',
    },
    {
      label: t('form.accountOpeningBank'),
      name: 'accountOpeningBank',
    },
    {
      label: t('form.bankAccount'),
      name: 'bankAccount',
    },
  ];

  const [patchInvoiceMutate] = usePatchInvoiceMutation();
  const [postInvoiceMutate] = usePostInvoiceMutation();

  const onSave = useCallback(
    async (values: Omit<InvoiceEntity, 'id'>) => {
      if (isDisabled)
        return;

      if (id) {
        await patchInvoiceMutate({
          id,
          params: values,
        });
      }
      else {
        await postInvoiceMutate(values);
      }

      navigate(-1);
    },
    [isEdit],
  );

  useEffect(() => {
    if (!invoice)
      return;

    formAction.setFieldsValue(invoice);
  }, [invoice]);
  return (
    <Form
      initialValues={invoice}
      form={formAction}
      layout="horizontal"
      requiredMarkStyle="none"
      footer={(
        <Button block type="submit" color="primary" size="large">
          {t('form.save')}
        </Button>
      )}
      onFinish={onSave}
      disabled={isDisabled}
    >
      {formOptions.map(option => (
        <Form.Item
          key={option.name}
          name={option.name}
          label={option.label}
          rules={option.rules}
        >
          <Input
            placeholder={`${t('form.placeholder')}${option.label}${option.required ? t('form.required') : ''}`}
            clearable
          />
        </Form.Item>
      ))}
    </Form>
  );
};

export default InvoiceInfoForm;

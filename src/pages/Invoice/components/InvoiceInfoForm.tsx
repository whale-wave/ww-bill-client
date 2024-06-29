import React, { useCallback, useEffect, useMemo } from 'react';
import { Button, Form, Input } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import {
  useGetInvoiceByIdQuery,
  usePatchInvoiceMutation,
  usePostInvoiceMutation,
} from '@/hooks';
import type { InvoiceEntity } from '@/api';

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

  const formOptions = [
    {
      label: '名称',
      name: 'companyName',
      required: true,
      rules: [{ required: true, message: '名称不能为空' }],
    },
    {
      label: '税号',
      name: 'taxNumber',
      required: true,
      rules: [{ required: true, message: '税号不能为空' }],
    },
    {
      label: '单位地址',
      name: 'companyAddress',
    },
    {
      label: '电话号码',
      name: 'phone',
    },
    {
      label: '开户银行',
      name: 'accountOpeningBank',
    },
    {
      label: '银行账号',
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
          保存
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
            placeholder={`请输入${option.label}${option.required ? ' (必填)' : ''}`}
            clearable
          />
        </Form.Item>
      ))}
    </Form>
  );
};

export default InvoiceInfoForm;

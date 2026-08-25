import type { InvoiceEntity } from '@/entities/invoice';
import { Button, Form, Input, Toast } from 'antd-mobile';
import { Building2, CreditCard, Hash, Landmark, MapPin, Phone } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetInvoiceByIdQuery,
  usePatchInvoiceMutation,
  usePostInvoiceMutation,
} from '@/entities/invoice';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel } from '@/shared/ui';

interface InvoiceInfoFormProps {
  id?: string;
}

const InvoiceInfoForm: React.FC<InvoiceInfoFormProps> = (props) => {
  const { id } = props;
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const { data: invoice, isLoading } = useGetInvoiceByIdQuery({
    params: { id: id ?? '' },
    options: {
      enabled: isEdit,
    },
  });

  const isDisabled = isEdit && isLoading;
  const [formAction] = Form.useForm();

  const { t } = useTranslation('invoice');

  const formOptions = [
    {
      icon: Building2,
      label: t('form.companyName'),
      name: 'companyName',
      required: true,
      rules: [{ required: true, message: t('form.companyNameRequired') }],
    },
    {
      icon: Hash,
      label: t('form.taxNumber'),
      name: 'taxNumber',
      required: true,
      rules: [{ required: true, message: t('form.taxNumberRequired') }],
    },
    {
      icon: MapPin,
      label: t('form.companyAddress'),
      name: 'companyAddress',
    },
    {
      icon: Phone,
      label: t('form.phone'),
      name: 'phone',
    },
    {
      icon: Landmark,
      label: t('form.accountOpeningBank'),
      name: 'accountOpeningBank',
    },
    {
      icon: CreditCard,
      label: t('form.bankAccount'),
      name: 'bankAccount',
    },
  ];

  const [patchInvoiceMutate, patchState] = usePatchInvoiceMutation();
  const [postInvoiceMutate, postState] = usePostInvoiceMutation();
  const isSaving = patchState?.isLoading || postState?.isLoading;

  const onSave = useCallback(
    async (values: Omit<InvoiceEntity, 'id'>) => {
      if (isDisabled || isSaving)
        return;

      try {
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
      }
      catch {
        Toast.show({ icon: 'fail', content: t('saveFailed') });
      }
    },
    [id, isDisabled, isSaving, navigate, patchInvoiceMutate, postInvoiceMutate, t],
  );

  useEffect(() => {
    if (!invoice)
      return;

    formAction.setFieldsValue(invoice);
  }, [formAction, invoice]);
  return (
    <Form
      className="invoice-info-form !bg-transparent [&_.adm-list-body]:!border-0 [&_.adm-list-item-content]:!border-0"
      initialValues={invoice}
      form={formAction}
      layout="vertical"
      requiredMarkStyle="none"
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
      onFinish={onSave}
      disabled={isDisabled}
    >
      {([
        { options: formOptions.slice(0, 2), title: t('requiredSection') },
        { options: formOptions.slice(2), title: t('optionalSection') },
      ]).map(section => (
        <GradientPanel className="mb-4 overflow-hidden px-4 py-2" elevation="low" key={section.title} surface="glass">
          <h2 className="border-0 border-b border-solid border-border-primary py-3 text-[12px] font-extrabold text-ww-ink">
            {section.title}
          </h2>
          {section.options.map((option) => {
            const FieldIcon = option.icon;
            return (
              <Form.Item
                className="!mb-0 !border-0 !py-3 [&_.adm-form-item-child-inner]:!border-0 [&_.adm-form-item-label]:!mb-2 [&_.adm-form-item-label]:!text-[12px] [&_.adm-form-item-label]:!font-bold [&_.adm-form-item-label]:!text-ww-mid"
                key={option.name}
                name={option.name}
                label={option.label}
                rules={option.rules}
              >
                <div className="flex h-12 items-center gap-3 rounded-[15px] border border-solid border-border-primary bg-white/80 px-3 shadow-ww-xs focus-within:border-primary-mid focus-within:ring-2 focus-within:ring-primary-light/60">
                  <FieldIcon className="shrink-0 text-primary-deep" size={18} strokeWidth={1.8} />
                  <Input
                    aria-label={option.label}
                    className="min-w-0 flex-1 text-[13px]"
                    clearable
                    placeholder={t('form.fieldPlaceholder', { field: option.label })}
                  />
                </div>
              </Form.Item>
            );
          })}
        </GradientPanel>
      ))}
    </Form>
  );
};

export default InvoiceInfoForm;

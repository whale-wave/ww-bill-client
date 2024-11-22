import { type FC, useCallback } from 'react';
import { Button, Form, Input, Toast } from 'antd-mobile';
import { useSearchParams } from 'react-router-dom';
import { clone } from 'lodash-es';
import { NavBar } from '@/components';
import { usePostAssetMutation } from '@/hooks';
import type { Asset } from '@/api';

function parseAmountString(value: string) {
  return String(Number(value));
}

const AddAssetForm: FC = () => {
  const [postAssetMutate] = usePostAssetMutation();
  const [query] = useSearchParams();
  const groupId = query.get('groupId') || null;
  const title = query.get('title') || '现金';

  const formDataKeyParse = {
    amount: parseAmountString,
  } as const;

  const formConfig = [
    {
      label: '名称',
      name: 'name',
      // readonly: true,
      rules: [{ required: true, message: '请输入名称' }],
    },
    {
      label: '备注',
      placeholder: '(选填)',
      name: 'remark',
    },
    {
      label: '金额',
      name: 'amount',
      rules: [{ required: true, message: '请输入金额' }],
      normalize: (value: string, preValue: string) => {
        let normalizedValue = value.replace(/[^\d.]/g, ''); // Remove non-numeric and non-dot characters
        const parts = normalizedValue.split('.');

        if (parts.length > 2) {
          return preValue;
        }

        if (parts[1]?.length > 2) {
          return preValue;
        }

        if (parts[0].length > 1 && parts[0].startsWith('0')) {
          parts[0] = parts[0].replace(/^0+/, '');
          if (parts[0] === '') {
            parts[0] = '0';
          }
          normalizedValue = parts.join('.');
        }

        return normalizedValue;
      },
    },
  ];

  const handleSave = useCallback(async (_formData: Pick<Asset, 'name' | 'amount' | 'comment'>) => {
    if (!groupId) {
      console.error('groupId is required');
      return;
    }
    const formData = clone(_formData);
    const keys = Object.keys(formDataKeyParse) as Array<keyof typeof formDataKeyParse>;
    keys.forEach((key) => {
      if (formData[key]) {
        formData[key] = formDataKeyParse[key](formData[key]);
      }
    });

    await postAssetMutate({ ...formData, groupId });
  }, []);

  const handleFinishFailed = useCallback((errors: { errorFields: { errors: string[] }[] }) => {
    Toast.show({
      icon: 'fail',
      content: errors.errorFields[0].errors[0],
      duration: 1000,
    });
  }, []);

  return (
    <div className="page pt-[45px]">
      <NavBar back="返回">
        添加
        {title}
      </NavBar>
      <Form
        className="mt-2"
        onFinish={handleSave}
        onFinishFailed={handleFinishFailed}
        footer={(<Button type="submit" block color="primary">保存</Button>)}
        hasFeedback={false}
      >
        {
          formConfig.map(item => (
            <Form.Item layout="horizontal" label={item.label} key={item.label} name={item.name} normalize={item.normalize} rules={item.rules} required={false}>
              <Input
                style={{ '--text-align': 'right' }}
                placeholder={item.placeholder}
                // readOnly={!!item.readonly}
              />
            </Form.Item>
          ))
        }
      </Form>
    </div>
  );
};

export default AddAssetForm;

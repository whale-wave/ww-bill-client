import { type FC, useCallback } from 'react';
import { Button, Form, Input } from 'antd-mobile';
import { useSearchParams } from 'react-router-dom';
import { clone } from 'lodash-es';
import { NavBar } from '@/components';

// interface FormData {
//   name: string;
//   amount: string;
//   remark?: string;
// }

function parseAmountString(value: string) {
  return String(Number(value));
}

const AddAssetForm: FC = () => {
  const [query] = useSearchParams();
  const groupId = query.get('groupId') || null;
  const title = query.get('title') || '现金';

  const formDataKeyParse = {
    amount: parseAmountString,
  };

  const formConfig = [
    {
      label: '名称',
      name: 'name',
      // readonly: true,
    },
    {
      label: '备注',
      placeholder: '(选填)',
      name: 'remark',
    },
    {
      label: '金额',
      name: 'amount',
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

  const handleSave = useCallback((_formData: any) => {
    const formData = clone(_formData);
    Object.keys(formDataKeyParse).forEach((key) => {
      if (formData[key]) {
        formData[key] = formDataKeyParse[key as keyof typeof formDataKeyParse](formData[key]);
      }
    });
    console.info(groupId, formData);
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
        footer={(<Button type="submit" block color="primary">保存</Button>)}
      >
        {
          formConfig.map(item => (
            <Form.Item layout="horizontal" label={item.label} key={item.label} name={item.name} normalize={item.normalize}>
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

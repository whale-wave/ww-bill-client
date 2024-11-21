import { type FC, useCallback } from 'react';
import { Button, Form, Input } from 'antd-mobile';
import { useSearchParams } from 'react-router-dom';
import { NavBar } from '@/components';

const AddAssetForm: FC = () => {
  const [query] = useSearchParams();
  const groupId = query.get('groupId') || null;
  const title = query.get('title') || '现金';

  const formConfig = [
    {
      label: '名称',
      readonly: true,
    },
    {
      label: '备注',
      placeholder: '(选填)',
    },
    {
      label: '金额',
    },
  ];

  const handleSave = useCallback(() => {
    console.info(groupId);
  }, []);

  return (
    <div className="page pt-[45px]">
      <NavBar back="返回">
        添加
        {title}
      </NavBar>
      <Form className="mt-2">
        {
          formConfig.map(item => (
            <Form.Item layout="horizontal" label={item.label} key={item.label}>
              <Input style={{ '--text-align': 'right' }} placeholder={item.placeholder} readOnly={!!item.readonly} />
            </Form.Item>
          ))
        }
      </Form>
      <div className="p-5">
        <Button block color="primary" onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
};

export default AddAssetForm;

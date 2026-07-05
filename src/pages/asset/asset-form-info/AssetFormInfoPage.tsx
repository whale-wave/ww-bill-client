import { useTranslation } from '@/shared/i18n';
import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { Button, Form, Input, Toast } from 'antd-mobile';
import { clone, pick } from 'lodash-es';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CARD_TYPE, useGetAssetByIdQuery, useGetAssetGroupById, usePatchAssetAdjustMutation, usePostAssetMutation } from '@/entities/asset';
import { isSuccessApi } from '@/shared/api';
import { normalizeAmount } from '@/shared/lib';
import { NavBar } from '@/shared/ui';

function parseAmountString(value: string) {
  return String(Number(value));
}

const AssetFormInfo: FC = () => {
  const { id: assetId } = useParams<{ id: string }>();
  const [query] = useSearchParams();
  const groupId = query.get('groupId')!;

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [postAssetMutate] = usePostAssetMutation();
  const [patchAssetAdjustMutate] = usePatchAssetAdjustMutation();
  const { data: assetGroup } = useGetAssetGroupById({ params: groupId });
  const { data: asset } = useGetAssetByIdQuery({ params: assetId!, options: { enabled: !!assetId } });

  useEffect(() => {
    if (assetGroup && assetGroup?.fixedName && !asset) {
      form.setFieldValue('name', assetGroup.name);
    }
  }, [assetGroup]);

  const isCardType = useMemo(() => {
    if (!assetGroup)
      return false;
    return CARD_TYPE.includes(assetGroup.assetType as any);
  }, [assetGroup]);

  useEffect(() => {
    if (asset) {
      const assetData = pick(asset, ['name', 'amount', 'comment']);
      form.setFieldsValue(assetData);
    }
  }, [asset]);

  const formDataKeyParse = {
    amount: parseAmountString,
  } as const;

  const formConfig = useMemo(() => {
    const config = [
      {
        label: isCardType ? '所在银行' : '名称',
        name: 'name',
        disabled: assetGroup?.fixedName,
        rules: [{ required: true, message: '请输入名称' }],
      },
      {
        label: '卡号 (后四位)',
        name: 'cardId',
        placeholder: '(选填)',
      },
      {
        label: '备注',
        placeholder: '(选填)',
        name: 'comment',
      },
      {
        label: assetGroup?.type === 'sub' ? '欠款' : '余额',
        name: 'amount',
        rules: [{ required: true, message: '请输入金额' }],
        normalize: normalizeAmount,
      },
    ];

    if (!isCardType) {
      config.splice(1, 1);
    }

    return config;
  }, [assetGroup, isCardType]);

  const handleSave = useCallback(async (_formData: Pick<Asset, 'name' | 'amount' | 'comment'>) => {
    const formData = clone(_formData);
    const keys = Object.keys(formDataKeyParse) as Array<keyof typeof formDataKeyParse>;
    keys.forEach((key) => {
      if (formData[key]) {
        formData[key] = formDataKeyParse[key](formData[key]);
      }
    });

    if (assetId) {
      const res = await patchAssetAdjustMutate({ id: assetId, data: formData });
      if (isSuccessApi(res)) {
        Toast.show({
          icon: 'success',
          content: '保存成功',
          duration: 1000,
        });

        setTimeout(() => {
          navigate(-1);
        }, 250);
      }
    }
    else {
      if (!groupId) {
        Toast.show({
          icon: 'fail',
          content: '请选择分组',
          duration: 1000,
        });
        return;
      }
      await postAssetMutate({ ...formData, groupId });

      let backLevel = -2;
      if (assetGroup?.level === 1) {
        backLevel = -3;
      }

      setTimeout(() => {
        navigate(backLevel);
      }, 250);
    }
  }, [assetGroup]);

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
        {assetId ? '设置' : `添加${assetGroup?.name || ''}`}
      </NavBar>
      <Form
        className="mt-2"
        onFinish={handleSave}
        onFinishFailed={handleFinishFailed}
        footer={(<Button type="submit" block color="primary">保存</Button>)}
        hasFeedback={false}
        form={form}
      >
        {
          formConfig.map(item => (
            <Form.Item layout="horizontal" label={item.label} key={item.label} name={item.name} normalize={item.normalize} rules={item.rules} required={false}>
              <Input
                style={{ '--text-align': 'right' }}
                placeholder={item.placeholder}
                disabled={item.disabled}
              />
            </Form.Item>
          ))
        }
      </Form>
    </div>
  );
};

export default AssetFormInfo;

import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { Button, Form, Input, Toast } from 'antd-mobile';
import { clone, pick } from 'lodash-es';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CARD_TYPE, useGetAssetByIdQuery, useGetAssetGroupById, usePatchAssetAdjustMutation, usePostAssetMutation } from '@/entities/asset';
import { isSuccessApi } from '@/shared/api';
import { normalizeAmount } from '@/shared/lib';
import { NavBar } from '@/shared/ui';

function parseAmountString(value: string) {
  return String(Number(value));
}

const AssetFormInfo: FC = () => {
  const { t } = useTranslation(['asset', 'common']);
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
        label: isCardType ? t('form.bank') : t('form.name'),
        name: 'name',
        disabled: assetGroup?.fixedName,
        rules: [{ required: true, message: t('form.nameRequired') }],
      },
      {
        label: t('form.cardNumber'),
        name: 'cardId',
        placeholder: t('form.optional'),
      },
      {
        label: t('form.remark'),
        placeholder: t('form.optional'),
        name: 'comment',
      },
      {
        label: assetGroup?.type === 'sub' ? t('form.debt') : t('form.balance'),
        name: 'amount',
        rules: [{ required: true, message: t('form.amountRequired') }],
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
          content: t('form.saveSuccess'),
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
          content: t('form.selectGroup'),
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
    <div className="page">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {assetId ? t('form.edit') : `${t('form.add')}${assetGroup?.name || ''}`}
      </NavBar>
      <Form
        className="mt-2"
        onFinish={handleSave}
        onFinishFailed={handleFinishFailed}
        footer={(<Button type="submit" block color="primary">{t('form.save')}</Button>)}
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

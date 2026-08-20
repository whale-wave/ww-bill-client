import type { LucideIcon } from 'lucide-react';
import type { FC } from 'react';
import type { Asset } from '@/entities/asset';
import { Form, Input, Skeleton, Toast } from 'antd-mobile';
import { clone } from 'lodash-es';
import { BadgeDollarSign, Building2, CreditCard, FileWarning, Landmark, MessageSquareText, WalletCards } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  CARD_TYPE,
  useGetAssetByIdQuery,
  useGetAssetGroupById,
  usePatchAssetAdjustMutation,
  usePostAssetMutation,
} from '@/entities/asset';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { normalizeAmount } from '@/shared/lib';
import { AppButton, GradientPanel, IllustratedEmptyState } from '@/shared/ui';
import { AssetPageFrame } from '../ui';

type AssetFormValues = Pick<Asset, 'amount' | 'cardId' | 'comment' | 'name'>;

interface AssetFormField {
  disabled?: boolean;
  icon: LucideIcon;
  inputMode?: 'decimal' | 'numeric';
  label: string;
  maxLength?: number;
  name: keyof AssetFormValues;
  normalize?: (value: string, previousValue: string) => string;
  placeholder?: string;
  required?: boolean;
  rules?: Array<{ message: string; required: boolean }>;
}

function parseAmountString(value: string) {
  return String(Number(value));
}

const AssetFormInfo: FC = () => {
  const { t } = useTranslation('asset');
  const navigate = useNavigate();
  const { id: assetId } = useParams<{ id: string }>();
  const [query] = useSearchParams();
  const groupId = query.get('groupId') ?? '';
  const isEdit = Boolean(assetId);
  const [form] = Form.useForm<AssetFormValues>();

  const groupQuery = useGetAssetGroupById({
    params: groupId,
    options: { enabled: Boolean(groupId) && !isEdit },
  });
  const assetQuery = useGetAssetByIdQuery({
    params: assetId ?? '',
    options: { enabled: isEdit },
  });
  const assetGroup = assetQuery.data?.assetGroup ?? groupQuery.data;
  const isCardType = Boolean(assetGroup && CARD_TYPE.includes(assetGroup.assetType as (typeof CARD_TYPE)[number]));
  const isLoading = isEdit ? assetQuery.isLoading : groupQuery.isLoading;
  const isError = isEdit ? assetQuery.isError : groupQuery.isError || !groupId;

  const [postAssetMutate, postState] = usePostAssetMutation();
  const [patchAssetAdjustMutate, patchState] = usePatchAssetAdjustMutation();
  const isSaving = postState.isLoading || patchState.isLoading;

  useEffect(() => {
    if (assetQuery.data) {
      form.setFieldsValue({
        amount: assetQuery.data.amount,
        cardId: assetQuery.data.cardId,
        comment: assetQuery.data.comment,
        name: assetQuery.data.name,
      });
      return;
    }
    if (assetGroup?.fixedName)
      form.setFieldValue('name', assetGroup.name);
  }, [assetGroup, assetQuery.data, form]);

  const fields = useMemo<AssetFormField[]>(() => [
    {
      disabled: assetGroup?.fixedName,
      icon: isCardType ? Building2 : WalletCards,
      label: isCardType ? t('form.bank') : t('form.name'),
      name: 'name' as const,
      required: true,
      rules: [{ required: true, message: t('form.nameRequired') }],
    },
    {
      icon: BadgeDollarSign,
      inputMode: 'decimal' as const,
      label: assetGroup?.type === 'sub' ? t('form.debt') : t('form.balance'),
      name: 'amount' as const,
      normalize: normalizeAmount,
      required: true,
      rules: [{ required: true, message: t('form.amountRequired') }],
    },
    ...(isCardType
      ? [{
          icon: CreditCard,
          inputMode: 'numeric' as const,
          label: t('form.cardNumber'),
          maxLength: 4,
          name: 'cardId' as const,
          placeholder: t('form.cardNumberPlaceholder'),
        }]
      : []),
    {
      icon: MessageSquareText,
      label: t('form.remark'),
      name: 'comment' as const,
      placeholder: t('form.remarkPlaceholder'),
    },
  ], [assetGroup?.fixedName, assetGroup?.type, isCardType, t]);

  const handleSave = useCallback(async (values: AssetFormValues) => {
    if (!assetGroup || isSaving)
      return;
    const formData = clone(values);
    if (formData.amount)
      formData.amount = parseAmountString(formData.amount);

    try {
      if (assetId) {
        await patchAssetAdjustMutate({ id: assetId, data: formData });
      }
      else {
        await postAssetMutate({ ...formData, groupId: assetGroup.id });
      }
      Toast.show({ icon: 'success', content: t('form.saveSuccess') });
      if (assetId) {
        navigate(-1);
      }
      else {
        navigate(ROUTES_PATH.ASSET.getPath(), { replace: true });
      }
    }
    catch {
      Toast.show({ icon: 'fail', content: t('form.saveFailed') });
    }
  }, [assetGroup, assetId, isSaving, navigate, patchAssetAdjustMutate, postAssetMutate, t]);

  const handleFinishFailed = useCallback((errors: { errorFields: { errors: string[] }[] }) => {
    Toast.show({ icon: 'fail', content: errors.errorFields[0]?.errors[0] ?? t('form.validationFailed') });
  }, [t]);

  const title = isEdit ? t('detail.edit') : t('form.addAccountTitle');

  return (
    <AssetPageFrame
      backLabel={t('common:nav.back')}
      onBack={() => navigate(-1)}
      subtitle={t('form.subtitle')}
      title={title}
    >
      {isLoading && (
        <GradientPanel className="p-5" elevation="low" surface="glass">
          <Skeleton.Title animated />
          <Skeleton.Paragraph animated lineCount={5} />
        </GradientPanel>
      )}

      {!isLoading && (isError || !assetGroup) && (
        <GradientPanel elevation="low" surface="glass">
          <IllustratedEmptyState
            actionLabel={t('retry')}
            description={t('form.loadErrorDescription')}
            icon={<FileWarning className="text-primary-deep" size={40} strokeWidth={1.6} />}
            onAction={() => void (isEdit ? assetQuery.refetch() : groupQuery.refetch())}
            title={t('form.loadError')}
          />
        </GradientPanel>
      )}

      {!isLoading && !isError && assetGroup && (
        <>
          <GradientPanel className="mb-4 flex items-center gap-3 px-4 py-3.5" elevation="low" surface="ice">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white/75 text-primary-deep shadow-ww-xs">
              <Landmark size={21} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-black text-ww-ink">{assetGroup.name}</p>
              <p className="mt-0.5 text-[10px] font-semibold leading-4 text-ww-mid">{assetGroup.description || t('form.description')}</p>
            </div>
          </GradientPanel>

          <Form
            className="!bg-transparent [&_.adm-list-body]:!border-0 [&_.adm-list-item-content]:!border-0"
            disabled={isSaving}
            form={form}
            hasFeedback={false}
            layout="vertical"
            onFinish={handleSave}
            onFinishFailed={handleFinishFailed}
            requiredMarkStyle="none"
            footer={(
              <AppButton
                className="!h-[50px] !rounded-[17px]"
                fullWidth
                loadingLabel={t('common:nav.loading')}
                loading={isSaving}
                type="submit"
              >
                {t('form.save')}
              </AppButton>
            )}
          >
            <GradientPanel className="overflow-hidden px-4 py-2" elevation="low" surface="glass">
              <h2 className="border-0 border-b border-solid border-border-primary py-3 text-[12px] font-extrabold text-ww-ink">
                {t('form.basicSection')}
              </h2>
              {fields.map((field) => {
                const FieldIcon = field.icon;
                return (
                  <Form.Item
                    className="!mb-0 !border-0 !py-3 [&_.adm-form-item-child-inner]:!border-0 [&_.adm-form-item-label]:!mb-2 [&_.adm-form-item-label]:!text-[12px] [&_.adm-form-item-label]:!font-bold [&_.adm-form-item-label]:!text-ww-mid"
                    key={field.name}
                    label={(
                      <span className="inline-flex items-center gap-1.5">
                        {field.label}
                        {field.required && (
                          <span className="rounded-full bg-ww-pink-light/70 px-1.5 py-0.5 text-[8px] font-black text-[#ad496b]">
                            {t('form.required')}
                          </span>
                        )}
                      </span>
                    )}
                  >
                    <div className="flex h-12 items-center gap-3 rounded-[15px] bg-white/70 px-3 transition focus-within:bg-white/95 focus-within:ring-2 focus-within:ring-primary-light/60">
                      <FieldIcon className="shrink-0 text-primary-deep" size={18} strokeWidth={1.8} />
                      <Form.Item
                        className="!m-0 min-w-0 flex-1 [&_.adm-form-item-child-inner]:!border-0"
                        name={field.name}
                        normalize={field.normalize}
                        noStyle
                        rules={field.rules}
                      >
                        <Input
                          aria-label={field.label}
                          className="min-w-0 flex-1 text-[13px]"
                          clearable={!field.disabled}
                          disabled={field.disabled}
                          inputMode={field.inputMode}
                          maxLength={field.maxLength}
                          placeholder={field.placeholder ?? t('form.fieldPlaceholder', { field: field.label })}
                        />
                      </Form.Item>
                    </div>
                  </Form.Item>
                );
              })}
            </GradientPanel>
          </Form>
        </>
      )}
    </AssetPageFrame>
  );
};

export default AssetFormInfo;

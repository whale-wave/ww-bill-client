import type { FormEvent } from 'react';
import type { RecordEntry } from '@/entities/record';
import { Button, Input, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useLedgerCategoriesQuery } from '@/entities/category';
import { LedgerRecordType, useLedgerPreferencesQuery } from '@/entities/ledger';
import { useLedgerTagsQuery } from '@/entities/ledger-data';
import { useCreateLedgerRecordMutation, useUpdateLedgerRecordMutation } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';

interface LedgerRecordFormProps {
  initialRecord?: RecordEntry;
  ledgerId: string;
  onSaved: () => void;
}

export function LedgerRecordForm({ initialRecord, ledgerId, onSaved }: LedgerRecordFormProps) {
  const { t } = useTranslation('ledger');
  const preferenceQuery = useLedgerPreferencesQuery({
    params: { ledgerId },
    queryOptions: { enabled: !initialRecord },
  });
  const [recordTypeOverride, setRecordTypeOverride] = useState<'add' | 'sub' | undefined>(initialRecord?.type);
  const recordType = recordTypeOverride
    ?? preferenceQuery.data?.defaultRecordType
    ?? LedgerRecordType.EXPENSE;
  const categoriesQuery = useLedgerCategoriesQuery({ params: { ledgerId, type: recordType } });
  const tagsQuery = useLedgerTagsQuery({ params: { ledgerId } });
  const [createRecord, createState] = useCreateLedgerRecordMutation();
  const [updateRecord, updateState] = useUpdateLedgerRecordMutation();
  const [remark, setRemark] = useState(initialRecord?.remark ?? '');
  const [amount, setAmount] = useState(initialRecord?.amount ?? '');
  const [categoryId, setCategoryId] = useState(initialRecord?.category.id ?? 0);
  const [time, setTime] = useState(dayjs(initialRecord?.time).isValid() ? dayjs(initialRecord?.time).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
  const [tagIds, setTagIds] = useState<string[]>(initialRecord?.tags?.map(tag => tag.id) ?? []);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!categoriesQuery.data.length)
      return;
    if (!categoriesQuery.data.some(category => category.id === categoryId))
      setCategoryId(categoriesQuery.data[0].id);
  }, [categoriesQuery.data, categoryId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submittingRef.current || !remark.trim() || !amount || !categoryId)
      return;
    submittingRef.current = true;
    const data = { amount, categoryId, remark: remark.trim(), tagIds, time: dayjs(time).toISOString(), type: recordType };
    try {
      if (initialRecord)
        await updateRecord({ data: { ...data, version: initialRecord.version }, ledgerId, recordId: String(initialRecord.id) });
      else
        await createRecord({ data, ledgerId });
      Toast.show({ icon: 'success', content: t('records.saved') });
      onSaved();
    }
    catch (error) {
      const conflict = typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;
      Toast.show({ icon: 'fail', content: t(conflict ? 'records.conflict' : 'records.saveFailed') });
    }
    finally {
      submittingRef.current = false;
    }
  };

  return (
    <form className="bg-white px-4 py-4" onSubmit={handleSubmit}>
      <div className="mb-3 flex gap-2">
        {([LedgerRecordType.EXPENSE, LedgerRecordType.INCOME] as const).map(type => (
          <Button color={recordType === type ? 'primary' : 'default'} key={type} onClick={() => setRecordTypeOverride(type)} size="small" type="button">
            {t(`records.type.${type}`)}
          </Button>
        ))}
      </div>
      <label className="mb-3 block text-sm text-font-gray">
        {t('records.amount')}
        <Input inputMode="decimal" onChange={setAmount} placeholder="0.00" value={amount} />
      </label>
      <label className="mb-3 block text-sm text-font-gray">
        {t('records.remark')}
        <Input maxLength={100} onChange={setRemark} value={remark} />
      </label>
      <label className="mb-3 block text-sm text-font-gray">
        {t('records.category')}
        <select className="mt-1 min-h-[44px] w-full border border-solid border-[#EBEBEB] bg-white px-2" onChange={event => setCategoryId(Number(event.target.value))} value={categoryId}>
          {categoriesQuery.data.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label className="mb-3 block text-sm text-font-gray">
        {t('records.date')}
        <input className="mt-1 min-h-[44px] w-full border border-solid border-[#EBEBEB] px-2" onChange={event => setTime(event.target.value)} type="date" value={time} />
      </label>
      {tagsQuery.data.length > 0 && (
        <fieldset className="mb-4 border-0 p-0">
          <legend className="mb-2 text-sm text-font-gray">{t('records.tags')}</legend>
          <div className="flex flex-wrap gap-3">
            {tagsQuery.data.map(tag => (
              <label className="flex items-center gap-1 text-sm" key={tag.id}>
                <input checked={tagIds.includes(tag.id)} onChange={event => setTagIds(current => event.target.checked ? [...current, tag.id] : current.filter(id => id !== tag.id))} type="checkbox" />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <Button block color="primary" loading={createState.isLoading || updateState.isLoading} type="submit">{t('common.save')}</Button>
    </form>
  );
}

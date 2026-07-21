import type { FC, FormEvent } from 'react';
import type { GetHouseholdRecordsApiParams } from '@/entities/household';
import { Button } from 'antd-mobile';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FamilyRecordPolicy, useHouseholdMembersQuery } from '@/entities/household';
import { HouseholdRecordsPanel, HouseholdScopeBoundary } from '@/features/household';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

function getFilters(searchParams: URLSearchParams): GetHouseholdRecordsApiParams {
  const type = searchParams.get('type');
  const memberUserId = Number(searchParams.get('memberUserId'));
  const categoryIds = (searchParams.get('categoryIds') ?? '')
    .split(',')
    .map(Number)
    .filter(value => Number.isInteger(value) && value > 0);
  const tagIds = (searchParams.get('tagIds') ?? '').split(',').map(value => value.trim()).filter(Boolean);
  const policy = searchParams.get('policy');
  return {
    ...(categoryIds.length ? { categoryIds } : {}),
    ...(searchParams.get('countedOnly') === 'true' ? { countedOnly: true } : {}),
    ...(searchParams.get('endDate') ? { endDate: searchParams.get('endDate')! } : {}),
    ...(searchParams.get('keyword') ? { keyword: searchParams.get('keyword')! } : {}),
    ...(searchParams.get('maxAmount') ? { maxAmount: searchParams.get('maxAmount')! } : {}),
    ...(Number.isInteger(memberUserId) && memberUserId > 0 ? { memberUserId } : {}),
    ...(searchParams.get('minAmount') ? { minAmount: searchParams.get('minAmount')! } : {}),
    ...(Object.values(FamilyRecordPolicy).includes(policy as FamilyRecordPolicy)
      ? { policy: policy as FamilyRecordPolicy }
      : {}),
    ...(searchParams.get('startDate') ? { startDate: searchParams.get('startDate')! } : {}),
    ...(type === 'add' || type === 'sub' ? { type } : {}),
    ...(tagIds.length ? { tagIds } : {}),
  };
}

const SearchContent: FC<{ householdId: string }> = ({ householdId }) => {
  const { t } = useTranslation('household');
  const [searchParams, setSearchParams] = useSearchParams();
  const membersQuery = useHouseholdMembersQuery({ params: { householdId } });
  const filters = getFilters(searchParams);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    for (const key of [
      'keyword',
      'type',
      'memberUserId',
      'startDate',
      'endDate',
      'categoryIds',
      'tagIds',
      'minAmount',
      'maxAmount',
      'policy',
      'countedOnly',
    ]) {
      const value = String(data.get(key) ?? '').trim();
      if (value)
        next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <form className="card-rounded mb-3 bg-white px-3 py-4" onSubmit={handleSubmit}>
        <label className="block text-xs text-font-gray">
          {t('records.keyword')}
          <input
            className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm text-font-black outline-none"
            defaultValue={searchParams.get('keyword') ?? ''}
            name="keyword"
            placeholder={t('records.keywordPlaceholder')}
          />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs text-font-gray">
            {t('records.type')}
            <select className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm text-font-black" defaultValue={searchParams.get('type') ?? ''} name="type">
              <option value="">{t('records.all')}</option>
              <option value="add">{t('common.income')}</option>
              <option value="sub">{t('common.expense')}</option>
            </select>
          </label>
          <label className="text-xs text-font-gray">
            {t('records.member')}
            <select className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm text-font-black" defaultValue={searchParams.get('memberUserId') ?? ''} name="memberUserId">
              <option value="">{t('records.all')}</option>
              {membersQuery.data.map(member => (
                <option key={member.id} value={member.user.id}>{member.nickname}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-font-gray">
            {t('records.startDate')}
            <input className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-2 text-sm" defaultValue={searchParams.get('startDate') ?? ''} name="startDate" type="date" />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.endDate')}
            <input className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-2 text-sm" defaultValue={searchParams.get('endDate') ?? ''} name="endDate" type="date" />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.minAmount')}
            <input className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm" defaultValue={searchParams.get('minAmount') ?? ''} name="minAmount" type="number" />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.maxAmount')}
            <input className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm" defaultValue={searchParams.get('maxAmount') ?? ''} name="maxAmount" type="number" />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.categoryIds')}
            <input className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm" defaultValue={searchParams.get('categoryIds') ?? ''} name="categoryIds" placeholder={t('records.categoryIdsPlaceholder')} />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.tagIds')}
            <input className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm" defaultValue={searchParams.get('tagIds') ?? ''} name="tagIds" placeholder={t('records.tagIdsPlaceholder')} />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.policy')}
            <select className="mt-1 h-11 w-full rounded-xl border-0 bg-bg-gray px-3 text-sm" defaultValue={searchParams.get('policy') ?? ''} name="policy">
              <option value="">{t('records.all')}</option>
              {Object.values(FamilyRecordPolicy).map(policy => <option key={policy} value={policy}>{t(`policy.${policy}`)}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 self-end py-3 text-xs text-font-black">
            <input defaultChecked={searchParams.get('countedOnly') === 'true'} name="countedOnly" type="checkbox" value="true" />
            {t('records.countedOnly')}
          </label>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button block onClick={() => setSearchParams({}, { replace: true })}>{t('records.reset')}</Button>
          <Button block color="primary" type="submit">{t('records.filter')}</Button>
        </div>
      </form>
      <HouseholdRecordsPanel filters={filters} householdId={householdId} />
    </>
  );
};

const HouseholdRecordSearchPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>{t('records.searchTitle')}</NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <HouseholdScopeBoundary householdId={householdId}>
          {() => <SearchContent householdId={householdId} />}
        </HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdRecordSearchPage;

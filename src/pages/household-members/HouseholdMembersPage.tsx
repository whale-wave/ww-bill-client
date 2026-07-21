import type { FC } from 'react';
import type { Household } from '@/entities/household';
import { Avatar, ErrorBlock } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import { HouseholdMemberRole, useHouseholdMembersQuery } from '@/entities/household';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { getDisplayName, HouseholdPageState, HouseholdScopeBoundary } from '@/features/household';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const MembersContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const query = useHouseholdMembersQuery({ params: { householdId: household.id } });
  const userQuery = useGetUserUserInfoQuery();
  return (
    <HouseholdPageState errorDescription={t('common.loadErrorDescription')} errorTitle={t('common.loadError')} isError={query.isError} isLoading={query.isLoading} loadingLabel={t('common.loading')} onRetry={() => void query.refetch()} retryLabel={t('common.retry')}>
      {!query.data.length
        ? <ErrorBlock status="empty" title={t('members.empty')} />
        : (
            <div className="overflow-hidden rounded-xl bg-white">
              {query.data.map((member, index) => (
                <div className={`flex items-center px-4 py-4 ${index ? 'border-0 border-t border-solid border-[#EBEBEB]' : ''}`} data-member-id={member.id} key={member.id}>
                  <Avatar src={member.user.avatar || ''} style={{ '--size': '48px' }} />
                  <span className="ml-3 min-w-0 flex-grow">
                    <strong className="block text-base text-font-black">
                      {member.nickname || getDisplayName(member.user)}
                      {' '}
                      {member.user.id === userQuery.data?.id ? `· ${t('members.me')}` : ''}
                    </strong>
                    <span className="mt-1 block text-xs text-font-gray">
                      {member.role === HouseholdMemberRole.OWNER ? t('members.owner') : t('members.partner')}
                      {' '}
                      ·
                      {' '}
                      {member.joinedAt.slice(0, 10)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
    </HouseholdPageState>
  );
};

const HouseholdMembersPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>{t('members.title')}</NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-3 py-3">
        <HouseholdScopeBoundary householdId={householdId}>{household => <MembersContent household={household} />}</HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdMembersPage;

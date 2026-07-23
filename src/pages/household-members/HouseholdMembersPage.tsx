import type { FC } from 'react';
import type { Household } from '@/entities/household';
import { Avatar, ErrorBlock } from 'antd-mobile';
import { ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { HouseholdMemberRole, useHouseholdMembersQuery } from '@/entities/household';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { getDisplayName, HouseholdPageHeader, HouseholdPageState, HouseholdScopeBoundary } from '@/features/household';
import { useTranslation } from '@/shared/i18n';

const MembersContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const query = useHouseholdMembersQuery({ params: { householdId: household.id } });
  const userQuery = useGetUserUserInfoQuery();
  return (
    <HouseholdPageState errorDescription={t('common.loadErrorDescription')} errorTitle={t('common.loadError')} isError={query.isError} isLoading={query.isLoading} loadingLabel={t('common.loading')} onRetry={() => void query.refetch()} retryLabel={t('common.retry')}>
      {!query.data.length
        ? <ErrorBlock status="empty" title={t('members.empty')} />
        : (
            <div>
              {query.data
                .slice()
                .sort((left, right) => Number(right.user.id === userQuery.data?.id) - Number(left.user.id === userQuery.data?.id))
                .map(member => (
                  <section className="household-member-section" data-member-id={member.id} key={member.id}>
                    <div className="household-member-row">
                      <span className="household-member-label">
                        {member.user.id === userQuery.data?.id ? t('members.myAvatar') : t('members.partnerAvatar')}
                      </span>
                      <span className="household-member-value">
                        <Avatar src={member.user.avatar || ''} style={{ '--size': '44px' }} />
                        {member.role === HouseholdMemberRole.OWNER && (
                          <span className="household-role-badge">{t('members.owner')}</span>
                        )}
                      </span>
                    </div>
                    <div className="household-member-row">
                      <span className="household-member-label">
                        {member.user.id === userQuery.data?.id ? t('members.nickname') : t('members.partnerNickname')}
                      </span>
                      <span className="household-member-value">
                        {member.nickname || getDisplayName(member.user)}
                        {member.user.id === userQuery.data?.id && <ChevronRight aria-hidden="true" size={18} />}
                      </span>
                    </div>
                    <div className="household-member-row">
                      <span className="household-member-label">
                        {member.user.id === userQuery.data?.id ? t('members.myId') : t('members.partnerId')}
                      </span>
                      <span className="household-member-value">{member.user.id}</span>
                    </div>
                  </section>
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
    <div className="page-new household-shell overflow-hidden">
      <HouseholdPageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        title={t('members.title')}
        tone="primary"
      />
      <main className="min-h-0 flex-grow overflow-auto py-3">
        <HouseholdScopeBoundary householdId={householdId}>{household => <MembersContent household={household} />}</HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdMembersPage;

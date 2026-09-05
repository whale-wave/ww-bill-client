import type { Follow } from '@/entities/follow';
import { UserRoundPlus } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FollowTypeEnum,
  useDeleteFollowMutation,
  useGetFollowQuery,
  usePostFollowMutation,
} from '@/entities/follow';
import { useGetUserUserInfoQuery } from '@/entities/user';
import UserFollowItem from '@/pages/new-follow/ui';
import { useTranslation } from '@/shared/i18n';
import { showDate } from '@/shared/lib/time';
import { IllustratedEmptyState, PageHeader, PageLoadingState } from '@/shared/ui';

function NewFollow() {
  const { t } = useTranslation(['community', 'common']);
  const { data: userInfo } = useGetUserUserInfoQuery();
  const userId = userInfo?.id ? `${userInfo.id}` : '';
  const navigate = useNavigate();
  const [deleteFollowMutate] = useDeleteFollowMutation();
  const [postFollowMutate] = usePostFollowMutation();

  const onSubmit = useCallback(
    (follow: Follow) => async () => {
      if (follow.isFollow) {
        await deleteFollowMutate(`${follow.userId}`);
      }
      else {
        await postFollowMutate(`${follow.userId}`);
      }
    },
    [deleteFollowMutate, postFollowMutate],
  );

  const { isLoading, data } = useGetFollowQuery({
    params: {
      id: userId,
      params: {
        type: FollowTypeEnum.FANS,
      },
    },
    options: {
      enabled: !!userId,
    },
  });

  return (
    <div className="page-new relative overflow-hidden" data-new-follow-page>
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        title={t('community:newFollow')}
      />
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto px-[var(--ww-page-gutter)] pb-[max(24px,env(safe-area-inset-bottom))] pt-1">
        {isLoading && <PageLoadingState label={t('common:nav.loading')} />}
        {!isLoading && data?.data.length === 0 && (
          <div className="rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
            <IllustratedEmptyState
              className="min-h-[400px]"
              description={t('community:newFollowState.emptyHint')}
              icon={<UserRoundPlus aria-hidden="true" size={38} strokeWidth={1.8} />}
              title={t('community:newFollowState.empty')}
            />
          </div>
        )}
        {!isLoading && data?.data && data.data.length > 0 && (
          <section className="overflow-hidden rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
            {data?.data.map(i => (
              <UserFollowItem
                key={i.id}
                username={i.name}
                avatar={i.avatar}
                isFollow={i.isFollow}
                followTime={showDate(i.createdAt)}
                onClick={() => navigate(`/community/personal/${i.userId}`)}
                onSubmit={onSubmit(i)}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default NewFollow;

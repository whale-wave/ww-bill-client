import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetTopicIdCommentQuery } from '@/entities/topic';
import { useGetUserUserInfoQuery } from '@/entities/user';
import CommentListItem from '@/pages/comment-list/ui';
import { useTranslation } from '@/shared/i18n';
import { showDate } from '@/shared/lib/time';
import { IllustratedEmptyState, PageHeader, PageLoadingState } from '@/shared/ui';

function CommentList() {
  const { t } = useTranslation('community');
  const { data: userInfo } = useGetUserUserInfoQuery();
  const navigate = useNavigate();
  const userId = userInfo?.id ? `${userInfo.id}` : '';
  const { data, isLoading } = useGetTopicIdCommentQuery({
    params: userId,
    options: {
      enabled: !!userId,
    },
  });

  return (
    <div className="page-new relative overflow-hidden" data-comment-list-page>
      <PageHeader
        backLabel={t('commentList.back')}
        onBack={() => navigate(-1)}
        title={t('commentList.title')}
      />
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto px-[var(--ww-page-gutter)] pb-[max(24px,env(safe-area-inset-bottom))] pt-1">
        {isLoading && <PageLoadingState label={t('commentList.loading')} />}
        {!isLoading && data?.data.length === 0 && (
          <div className="rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
            <IllustratedEmptyState
              className="min-h-[400px]"
              description={t('commentList.emptyHint')}
              icon={<MessageCircle aria-hidden="true" size={38} strokeWidth={1.8} />}
              title={t('commentList.empty')}
            />
          </div>
        )}
        {!isLoading && data?.data && data.data.length > 0 && (
          <section className="overflow-hidden rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
            {data?.data.map(item => (
              <CommentListItem
                key={item.id}
                coverPicture={item.topic.images?.[0]}
                avatar={item.user.avatar}
                content={item.content}
                name={item.user.name}
                time={showDate(item.createdAt)}
                onClick={() => navigate(`/topic-detail/${item.topic.id}`)}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default CommentList;

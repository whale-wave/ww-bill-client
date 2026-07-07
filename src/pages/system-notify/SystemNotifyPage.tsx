import { useTranslation } from '@/shared/i18n';
import { useNavigate } from 'react-router-dom';
import { useGetSystemNotifyQuery } from '@/entities/system-notify';
import CommentListItem from '@/pages/comment-list/ui';
import { showDate } from '@/shared/lib/time';
import { NavBar } from '@/shared/ui';

function SystemNotify() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { data, isLoading } = useGetSystemNotifyQuery();

  if (isLoading)
    return <div>loading...</div>;

  return (
    <div>
      <NavBar back={t("common:nav.back")} onBack={() => navigate(-1)}>
        {t('common:message.systemNotify.title')}
      </NavBar>
      {data.map((i: any) => {
        return (
          <CommentListItem
            key={i.id}
            name={i.user.name}
            time={showDate(i.createdAt)}
            content={i.content}
            avatar={i.user.avatar}
            coverPicture={i.coverPicture}
          />
        );
      })}
    </div>
  );
}

export default SystemNotify;

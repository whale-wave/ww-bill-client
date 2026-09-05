import { useNavigate, useParams } from 'react-router-dom';
import { useGetTopicUserInfoQuery } from '@/entities/topic';
import Tabs from '@/pages/community/ui/Personal/Tabs';
import UserInfo from '@/pages/community/ui/Personal/UserInfo';
import { useTranslation } from '@/shared/i18n';
import { PageHeader } from '@/shared/ui';
import styles from './Personal.module.scss';

function Personal() {
  const navigate = useNavigate();
  const { t } = useTranslation('community');
  const routeParams = useParams();
  const id = routeParams.id ?? '';
  const { data } = useGetTopicUserInfoQuery({
    params: {
      id,
    },
    options: {
      enabled: !!id,
    },
  });

  return (
    <div className="page-new relative overflow-hidden" data-community-personal-page>
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        title={data?.userInfo.name ?? t('userInfo.defaultName')}
      />
      <main className={styles.content}>
        <UserInfo
          data={data?.userInfo}
          isFollow={data?.isFollow}
          fansCount={data?.fans}
          followCount={data?.follow}
        />
        <Tabs checkInfo={data?.checkInfo} topics={data?.topics.topics} />
      </main>
    </div>
  );
}

export default Personal;

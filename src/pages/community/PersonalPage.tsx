import { useNavigate, useParams } from 'react-router-dom';
import { useGetTopicUserInfoQuery } from '@/entities/topic';
import { useTranslation } from '@/shared/i18n';
import Tabs from '@/pages/community/ui/Personal/Tabs';
import UserInfo from '@/pages/community/ui/Personal/UserInfo';
import { NavBar } from '@/shared/ui';
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
    <div className="page">
      <NavBar
        onBack={() => navigate(-1)}
        back={t('common:nav.back')}
        className={styles['nav-bar']}
      />
      <UserInfo
        data={data?.userInfo}
        isFollow={data?.isFollow}
        fansCount={data?.fans}
        followCount={data?.follow}
      />
      <Tabs checkInfo={data?.checkInfo} topics={data?.topics.topics} />
    </div>
  );
}

export default Personal;

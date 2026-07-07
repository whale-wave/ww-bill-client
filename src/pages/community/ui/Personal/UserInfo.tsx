import type { FC } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import {
  useDeleteFollowMutation,
  usePostFollowMutation,
} from '@/entities/follow';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { useTranslation } from '@/shared/i18n';
import styles from './UserInfo.module.scss';

interface UserInfoProps {
  data?: {
    avatar: string;
    id: number;
    name: string;
  };
  isFollow?: boolean;
  fansCount?: number;
  followCount?: number;
}

const UserInfo: FC<UserInfoProps> = ({
  data,
  isFollow,
  followCount,
  fansCount,
}) => {
  const { t } = useTranslation('community');
  const navigate = useNavigate();
  const { data: userInfo } = useGetUserUserInfoQuery();
  const [postFollow] = usePostFollowMutation();
  const [deleteFollow] = useDeleteFollowMutation();

  const followUser = async (followId: number) => {
    await postFollow(`${followId}`);
  };

  const unFollowUser = async (followId: number) => {
    await deleteFollow(`${followId}`);
  };

  const goToFollowListPage = (followId: number, type: 'follow' | 'fans') => {
    navigate(`/community/follow-list/${followId}/${type}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.avatar, 'rounded-full')}>
        <img src={data?.avatar} alt="" />
      </div>
      <div className={styles.middle}>
        <span className={styles.name}>{data?.name || t('userInfo.defaultName')}</span>
        <div className={styles.desc}>
          <div onClick={() => data && goToFollowListPage(data.id, 'follow')}>
            <span>{followCount || 0}</span>
            {' '}
            {t('follow.following')}
          </div>
          <div onClick={() => data && goToFollowListPage(data.id, 'fans')}>
            <span>{fansCount || 0}</span>
            {' '}
            {t('follow.fans')}
          </div>
        </div>
      </div>
      <div className={styles.btn}>
        {data?.id
          && data.id !== userInfo?.id
          && (isFollow
            ? (
                <button onClick={() => unFollowUser(data.id)}>{t('follow.following')}</button>
              )
            : (
                <button onClick={() => followUser(data.id)}>{t('follow.follow')}</button>
              ))}
      </div>
    </div>
  );
};

export default UserInfo;

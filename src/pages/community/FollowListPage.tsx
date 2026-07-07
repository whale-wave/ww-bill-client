import type { FC } from 'react';
import type { Follow } from '@/entities/follow';
import { useNavigate, useParams } from 'react-router-dom';
import { FollowTypeEnum, useGetFollowQuery } from '@/entities/follow';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';
import styles from './FollowList.module.scss';

interface ItemProps {
  data: Follow;
  t: (key: string) => string;
}

const Item: FC<ItemProps> = ({ data, t }) => {
  return (
    <div className={styles.item}>
      <img className="rounded-full overflow-hidden" src={data.avatar} alt="" />
      <div className={styles.box}>
        <div className={styles.name}>{data.name}</div>
        <div className={styles.desc}>
          <span>
            {t('followList.fansLabel')}
            {data.fans}
          </span>
          <span>
            {t('followList.topicsLabel')}
            {data.topics}
          </span>
        </div>
      </div>
      <div className={styles['btn-wrapper']}>
        {data.isFollow
          ? (
              <button className={styles.active}>{t('followList.followed')}</button>
            )
          : (
              <button>{t('followList.follow')}</button>
            )}
      </div>
    </div>
  );
};

function FollowList() {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('community');
  const followType
    = type === FollowTypeEnum.FOLLOW || type === FollowTypeEnum.FANS
      ? type
      : FollowTypeEnum.FOLLOW;
  const { data } = useGetFollowQuery({
    params: {
      id: id ?? '',
      params: {
        type: followType,
      },
    },
    queryOptions: {
      enabled: !!id && !!type,
    },
  });

  const followName = (type: FollowTypeEnum) => {
    return type === FollowTypeEnum.FOLLOW ? t('followList.followed') : t('followList.fans');
  };

  return (
    <div>
      <NavBar
        className={styles['nav-bar']}
        back={t('common:nav.back')}
        onBack={() => navigate(-1)}
      >
        {t('followList.userNamePrefix')}
        {followName(followType)}
      </NavBar>
      {data.data.map(i => (
        <Item key={i.id} data={i} t={t} />
      ))}
    </div>
  );
}

export default FollowList;

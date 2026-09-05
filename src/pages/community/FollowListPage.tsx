import type { FC } from 'react';
import type { Follow } from '@/entities/follow';
import { UsersRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { FollowTypeEnum, useGetFollowQuery } from '@/entities/follow';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, PageHeader, PageLoadingState } from '@/shared/ui';
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
              <span className={`${styles['follow-status']} ${styles.active}`}>{t('followList.followed')}</span>
            )
          : (
              <span className={styles['follow-status']}>{t('followList.follow')}</span>
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
  const {
    data,
    isError,
    isLoading,
    refetch,
  } = useGetFollowQuery({
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
    <div className="page-new relative overflow-hidden" data-follow-list-page>
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        title={`${t('followList.userNamePrefix')}${followName(followType)}`}
      />
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto px-[var(--ww-page-gutter)] pb-[max(24px,env(safe-area-inset-bottom))] pt-1">
        {isLoading && <PageLoadingState label={t('common:nav.loading')} />}
        {!isLoading && isError && (
          <div className="rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
            <IllustratedEmptyState
              actionLabel={t('common:retry')}
              className="min-h-[360px]"
              icon={<UsersRound aria-hidden="true" size={38} strokeWidth={1.8} />}
              onAction={() => void refetch()}
              title={t('common:error.loadFail')}
            />
          </div>
        )}
        {!isLoading && !isError && data.data.length === 0 && (
          <div className="rounded-[var(--ww-card-radius)] border border-solid border-border-primary bg-ww-surface-raised shadow-ww-xs">
            <IllustratedEmptyState
              className="min-h-[400px]"
              description={t('followList.emptyHint')}
              icon={<UsersRound aria-hidden="true" size={38} strokeWidth={1.8} />}
              title={t('followList.empty')}
            />
          </div>
        )}
        {!isLoading && !isError && data.data.length > 0 && (
          <section className={styles.list}>
            {data.data.map(i => (
              <Item key={i.id} data={i} t={t} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default FollowList;

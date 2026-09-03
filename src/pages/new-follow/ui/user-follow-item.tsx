import type { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from '@/shared/i18n';
import { stopPropagation } from '@/shared/lib';

interface UserFollowItemProps {
  avatar?: string;
  username: string;
  followTime: string;
  isFollow?: boolean;
  className?: string;
  onSubmit?: () => void;
  onClick?: () => void;
  onAvatar?: () => void;
}

const defaultProps = {
  avatar: '',
  isFollow: false,
};

const classPrefix = 'bwm-user-follow-item';

export const UserFollowItem: FC<UserFollowItemProps> = (p) => {
  const { t } = useTranslation(['community', 'common']);
  const props = { ...defaultProps, ...p };
  return (
    <article className={classNames(classPrefix, props.className)}>
      <button
        aria-label={t('common:avatar')}
        className={`${classPrefix}-avatar-button`}
        onClick={props.onAvatar ?? props.onClick}
        type="button"
      >
        <img src={props.avatar || ''} alt="" />
      </button>
      <button className={`${classPrefix}-box`} onClick={props.onClick} type="button">
        <span className={`${classPrefix}-box-username`}>{props.username}</span>
        <span className={`${classPrefix}-box-desc`}>
          {props.followTime}
          {' '}
          {t('community:followList.startedFollowing')}
        </span>
      </button>
      <button
        onClick={e => stopPropagation(e, props.onSubmit)}
        className={classNames(`${classPrefix}-follow-button`, {
          follow: props.isFollow,
        })}
        type="button"
      >
        {props.isFollow ? t('community:followList.followed') : t('community:followList.follow')}
      </button>
    </article>
  );
};

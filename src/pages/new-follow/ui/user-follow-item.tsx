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
    <div
      className={classNames(classPrefix, props.className)}
      onClick={props.onClick}
    >
      <img onClick={props.onAvatar} src={props.avatar || ''} alt={t('common:avatar')} />
      <div className={`${classPrefix}-box`}>
        <span className={`${classPrefix}-box-username`}>{props.username}</span>
        <span className={`${classPrefix}-box-desc`}>
          {props.followTime}
          {' '}
          {t('community:followList.startedFollowing')}
        </span>
      </div>
      <button
        onClick={e => stopPropagation(e, props.onSubmit)}
        className={classNames({
          follow: props.isFollow,
        })}
      >
        {props.isFollow ? t('community:followList.followed') : t('community:followList.follow')}
      </button>
    </div>
  );
};

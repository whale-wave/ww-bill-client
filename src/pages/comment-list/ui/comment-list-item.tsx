import type { FC } from 'react';
import { useTranslation } from '@/shared/i18n';

const classPrefix = 'bwm-comment-list-item';

interface CommentListItemProps {
  avatar?: string;
  coverPicture?: string;
  content: string;
  name: string;
  time: string;
  onClick?: () => void;
}

const defaultProps = {
  avatar: '',
  coverPicture: '',
};

export const CommentListItem: FC<CommentListItemProps> = (p) => {
  const { t } = useTranslation('common');
  const props = { ...defaultProps, ...p };
  return (
    <article className={classPrefix}>
      <div className={`${classPrefix}-left`}>
        <div className={`${classPrefix}-left-img`}>
          <img src={props.avatar} alt={t('common:avatar')} />
        </div>
      </div>
      <div className={`${classPrefix}-middle`}>
        <div className={`${classPrefix}-middle-top`}>
          <span className={`${classPrefix}-middle-top-name`}>{props.name}</span>
          <span className={`${classPrefix}-middle-top-time`}>{props.time}</span>
        </div>
        <div className={`${classPrefix}-middle-bottom`}>
          <p>{props.content}</p>
        </div>
      </div>
      {props.coverPicture && (
        <div className={`${classPrefix}-right`}>
          <img src={props.coverPicture} alt={t('common:coverImage')} />
        </div>
      )}
      {props.onClick && (
        <button
          aria-label={`${props.name}: ${props.content}`}
          className={`${classPrefix}-action`}
          onClick={props.onClick}
          type="button"
        />
      )}
    </article>
  );
};

import type { FC } from 'react';
import type { Topic } from '../api';
import classNames from 'classnames';
import { useTranslation } from '@/shared/i18n';
import { showDate } from '@/shared/lib/time';
import { Icon } from '@/shared/ui';
import styles from './TopicItem.module.scss';

interface TopicItemProps {
  data: Topic;
  onClick?: (id: number) => void;
  onImg?: (index: number, src: string) => void;
  onLike?: (id: number) => void;
  onShare?: (id: number) => void;
  onComment?: (id: number) => void;
  onAvatar?: (id: number) => void;
}

export const TopicItem: FC<TopicItemProps> = ({
  data,
  onClick,
  onImg,
  onLike,
  onShare,
  onComment,
  onAvatar,
}) => {
  const { t } = useTranslation('community');

  return (
    <article className={styles.item}>
      <div className={styles.head}>
        {onAvatar
          ? (
              <button className={classNames(styles.img, 'rounded-full overflow-hidden')} onClick={() => onAvatar(data.user.id)} type="button">
                <img className="object-cover" src={data.user.avatar} alt={data.user.name || t('userInfo.defaultName')} />
              </button>
            )
          : (
              <div className={classNames(styles.img, 'rounded-full overflow-hidden')}>
                <img className="object-cover" src={data.user.avatar} alt={data.user.name || t('userInfo.defaultName')} />
              </div>
            )}
        {onClick
          ? (
              <button className={styles.profile} onClick={() => onClick(data.id)} type="button">
                <span className={styles.name}>{data.user.name || t('userInfo.defaultName')}</span>
                <span className={styles.time}>{showDate(data.createdAt)}</span>
              </button>
            )
          : (
              <div className={styles.profile}>
                <span className={styles.name}>{data.user.name || t('userInfo.defaultName')}</span>
                <span className={styles.time}>{showDate(data.createdAt)}</span>
              </div>
            )}
      </div>
      <main>
        {onClick
          ? <button className={styles.content} onClick={() => onClick(data.id)} type="button">{data.content}</button>
          : <div className={styles.content}>{data.content}</div>}
        <div className={classNames(styles.imgs, 'flex flex-wrap')}>
          {data.images.length > 0
            && data.images.map((img, index) => (
              onImg
                ? (
                    <button
                      className={classNames(styles.img, 'relative h-0 overflow-hidden')}
                      key={img + index}
                      onClick={() => onImg(index, img)}
                      type="button"
                    >
                      <img className="w-full h-full object-cover" src={img} alt="" />
                    </button>
                  )
                : (
                    <div className={classNames(styles.img, 'relative h-0 overflow-hidden')} key={img + index}>
                      <img className="w-full h-full object-cover" src={img} alt="" />
                    </div>
                  )
            ))}
        </div>
        <footer className="flex">
          {onShare
            ? (
                <button className={styles.action} onClick={() => onShare(data.id)} type="button">
                  <Icon name="share" />
                  {data.shareCount || 0}
                </button>
              )
            : (
                <span className={styles.action}>
                  <Icon name="share" />
                  {data.shareCount || 0}
                </span>
              )}
          {onComment
            ? (
                <button className={styles.action} onClick={() => onComment(data.id)} type="button">
                  <Icon name="comment" />
                  {data.commentCount || 0}
                </button>
              )
            : (
                <span className={styles.action}>
                  <Icon name="comment" />
                  {data.commentCount || 0}
                </span>
              )}
          {onLike
            ? (
                <button className={styles.action} onClick={() => onLike(data.id)} type="button">
                  <Icon name={data.isLike ? 'like-fill' : 'like'} />
                  {data.likeCount || 0}
                </button>
              )
            : (
                <span className={styles.action}>
                  <Icon name={data.isLike ? 'like-fill' : 'like'} />
                  {data.likeCount || 0}
                </span>
              )}
        </footer>
      </main>
    </article>
  );
};

import type { FC } from 'react';
import type { TopicDetail } from '@/entities/topic';
import classNames from 'classnames';
import { useTranslation } from '@/shared/i18n';
import { showDate } from '@/shared/lib/time';
import styles from './ReplyArea.module.scss';

interface ReplyProps {
  comments?: TopicDetail['comments'];
}

const ReplyArea: FC<ReplyProps> = ({ comments }) => {
  const { t } = useTranslation('community');

  return (
    <div>
      <header
        className={classNames(
          styles.header,
          'flex items-center justify-between',
        )}
      >
        <span>{t('reply.allComments')}</span>
        <div>{t('reply.sortByHot')}</div>
      </header>
      <div
        className={classNames(
          styles['list-wrapper'],
          'flex justify-center items-center flex-wrap',
        )}
      >
        {comments && comments.length > 0
          ? comments.map(item => (
              <div
                className={classNames(styles.item, 'w-full relative')}
                key={item.id}
              >
                <main className="flex">
                  <div
                    className={classNames(
                      styles.avatar,
                      'rounded-full overflow-hidden',
                    )}
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={item.user.avatar}
                      alt={item.user.name}
                    />
                  </div>
                  <div className={classNames(styles.right, 'flex-grow')}>
                    <div>{item.user.name}</div>
                    <div className={styles.content}>{item.content}</div>
                    <div className={styles.time}>
                      {showDate(item.createdAt)}
                    </div>
                  </div>
                </main>
              </div>
            ))
          : (
              <div className={styles.empty}>{t('reply.empty')}</div>
            )}
      </div>
    </div>
  );
};

export default ReplyArea;

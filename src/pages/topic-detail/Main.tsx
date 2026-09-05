import type { FC } from 'react';
import type { TopicDetail } from '@/entities/topic';
import { useState } from 'react';
import { TopicItem } from '@/entities/topic';
import ReplyArea from '@/pages/topic-detail/ReplyArea';
import { SHARE_PLATFORM_COLORS } from '@/shared/config/share-platform-colors';
import { useTranslation } from '@/shared/i18n';
import { FixedPin, ImagePreview, Share } from '@/shared/ui';
import styles from './index.module.scss';

interface MainProps {
  topic?: TopicDetail;
  comments?: TopicDetail['comments'];
  onLike: () => void;
}

const Main: FC<MainProps> = ({ topic, comments, onLike }) => {
  const { t } = useTranslation('community');
  const [imgVisible, setImgVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [shareVisible, setShareVisible] = useState(false);

  const shares = [
    {
      id: 1,
      name: t('share.wechat'),
      icon: 'wechat',
      color: SHARE_PLATFORM_COLORS.wechat,
      onClick: () => {
        console.error('share.wechat(topic)');
      },
    },
    {
      id: 2,
      name: t('share.wechatMoments'),
      icon: 'wechat-friends',
      color: SHARE_PLATFORM_COLORS.wechatMoments,
      onClick: () => {
        console.error('share.wechat-friends(topic)');
      },
    },
    {
      id: 3,
      name: 'QQ',
      icon: 'qq',
      color: SHARE_PLATFORM_COLORS.qq,
      onClick: () => {
        console.error('share.qq(topic)');
      },
    },
    {
      id: 4,
      name: t('share.qqZone'),
      icon: 'qq-zone',
      color: SHARE_PLATFORM_COLORS.qqZone,
      onClick: () => {
        console.error('share.qq-zone(topic)');
      },
    },
  ];

  return (
    <main className={styles.content}>
      <Share
        shares={shares}
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
      />
      <FixedPin onClick={() => setShareVisible(true)}>{t('share.share')}</FixedPin>
      <ImagePreview
        visible={imgVisible}
        image={imgSrc}
        onClose={() => setImgVisible(false)}
      />
      {topic && (
        <section className={styles['topic-card']}>
          <TopicItem
            data={topic}
            onClick={() => console.error('click item')}
            onShare={() => console.error('share')}
            onLike={onLike}
            onImg={(_, src) => {
              setImgVisible(true);
              setImgSrc(src);
            }}
          />
        </section>
      )}
      <section className={styles['reply-card']}>
        <ReplyArea comments={comments} />
      </section>
    </main>
  );
};

export default Main;

import type { FC } from 'react';
import type { Topic } from '@/entities/topic';
import classNames from 'classnames';
import { MessageCircleMore } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopicItem, usePutTopicLikeMutation } from '@/entities/topic';
import { useTranslation } from '@/shared/i18n';
import { IllustratedEmptyState, ImagePreview } from '@/shared/ui';
import styles from './ItemList.module.scss';

interface ItemListProps {
  data?: Topic[];
}

const ItemList: FC<ItemListProps> = ({ data }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('community');
  const [putTopicLike] = usePutTopicLikeMutation();
  const handleLike = async (topicId: number) => {
    await putTopicLike(topicId);
  };
  const [imgVisible, setImgVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  const toDetail = useCallback((id: number) => {
    navigate(`/topic-detail/${id}`);
  }, [navigate]);

  return (
    <main className="ww-tab-bar-scroll-padding relative min-h-0 flex-grow overflow-auto px-[var(--ww-page-gutter)] pb-[118px] pt-1">
      <ImagePreview
        visible={imgVisible}
        image={imgSrc}
        onClose={() => setImgVisible(false)}
      />
      {data && !!data.length
        ? (
            <section className={styles.list}>
              {data.map(i => (
                <div className={styles.card} key={i.id}>
                  <TopicItem
                    data={i}
                    onClick={id => toDetail(id)}
                    onComment={id => toDetail(id)}
                    onShare={() => console.error('share')}
                    onLike={() => handleLike(i.id)}
                    onImg={(_, src) => {
                      setImgVisible(true);
                      setImgSrc(src);
                    }}
                    onAvatar={id => navigate(`/community/personal/${id}`)}
                  />
                </div>
              ))}
            </section>
          )
        : (
            <div className={classNames(styles['not-data-wrapper'], 'pt-20')}>
              <IllustratedEmptyState
                className="min-h-[320px]"
                icon={<MessageCircleMore size={36} strokeWidth={1.7} />}
                title={t('common:empty')}
              />
            </div>
          )}
    </main>
  );
};
export default ItemList;

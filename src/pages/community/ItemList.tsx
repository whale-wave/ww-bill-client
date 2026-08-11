import type { FC } from 'react';
import type { Topic } from '@/entities/topic';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopicItem, usePutTopicLikeMutation } from '@/entities/topic';
import { useTranslation } from '@/shared/i18n';
import { Icon, ImagePreview } from '@/shared/ui';
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
    <div
      className="ww-tab-bar-scroll-padding relative flex-grow overflow-auto"
    >
      <ImagePreview
        visible={imgVisible}
        image={imgSrc}
        onClose={() => setImgVisible(false)}
      />
      {data && !!data.length
        ? (
            data.map(i => (
              <TopicItem
                key={i.id}
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
            ))
          )
        : (
            <div
              className={classNames(
                styles['not-data-wrapper'],
                'absolute top-1/2 left-1/2 text-center',
              )}
              style={{
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Icon name="not-data" block className={styles['not-data']} />
              <span className={styles['not-data-text']}>{t('common:empty')}</span>
            </div>
          )}
    </div>
  );
};
export default ItemList;

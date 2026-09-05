import type {
  ChangeEvent,
  FC,
  MouseEvent,
} from 'react';
import { Toast } from 'antd-mobile';
import classNames from 'classnames';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostTopicMutation } from '@/entities/topic';
import { uploadFile } from '@/shared/api';
import { useTranslation } from '@/shared/i18n';
import { AppButton, Icon, PageHeader } from '@/shared/ui';
import styles from './index.module.scss';

const PostTopic: FC = () => {
  const { t } = useTranslation('community');
  const uploadRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [imgs, setImgs] = useState<string[]>([]);
  const navigator = useNavigate();
  const [postTopic] = usePostTopicMutation();

  const deleteImg = (i: number) => {
    const state = [...imgs];
    state.splice(i, 1);
    setImgs(state);
  };

  const addImg = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    uploadRef.current?.click();
  };

  const handleAddTopic = async () => {
    try {
      const { statusCode, message } = await postTopic({ content, images: imgs });
      if (statusCode === 200) {
        Toast.show({ content: t('post.success'), duration: 600 });
        setTimeout(() => {
          navigator('/community');
        }, 600);
      }
      else {
        Toast.show({ content: message?.[0] });
      }
    }
    catch (error: any) {
      console.error(error);
    }
  };

  const clearFiles = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.value = '';
    }
  }, []);

  const changeFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const files = target.files;
    if (!files)
      return;
    if (imgs.length + files.length > 9) {
      clearFiles();
      return Toast.show({ content: t('post.maxImages') });
    }

    Toast.show({
      icon: 'loading',
      content: t('post.uploading'),
      duration: 0,
      maskClickable: false,
    });

    const uploadFileCb = (data: FormData) => {
      return () => uploadFile(data);
    };

    const formDataCb = [...files].map((file) => {
      const formData = new FormData();
      formData.append('file', file);
      return uploadFileCb(formData);
    });

    const data = [] as string[];
    try {
      for (const cb of formDataCb) {
        const res = await cb();
        if (res)
          data.push(res.data.url);
      }
      Toast.clear();
    }
    finally {
      clearFiles();
    }

    setImgs([...imgs].concat(data));
  };

  useEffect(() => {
    clearFiles();
  }, [clearFiles, imgs]);

  return (
    <div className={classNames('page-new', styles.wrapper)} data-post-topic-page>
      <PageHeader
        backLabel={t('common:nav.cancel')}
        onBack={() => navigator(-1)}
        title={t('post.title')}
      />
      <main className={styles.content}>
        <section className={styles['editor-card']}>
          <div
            onInput={(e: ChangeEvent<HTMLDivElement>) => {
              setContent(e.target.textContent ?? '');
            }}
            contentEditable={true}
            aria-label={t('post.content')}
            aria-multiline="true"
            data-placeholder={t('post.content')}
            role="textbox"
            className={classNames('max-width-full', styles.textarea)}
          />
          <div className={styles.imgs}>
            {imgs.map((img, i) => (
              <div key={img} className={styles.img}>
                <button
                  aria-label={t('post.deleteImage')}
                  className={styles.circle}
                  onClick={() => deleteImg(i)}
                  type="button"
                >
                  <Icon name="add" className={styles.del} />
                </button>
                <img src={img} alt="" />
              </div>
            ))}
            {imgs.length < 9 && (
              <button
                aria-label={t('post.addImage')}
                className={classNames(styles.img, styles['add-image'])}
                onClick={addImg}
                type="button"
              >
                <input
                  onClick={e => e.stopPropagation()}
                  ref={uploadRef}
                  type="file"
                  hidden
                  onChange={changeFiles}
                  accept="image/*"
                  multiple={true}
                />
                <Icon className={styles.add} name="add" />
              </button>
            )}
          </div>
          <footer className={styles['topic-row']}>
            <span>{t('post.joinTopic')}</span>
            <div>
              <span>{t('post.topicTip')}</span>
              <Icon name="left" />
            </div>
          </footer>
        </section>
      </main>
      <div className={styles['publish-bar']}>
        <AppButton fullWidth onClick={handleAddTopic}>
          {t('post.publishButton')}
        </AppButton>
      </div>
    </div>
  );
};

export default PostTopic;

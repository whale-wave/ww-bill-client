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
import { Button, Icon, NavBar } from '@/shared/ui';
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
    <div className={classNames('page', styles.wrapper)}>
      <NavBar
        className={styles.top}
        back={t('common:nav.cancel')}
        backArrow={false}
        onBack={() => navigator(-1)}
      >
        {t('post.title')}
      </NavBar>
      <main className="grow">
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
        <div className={classNames(styles.imgs, 'flex flex-wrap')}>
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
              className={classNames(styles.img, styles.addImage)}
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
              <Icon
                className={classNames(styles.add, 'absolute top-1/2 left-1/2')}
                style={{
                  transform: 'translate(-50%, -50%)',
                }}
                name="add"
              />
            </button>
          )}
        </div>
        <footer className="flex items-center">
          <div className="flex-grow flex items-center justify-between">
            <span>{t('post.joinTopic')}</span>
            <div>{t('post.topicTip')}</div>
          </div>
          <Icon name="left" />
        </footer>
      </main>
      <Button size="full" onClick={handleAddTopic}>
        {t('post.publishButton')}
      </Button>
    </div>
  );
};

export default PostTopic;

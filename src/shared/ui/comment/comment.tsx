import type { ChangeEvent, FC } from 'react';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import Icon from '../icon';

const classPrefix = 'bwm-comment';

export interface CommentDataProps {
  shareCount: number;
  likeCount: number;
  commentCount: number;
  startCount?: number;
  isLike?: boolean;
}

interface CommentProps {
  /**
   * 数据项
   */
  data: CommentDataProps;
  /**
   * 提交事件
   */
  onSubmit?: (text: string) => void;
  /**
   * 收藏事件
   */
  onStart?: () => void;
  /**
   * 点赞事件
   */
  onLike?: () => void;
  /**
   * 分享事件
   */
  onShare?: () => void;
}

export const Comment: FC<CommentProps> = ({ onSubmit, data, onShare, onLike, onStart }) => {
  const { t } = useTranslation('common');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');

  return (
    <div className={classPrefix}>
      <textarea
        ref={textareaRef}
        className={classNames(`${classPrefix}-test`, {
          [`${classPrefix}-test-editing`]: isEditing,
        })}
        value={content}
        placeholder={t('placeholder.writeComment')}
        onBlur={() => {
          setIsEditing(false);
          textareaRef.current?.removeAttribute('style');
        }}
        onFocus={() => {
          setIsEditing(true);
          const el = textareaRef.current;
          setTimeout(() => {
            el && (el.style.height = `${el.scrollHeight}px`);
          }, 0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
            onSubmit?.(content);
            setTimeout(setContent, 0, '');
            textareaRef.current?.removeAttribute('style');
            textareaRef.current?.blur();
          }
        }}
        onInput={(e: ChangeEvent<HTMLTextAreaElement>) => {
          const el = e.target;
          el.style.height = `${el.scrollHeight}px`;
          setContent(el.value);
        }}
      />
      {!isEditing && (
        <div className={`${classPrefix}-icon`}>
          <div className={`${classPrefix}-box`} onClick={onShare}>
            <span>{data?.shareCount || 0}</span>
            <Icon name="share" />
          </div>
          <div className={`${classPrefix}-box`} onClick={onStart}>
            <span>{data?.startCount || 0}</span>
            <Icon name="start" />
          </div>
          <div className={`${classPrefix}-box`} onClick={onLike}>
            <span>{data?.likeCount || 0}</span>
            <Icon name={data?.isLike ? 'like-fill' : 'like'} />
          </div>
        </div>
      )}
    </div>
  );
};

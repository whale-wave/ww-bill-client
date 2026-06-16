import type { ChangeEvent, FC } from 'react';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';
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
  const textareaEl = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');

  return (
    <div className={classPrefix}>
      <textarea
        ref={textareaEl}
        className={classNames(`${classPrefix}-test`, {
          [`${classPrefix}-test-editing`]: isEditing,
        })}
        value={content}
        placeholder="写评论..."
        onBlur={() => {
          setIsEditing(false);
          textareaEl.current?.removeAttribute('style');
        }}
        onFocus={() => {
          setIsEditing(true);
          const el = textareaEl.current;
          setTimeout(() => {
            el && (el.style.height = `${el.scrollHeight}px`);
          }, 0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
            onSubmit?.(content);
            setTimeout(setContent, 0, '');
            textareaEl.current?.removeAttribute('style');
            textareaEl.current?.blur();
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

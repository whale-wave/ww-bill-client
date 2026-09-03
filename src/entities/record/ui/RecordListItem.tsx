import type { RecordEntry } from '../types';
import classNames from 'classnames';
import React, { memo } from 'react';
import { Icon } from '@/shared/ui';

interface RecordListItemProps {
  className?: string;
  index: number;
  lastIndex: number;
  record: RecordEntry;
  onClick?: () => void;
}

const RecordListItem: React.FC<RecordListItemProps> = memo((props) => {
  const { record, className, index, lastIndex, onClick } = props;
  const content = (
    <>
      <div className="mx-4 py-3">
        <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-ww-surface-tint"><Icon className="text-xl" name={record.category.icon} /></div>
      </div>
      <div className={classNames({
        'border-0 border-b-[1px] border-border-primary border-solid': index !== lastIndex,
      }, 'flex h-[59px] min-w-0 flex-grow items-center py-3 pr-3')}
      >
        <div className="flex-grow overflow-hidden overflow-ellipsis whitespace-nowrap">
          {record.remark}
        </div>
        <div className="ml-4">
          {record.type === 'sub' && '-'}
          {record.amount}
        </div>
      </div>
    </>
  );

  if (!onClick)
    return <div className={classNames('flex items-center text-base', className)}>{content}</div>;

  return (
    <button className={classNames('flex w-full items-center border-0 bg-transparent p-0 text-left text-base', className)} onClick={onClick} type="button">
      {content}
    </button>
  );
});

export default RecordListItem;

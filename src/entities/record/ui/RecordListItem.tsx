import type { ReactNode } from 'react';
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
  secondaryText?: ReactNode;
}

const RecordListItem: React.FC<RecordListItemProps> = memo((props) => {
  const { record, className, index, lastIndex, onClick, secondaryText } = props;

  return (
    <div
      className={classNames('flex items-center text-base', className)}
      data-record-id={record.id}
      onClick={onClick}
    >
      <div className="mx-4 py-3">
        <div className="h-[35px] w-[35px] rounded-full bg-[#f4f4f4] flex justify-center items-center"><Icon className="text-xl" name={record.category.icon} /></div>
      </div>
      <div className={classNames({
        'border-0 border-b-[1px] border-[#ebebeb] border-solid': index !== lastIndex,
      }, 'flex flex-grow items-center py-3 pr-3 h-[59px] min-w-0')}
      >
        <div className="min-w-0 flex-grow">
          <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">{record.remark}</div>
          {secondaryText && (
            <div className="mt-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-font-gray">
              {secondaryText}
            </div>
          )}
        </div>
        <div className="ml-4">
          {record.type === 'sub' && '-'}
          {record.amount}
        </div>
      </div>
    </div>
  );
});

export default RecordListItem;

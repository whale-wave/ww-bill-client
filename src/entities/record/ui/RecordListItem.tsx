import type { RecordEntry } from '../types';
import { RecordLine } from '@ww-bill/bill-ui';
import classNames from 'classnames';
import React, { memo } from 'react';
import { CategoryIcon } from '@/entities/category';
import { getCategoryIconForegroundColor } from '@/shared/lib/category-background';
import { getRecordDisplayTitle } from '../display-title';

interface RecordListItemProps {
  className?: string;
  index: number;
  lastIndex: number;
  record: RecordEntry;
  onClick?: () => void;
}

const RecordListItem: React.FC<RecordListItemProps> = memo(({ className, index, lastIndex, onClick, record }) => {
  const icon = (
    <span
      className="flex h-full w-full items-center justify-center rounded-full"
      style={record.category.backgroundColor
        ? {
            backgroundColor: record.category.backgroundColor,
            color: getCategoryIconForegroundColor(record.category.backgroundColor),
          }
        : undefined}
    >
      <CategoryIcon categoryName={record.category.name} iconKey={record.category.icon} iconType={record.category.iconType} textIconEnabled={record.category.textIconEnabled} textIconIndex={record.category.textIconIndex} size={20} />
    </span>
  );
  const content = (
    <RecordLine
      amount={`${record.type === 'sub' ? '-' : ''}${record.amount}`}
      icon={icon}
      isLast={index === lastIndex}
      title={getRecordDisplayTitle(record.remark, record.category.name)}
    />
  );

  if (!onClick)
    return <div className={classNames('text-base', className)}>{content}</div>;

  return (
    <button className={classNames('w-full border-0 bg-transparent p-0 text-left text-base', className)} onClick={onClick} type="button">
      {content}
    </button>
  );
});

export default RecordListItem;

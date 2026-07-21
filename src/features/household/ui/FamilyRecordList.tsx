import type { FC } from 'react';
import type { FamilyRecord } from '@/entities/household';
import { FamilyRecordPolicy } from '@/entities/household';
import { getDisplayName, toMoney } from '../model';

interface FamilyRecordListProps {
  countedLabel: string;
  emptyLabel: string;
  inheritedLabel: string;
  memberLabel: (name: string) => string;
  onSelect?: (record: FamilyRecord) => void;
  privateLabel: string;
  records: FamilyRecord[];
  uncountedLabel: string;
}

function getPolicyLabel(
  record: FamilyRecord,
  labels: Pick<FamilyRecordListProps, 'countedLabel' | 'inheritedLabel' | 'privateLabel' | 'uncountedLabel'>,
) {
  if (record.policy === FamilyRecordPolicy.INHERIT)
    return labels.inheritedLabel;
  if (record.policy === FamilyRecordPolicy.PRIVATE)
    return labels.privateLabel;
  return record.counted ? labels.countedLabel : labels.uncountedLabel;
}

export const FamilyRecordList: FC<FamilyRecordListProps> = ({
  countedLabel,
  emptyLabel,
  inheritedLabel,
  memberLabel,
  onSelect,
  privateLabel,
  records,
  uncountedLabel,
}) => {
  if (!records.length) {
    return <div className="card-rounded bg-white px-4 py-12 text-center text-sm text-font-gray">{emptyLabel}</div>;
  }

  const labels = { countedLabel, inheritedLabel, privateLabel, uncountedLabel };
  return (
    <div className="overflow-hidden rounded-xl bg-white">
      {records.map((record, index) => {
        const content = (
          <>
            <span className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-gray text-base">
              {record.category?.icon || record.category?.name?.slice(0, 1) || '￥'}
            </span>
            <span className="min-w-0 flex-grow">
              <span className="one-line block text-sm font-medium text-font-black">
                {record.remark || record.category?.name || '—'}
              </span>
              <span className="mt-1 block text-xs text-font-gray">
                {memberLabel(getDisplayName(record.creator))}
                {record.tags.length > 0 ? ` · ${record.tags.map(tag => `#${tag.name}`).join(' ')}` : ''}
              </span>
              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-font-gray">
                {getPolicyLabel(record, labels)}
              </span>
            </span>
            <span className={record.type === 'add' ? 'text-emerald-600' : 'text-rose-500'}>
              {record.type === 'add' ? '+' : '-'}
              {toMoney(record.amount)}
            </span>
          </>
        );

        const className = `flex min-h-[76px] w-full items-center border-0 bg-white px-3 py-2 text-left ${index > 0 ? 'border-t border-solid border-[#EBEBEB]' : ''}`;
        return onSelect
          ? (
              <button
                className={`${className} active:bg-slate-50`}
                data-record-id={record.id}
                key={record.id}
                onClick={() => onSelect(record)}
                type="button"
              >
                {content}
              </button>
            )
          : (
              <div className={className} data-record-id={record.id} key={record.id}>{content}</div>
            );
      })}
    </div>
  );
};

import type { FC } from 'react';
import c from 'classnames';
import { Fragment } from 'react';
import { FixedPin, Icon, NavBar } from '@/shared/ui';
import styles from './RecordDetailPresentation.module.scss';

export interface RecordDetailRow {
  label: string;
  value: string;
}

export interface RecordDetailAction {
  label: string;
  onClick: () => void;
  testId?: string;
}

export interface RecordDetailPresentationProps {
  backLabel: string;
  category: {
    icon: string;
    name: string;
  };
  footerActions?: readonly RecordDetailAction[];
  onBack: () => void;
  pinnedAction?: RecordDetailAction;
  rows: readonly RecordDetailRow[];
  supplementaryRows?: readonly RecordDetailRow[];
}

export const RecordDetailPresentation: FC<RecordDetailPresentationProps> = ({
  backLabel,
  category,
  footerActions = [],
  onBack,
  pinnedAction,
  rows,
  supplementaryRows = [],
}) => {
  const detailRows = [...rows, ...supplementaryRows];

  return (
    <div className="page" data-record-detail-presentation>
      <NavBar back={backLabel} backArrow={false} onBack={onBack} />
      <div className={styles.top}>
        <div className={styles.main}>
          <div className={c(styles.icon, 'flex justify-center items-center')} data-category-icon={category.icon}>
            <Icon className="text-[36px]" name={category.icon} />
          </div>
          <span>{category.name}</span>
        </div>
      </div>
      <div className={styles.list}>
        {detailRows.map(item => (
          <div className={c(styles.listItem, 'py-[20px] px-[15px]')} key={item.label}>
            <span className="flex-shrink-0">{item.label}</span>
            <span className={c(styles.listKeys, 'ml-[12px]')}>
              {item.value}
            </span>
          </div>
        ))}
        {pinnedAction && (
          <FixedPin onClick={pinnedAction.onClick}>{pinnedAction.label}</FixedPin>
        )}
      </div>
      {footerActions.length > 0 && (
        <div className={styles.footer} data-record-detail-footer>
          <div className={styles.main}>
            {footerActions.map((action, index) => (
              <Fragment key={action.label}>
                <button data-testid={action.testId} type="button" onClick={action.onClick}>
                  {action.label}
                </button>
                {index < footerActions.length - 1 && <span />}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

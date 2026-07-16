import type { FC } from 'react';
import classNames from 'classnames';
import { useTranslation } from '@/shared/i18n';
import './check-info.scss';

interface CheckInfoProps {
  data?: {
    checkInKeep?: number;
    checkInAll?: number;
    recordCount?: number;
  };
  className?: string;
}

const defaultProps = {
  data: {
    checkInKeep: 0,
    checkInAll: 0,
    recordCount: 0,
  },
};

const CheckInfo: FC<CheckInfoProps> = (p) => {
  const { t } = useTranslation('user');
  const props = Object.assign({ ...defaultProps }, p);
  return (
    <div className={classNames('middle flex w-full', props.className)}>
      <div className="grow flex flex-col justify-center items-center">
        <span className="font-bold">{props.data?.checkInKeep || 0}</span>
        <p>{t('checkIn.keep')}</p>
      </div>
      <div className="grow flex flex-col justify-center items-center">
        <span className="font-bold">{props.data?.checkInAll || 0}</span>
        <p>{t('checkIn.allDays')}</p>
      </div>
      <div className="grow flex flex-col justify-center items-center">
        <span className="font-bold">{props.data?.recordCount || 0}</span>
        <p>{t('checkIn.recordCount')}</p>
      </div>
    </div>
  );
};

export default CheckInfo;

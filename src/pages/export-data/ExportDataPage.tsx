import { DatePicker, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecordApi } from '@/entities/record';
import { exportData } from '@/shared/lib/export-data';
import { Button, Gap, List, NavBar } from '@/shared/ui';
import { useTranslation } from '@/shared/i18n';
import styles from './index.module.scss';

enum ChangeType {
  START,
  END,
}
function ExportData() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [exportTimeRange, setExportTimeRange] = useState({
    startTime: '',
    endTime: '',
  });

  const handleExportData = async () => {
    const { startTime, endTime } = exportTimeRange;
    const res = await getRecordApi({
      startDate: startTime,
      endDate: endTime,
    });

    if (res.statusCode !== 200) {
      return Toast.show(res.message);
    }

    exportData(res.data.data);

    Toast.show(t('common:export.exportSuccess'));
  };

  const init = () => {
    const endTime = dayjs().format('YYYY-MM-DD');
    const startTime = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
    setExportTimeRange({ startTime, endTime });
  };

  const handleChangeTime = async (type: ChangeType) => {
    const max = new Date();
    const { startTime, endTime } = exportTimeRange;
    const selectTime = await DatePicker.prompt({
      max,
      defaultValue: new Date(type === ChangeType.START ? startTime : endTime),
    });

    if (!selectTime)
      return;

    const setTimeValue = dayjs(selectTime).format('YYYY-MM-DD');

    switch (type) {
      case ChangeType.START:
        setExportTimeRange({
          ...exportTimeRange,
          startTime: setTimeValue,
        });
        break;
      case ChangeType.END:
        setExportTimeRange({
          ...exportTimeRange,
          endTime: setTimeValue,
        });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="page">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('common:export.title')}
      </NavBar>
      <div className={styles.wrapper}>
        <Gap />
        <List>
          <List.Item
            extra={exportTimeRange.startTime || t('common:placeholder.selectStartTime')}
            onClick={() => handleChangeTime(ChangeType.START)}
            clickable
          >
            {t('common:export.startTime')}
          </List.Item>
          <List.Item
            extra={exportTimeRange.endTime || t('common:placeholder.selectEndTime')}
            onClick={() => handleChangeTime(ChangeType.END)}
            clickable
          >
            {t('common:export.endTime')}
          </List.Item>
        </List>
        <Gap height={92} />
        <div style={{ padding: '0 32px' }}>
          <Button block onClick={() => handleExportData()}>
            {t('common:action.export')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ExportData;

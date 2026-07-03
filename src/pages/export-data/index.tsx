import { DatePicker, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecordApi } from '@/api';
import { exportRecordData } from '@/shared/lib/export-data';
import { Button, Gap, List, NavBar } from '@/shared/ui';
import styles from './index.module.scss';

enum ChangeType {
  START,
  END,
}
function ExportData() {
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

    exportRecordData({
      data: res.data.data,
      range: exportTimeRange,
      expend: res.data.expend,
      income: res.data.income,
    });

    Toast.show('导出成功');
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
      <NavBar back="返回" onBack={() => navigate(-1)}>
        导出数据
      </NavBar>
      <div className={styles.wrapper}>
        <Gap />
        <List>
          <List.Item
            extra={exportTimeRange.startTime || '请选择开始时间'}
            onClick={() => handleChangeTime(ChangeType.START)}
            clickable
          >
            开始时间
          </List.Item>
          <List.Item
            extra={exportTimeRange.endTime || '请选择结束时间'}
            onClick={() => handleChangeTime(ChangeType.END)}
            clickable
          >
            结束时间
          </List.Item>
        </List>
        <Gap height={92} />
        <div style={{ padding: '0 32px' }}>
          <Button block onClick={() => handleExportData()}>
            导出
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ExportData;

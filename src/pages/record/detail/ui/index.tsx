import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import { Space } from 'antd-mobile';
import dayjs from 'dayjs';
import { AppDatePicker } from '@/shared/ui';

interface CustomRender {
  visible1: boolean;
  change: () => void;
  changeTime: (time: string) => void;
  selectTime: Dayjs;
}

// 控制选择精度
const Precision: FC<CustomRender> = ({ visible1, change, changeTime, selectTime }) => {
  const now = dayjs().toDate();

  return (
    <Space wrap>
      <AppDatePicker
        visible={visible1}
        onClose={() => {
          change();
        }}
        value={selectTime.toDate()}
        max={now}
        precision="month"
        onConfirm={(val) => {
          changeTime(dayjs(val).format('YYYY-MM-DD'));
        }}
      />
    </Space>
  );
};

export default Precision;

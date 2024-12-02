import type { FC } from 'react';
import { DatePicker, Space } from 'antd-mobile';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

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
      <DatePicker
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

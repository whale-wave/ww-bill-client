import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { DatePicker, Space } from 'antd-mobile';
import type { Dayjs } from 'dayjs';
import { getTimedate } from '@/utils/DataTime';

interface CustomRender {
  visible1: boolean;
  change: () => void;
  changeTime: (time: string, array: Array<string>) => void;
  selectTime: Dayjs | undefined;
}

// 控制选择精度
const Precision: FC<CustomRender> = ({ visible1, change, changeTime, selectTime }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!visible1)
      return;

    setNow(new Date());
  }, [visible1]);

  return (
    <>
      <Space wrap>
        <>
          <DatePicker
            visible={visible1}
            onClose={() => {
              change();
            }}
            defaultValue={selectTime?.toDate()}
            max={now}
            precision="month"
            onConfirm={(val) => {
              const time = new Date(val);
              const time2 = getTimedate(time);
              const Y = `${val.getFullYear()}年`;
              const M
                = val.getMonth() + 1 < 10
                  ? `0${val.getMonth() + 1}`
                  : val.getMonth() + 1;
              const array = [String(Y), String(M)];
              changeTime(time2, array);
            }}
          />
        </>
      </Space>
    </>
  );
};

export default Precision;

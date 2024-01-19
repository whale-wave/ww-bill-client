import { FC, useEffect, useState } from 'react';
import { DatePicker, Space } from 'antd-mobile';
import { getTimedate } from '@/utils/DataTime';

type CustomRender = {
  visible1: boolean;
  change: () => void;
  changeTime: (time: string, array: Array<string>) => void;
};

// 控制选择精度
const Precision: FC<CustomRender> = ({ visible1, change, changeTime }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!visible1) return;

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
            defaultValue={now}
            max={now}
            precision="month"
            onConfirm={(val) => {
              const time = new Date(val);
              const time2 = getTimedate(time);
              const Y = val.getFullYear() + '年';
              const M =
                val.getMonth() + 1 < 10
                  ? '0' + (val.getMonth() + 1)
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

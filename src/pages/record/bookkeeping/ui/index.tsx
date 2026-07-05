import type { FC } from 'react';
import { DatePicker } from 'antd-mobile';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useTranslation } from '@/shared/i18n';

interface CustomRenderProps {
  valueDate: boolean;
  change: () => void;
  changeTime: (value: Date, time: number) => void;
  dateValue: Date;
  setDateValue?: (value: Date) => void;
}

// 自定义每列的渲染内容
const CustomRender: FC<CustomRenderProps> = ({ valueDate, change, changeTime, dateValue }) => {
  const { t } = useTranslation(['common', 'record']);
  const labelRenderer = useCallback((type: string, data: number) => {
    switch (type) {
      case 'year':
        return `${data}${t('common:time.year')}`;
      case 'month':
        return `${data}${t('common:time.month')}`;
      case 'day':
        return `${data}${t('common:time.day')}`;
      case 'hour':
        return `${data}${t('common:time.hour')}`;
      case 'minute':
        return `${data}${t('common:time.minute')}`;
      case 'second':
        return `${data}${t('common:time.second')}`;
      default:
        return data;
    }
  }, [t]);

  const changeDateChoice = (val: Date) => {
    // val 组件默认选择的时间
    const date = new Date(); // 当前的时间
    const Y = `${val.getFullYear()}/`;
    const M
      = `${val.getMonth() + 1 < 10
        ? `0${val.getMonth() + 1}`
        : val.getMonth() + 1}/`;
    const D = `${val.getDate() < 10 ? `0${val.getDate()}` : val.getDate()} `;
    const h = `${date.getHours()}:`;
    const m = `${date.getMinutes()}:`;
    const s = date.getSeconds();
    // Y + M + D + h + m + s 拼接的时间
    // Y + M + D 应该渲染的时间
    const getTimeValue = Y + M + D;

    // newDate 新的时间戳
    const newDate = new Date(Y + M + D + h + m + s).getTime(); // 选择的年月日和当前的选择的时候的时分秒
    changeTime(dayjs(getTimeValue).toDate(), newDate);

    // start  //显示某月某日是星期几？
    // getWeekByDay(newDate2)
    // end

    // start //获取某年某月的天数
    // getDaysInOneMonth(2022,1)
    // edn
  };

  //
  // function getDaysInOneMonth(year:number, month:number) {
  //     month = parseInt(String(month), 10);
  //     const d = new Date(year, month, 0);
  //     // console.log(d.getDate(),'天数');
  //     return d.getDate();
  // }

  return (
    <>
      <DatePicker
        title={t('record:bookkeeping.selectTime')}
        visible={valueDate}
        onClose={() => {
          change();
        }}
        value={dateValue}
        onConfirm={(val) => {
          changeDateChoice(val);
        }}
        renderLabel={labelRenderer}
      />
    </>
  );
};

export default CustomRender;

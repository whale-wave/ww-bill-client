import dayjs from 'dayjs';
import * as xlsx from 'xlsx';

export const exportData = ({
  sheetName = '蓝鲸记账',
  data = [],
  fileName = '蓝鲸记账',
}) => {
  const sheet = xlsx.utils.json_to_sheet(data);
  const workbook = { Sheets: { [sheetName]: sheet }, SheetNames: [sheetName] };
  const excelBuffer: any = xlsx.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });
  // 转成blob对象
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
  });
  // 创建一个a标签
  const href = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `${fileName}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportRecordData = ({
  data,
  range,
  expend,
  income,
}: {
  data: any;
  range: {
    startTime: string;
    endTime: string;
  };
  expend: number;
  income: number;
}) => {
  const sheet = data.map(
    ({
      id,
      remark,
      time,
      type,
      createdAt,
      updatedAt,
      amount,
      category: { id: categoryId, name: categoryName },
    }: SheetData) => ({
      记录ID: id,
      备注: remark,
      金额: amount,
      记账时间: dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
      类型: type === 'sub' ? '支出' : '收入',
      创建时间: dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss'),
      更新时间: dayjs(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      类别ID: categoryId,
      类别: categoryName,
    }),
  );

  sheet.push({
    记录ID: '总收入',
    备注: income,
  });

  sheet.push({
    记录ID: '总支出',
    备注: expend,
  });

  sheet.push({
    记录ID: '总结余',
    备注: income - expend,
  });

  exportData({
    data: sheet,
    fileName: `蓝鲸记账 - ${range.startTime}~${range.endTime}记录数据`,
    sheetName: `${range.startTime}~${range.endTime}`,
  });
};

type SheetData = {
  id: string;
  remark: string;
  time: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  amount: string;
  category: {
    id: string;
    name: string;
  };
};

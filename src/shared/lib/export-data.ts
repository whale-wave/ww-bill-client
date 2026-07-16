import dayjs from 'dayjs';
import * as xlsx from 'xlsx';
import config from '@/shared/config';
import { i18n } from '@/shared/i18n';

export interface ExportRecord {
  amount: string;
  category?: {
    id?: number;
    name?: string;
  } | null;
  createdAt: string;
  id: number;
  remark: string;
  time: string;
  type: string;
  updatedAt: string;
}

function parseTime(val: string): dayjs.Dayjs {
  const ts = Number(val);
  return !Number.isNaN(ts) ? dayjs(ts) : dayjs(val);
}

export function mapExportRecordToSheetRow(item: ExportRecord) {
  const { id, remark, amount, time, type, createdAt, updatedAt } = item;
  const { category } = item;
  const { id: cId = '', name: cName = '' } = category || {};
  return {
    [i18n.t('common:export.recordId')]: id,
    [i18n.t('common:export.remark')]: remark,
    [i18n.t('common:export.amount')]: amount,
    [i18n.t('common:export.recordTime')]: parseTime(time).format('YYYY-MM-DD HH:mm:ss'),
    [i18n.t('common:export.type')]: type === 'sub' ? i18n.t('common:export.typeExpend') : i18n.t('common:export.typeIncome'),
    [i18n.t('common:export.createdAt')]: parseTime(createdAt).format('YYYY-MM-DD HH:mm:ss'),
    [i18n.t('common:export.updatedAt')]: parseTime(updatedAt).format('YYYY-MM-DD HH:mm:ss'),
    [i18n.t('common:export.categoryId')]: cId,
    [i18n.t('common:export.category')]: cName,
  };
}

export function exportData(data: readonly ExportRecord[]) {
  if (data.length > 0) {
    const sheetData = data.map(mapExportRecordToSheetRow);

    const sheet = xlsx.utils.json_to_sheet(sheetData);
    const { totalIncome, totalExpend } = data.reduce(
      (prev, next) => {
        if (next.type === 'add') {
          prev.totalIncome += Number(next.amount);
        }
        else if (next.type === 'sub') {
          prev.totalExpend += Number(next.amount);
        }
        return prev;
      },
      { totalIncome: 0, totalExpend: 0 },
    );
    const surplus = totalIncome - totalExpend;

    const extraData = [
      [i18n.t('common:export.totalIncome'), totalIncome, i18n.t('common:export.totalExpense'), totalExpend, i18n.t('common:export.totalSurplus'), surplus],
    ];
    xlsx.utils.sheet_add_aoa(sheet, extraData, { origin: -1 });
    const book = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(book, sheet, 'Sheet1');

    const appName = config.appName;
    const startTime = parseTime(data[0].createdAt).format('YYYY-MM-DD');
    const endTime = parseTime(data[data.length - 1].createdAt).format('YYYY-MM-DD');
    const fileName = i18n.t('common:export.fileName', { appName, startTime, endTime });
    xlsx.writeFile(book, fileName, { bookType: 'xlsx' });
  }
}

export default exportData;

import type { ShareData } from '@/pages/Share/ShareCanvas';
import { ErrorBlock, Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import html2canvas from 'html2canvas';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { NavBar } from '@/components/ui/index.ts';
import config from '@/config';
import ShareBtn from '@/pages/Share/ShareBtn';
import ShareCanvas from '@/pages/Share/ShareCanvas';
import { downloadCanvas } from '@/utils';

type ShareSource = Record<string, unknown>;

function isObject(value: unknown): value is ShareSource {
  return typeof value === 'object' && value !== null;
}

function readString(source: ShareSource | undefined, keys: string[]) {
  if (!source)
    return '';

  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' || typeof value === 'number')
      return String(value).trim();
  }

  return '';
}

function normalizeType(value: string): ShareData['type'] | '' {
  if (value === 'sub' || value === '支出')
    return 'sub';

  if (value === 'add' || value === '收入')
    return 'add';

  return '';
}

function formatDateText(value: string) {
  if (!value)
    return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    return value;

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}年${month}月${day}日`;
}

function getSourceFromState(state: unknown): ShareSource | undefined {
  if (!isObject(state))
    return undefined;

  if (isObject(state.record))
    return state.record;

  if (isObject(state.shareData))
    return state.shareData;

  return state;
}

function normalizeShareData(source: ShareSource | undefined): ShareData | null {
  const category = isObject(source?.category) ? source.category : undefined;
  const amount = readString(source, ['amount', 'money']);
  const type = normalizeType(readString(source, ['type']));
  const categoryName = readString(source, ['categoryName', 'category', 'typeName'])
    || readString(category, ['name']);
  const remark = readString(source, ['remark', 'desc', 'description']);
  const dateText = readString(source, ['dateText'])
    || formatDateText(readString(source, ['time', 'date']));

  if (!amount || !type || !categoryName)
    return null;

  return {
    amount,
    type,
    categoryName,
    remark,
    dateText: dateText || '未记录日期',
  };
}

function getSourceFromSearchParams(searchParams: URLSearchParams): ShareSource {
  return {
    amount: searchParams.get('amount') || '',
    type: searchParams.get('type') || '',
    categoryName: searchParams.get('categoryName')
      || searchParams.get('category')
      || '',
    remark: searchParams.get('remark') || '',
    dateText: searchParams.get('dateText') || '',
    time: searchParams.get('time') || searchParams.get('date') || '',
  };
}

function buildShareUrl(data: ShareData) {
  const params = new URLSearchParams({
    amount: data.amount,
    type: data.type,
    categoryName: data.categoryName,
    dateText: data.dateText,
  });

  if (data.remark)
    params.set('remark', data.remark);

  return `${window.location.origin}${window.location.pathname}#/share?${params.toString()}`;
}

function isShareCancelError(error: unknown) {
  if (!(error instanceof Error))
    return false;

  return error.name === 'AbortError'
    || error.name === 'NotAllowedError'
    || error.message.includes('AbortError')
    || error.message.includes('cancel');
}

function Share() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLDivElement>(null);

  const shareData = useMemo(() => {
    return normalizeShareData(getSourceFromState(location.state))
      || normalizeShareData(getSourceFromSearchParams(searchParams));
  }, [location.state, searchParams]);

  const saveCanvas = async () => {
    if (!canvasRef.current) {
      Toast.show({ content: '暂无可保存的分享图', icon: 'fail' });
      return;
    }

    try {
      const canvas = await html2canvas(canvasRef.current);
      downloadCanvas(canvas);
      Toast.show({ content: '图片已保存', icon: 'success' });
    }
    catch {
      Toast.show({ content: '保存图片失败，请稍后重试', icon: 'fail' });
    }
  };

  const onShare = async () => {
    const title = `${config.appName}账单分享`;
    const text = shareData
      ? `${shareData.dateText} ${shareData.categoryName} ${shareData.type === 'add' ? '收入' : '支出'} ${shareData.amount}`
      : `${config.appName}账单分享`;
    const url = shareData ? buildShareUrl(shareData) : window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        Toast.show({ content: '分享成功', icon: 'success' });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        Toast.show({ content: '链接已复制', icon: 'success' });
        return;
      }

      if (copy(url)) {
        Toast.show({ content: '链接已复制', icon: 'success' });
        return;
      }

      Toast.show({ content: '当前环境不支持分享或复制', icon: 'fail' });
    }
    catch (error) {
      if (isShareCancelError(error)) {
        Toast.show({ content: '已取消分享' });
        return;
      }

      Toast.show({ content: '分享失败，请稍后重试', icon: 'fail' });
    }
  };

  if (!shareData) {
    return (
      <div className="page">
        <NavBar back="返回" backArrow={false} onBack={() => navigate(-1)}>
          晒单
        </NavBar>
        <div className="flex-grow flex justify-center items-center px-[24px]">
          <ErrorBlock
            status="empty"
            title="暂无可分享账单"
            description="请从账单、明细等业务入口进入分享页。"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <NavBar back="返回" backArrow={false} onBack={() => navigate(-1)}>
        晒单
      </NavBar>
      <ShareCanvas canvasRef={canvasRef} data={shareData} />
      <ShareBtn onSave={saveCanvas} onShare={onShare} />
    </div>
  );
}

export default Share;

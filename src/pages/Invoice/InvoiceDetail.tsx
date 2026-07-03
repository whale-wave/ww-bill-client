import { Button, Skeleton, Toast } from 'antd-mobile';
import copy from 'copy-to-clipboard';
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetInvoiceByIdQuery } from '@/hooks';
import EditAndDeleteButton from '@/pages/Invoice/components/EditAndDeleteButton';
import InvoiceInfo, {
  getOptionListByInvoice,
} from '@/pages/Invoice/components/InvoiceInfo';
import { NavBar } from '@/shared/ui';

interface InvoiceDetailProps {}

const InvoiceDetail: React.FC<InvoiceDetailProps> = () => {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };

  const { data: invoice, isLoading } = useGetInvoiceByIdQuery({
    params: { id },
  });

  const onBack = useCallback(() => {
    navigate(-1);
  }, []);

  const onCopyInvoiceInfo = useCallback(() => {
    if (!invoice) {
      void Toast.show({
        content: '未获取到发票信息',
      });
      return;
    }

    const list = getOptionListByInvoice(invoice);
    const text = list.map(o => `${o.label}: ${o.value}`).join('\n');

    copy(text);

    void Toast.show({
      content: '复制成功',
    });
  }, [invoice]);
  return (
    <div className="page-new">
      <NavBar onBack={onBack}>发票抬头</NavBar>
      <div className="flex-grow bg-bg-gray overflow-auto flex-col flex p-3">
        {/* eslint-disable-next-line style/multiline-ternary */}
        {isLoading || !invoice ? (
          <>
            <Skeleton.Title animated />
            <Skeleton.Paragraph animated lineCount={6} />
          </>
        ) : (
          <>
            <InvoiceInfo invoice={invoice} />
            <div className="px-[10%]">
              <Button
                color="primary"
                className="!mt-8"
                block
                onClick={onCopyInvoiceInfo}
              >
                复制信息
              </Button>
            </div>
            {/* <Button>分享好友</Button> */}
          </>
        )}
      </div>
      <EditAndDeleteButton invoiceId={invoice?.id} />
    </div>
  );
};

export default InvoiceDetail;

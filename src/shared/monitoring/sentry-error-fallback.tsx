import { Button, ErrorBlock } from 'antd-mobile';

export function SentryErrorFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div>
        <ErrorBlock status="default" title="页面暂时无法加载" description="请重新加载后再试" />
        <Button block color="primary" onClick={() => window.location.reload()}>重新加载</Button>
      </div>
    </div>
  );
}

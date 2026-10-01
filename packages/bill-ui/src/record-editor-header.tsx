import type { ElementType, ReactNode } from 'react';
import './record-editor-header.scss';

export function RecordEditorHeader({ back, children, settings, primitives = { Header: 'header', Box: 'div' } }: {
  back: ReactNode;
  children: ReactNode;
  settings?: ReactNode;
  primitives?: { Header: ElementType; Box: ElementType };
}) {
  const { Header, Box } = primitives;
  return (
    <Header className="record-editor-header" data-record-editor-header>
      {back}
      <Box className="bill-record-types">{children}</Box>
      {settings ?? <Box className="bill-record-header-placeholder" />}
    </Header>
  );
}

import type { ElementType, ReactNode } from 'react';
import './auth-controls.scss';

export function AuthFieldsVisual({ children, primitive: Box = 'div' }: { children: ReactNode; primitive?: ElementType }) {
  return <Box className="bill-auth-fields">{children}</Box>;
}

export function AuthPrimaryActionContent({ children, loading, loadingLabel, primitive: Box = 'span' }: { children: ReactNode; loading?: boolean; loadingLabel?: ReactNode; primitive?: ElementType }) {
  return (
    <>
      {loading && <Box aria-hidden="true" className="bill-auth-primary-action__spinner" />}
      {loading ? loadingLabel ?? children : children}
    </>
  );
}

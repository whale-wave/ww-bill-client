import type { ElementType, ReactNode } from 'react';
import './record-keypad.scss';

export function RecordKeypadLayout({ actions, className = '', keys, keysHidden = false, primitives = { Root: 'section', Box: 'div' } }: {
  actions: ReactNode;
  className?: string;
  keys: ReactNode;
  keysHidden?: boolean;
  primitives?: { Root: ElementType; Box: ElementType };
}) {
  const { Root, Box } = primitives;
  return (
    <Root className={`record-editor-keypad shrink-0 border-t border-solid px-4 ${className}`} data-record-editor-keypad>
      <Box className="record-editor-keypad__actions grid grid-cols-3 gap-[var(--record-editor-keypad-gap)]">{actions}</Box>
      <Box aria-hidden={keysHidden} className={`record-editor-keypad__keys grid grid-cols-3${keysHidden ? ' pointer-events-none invisible' : ''}`} data-record-editor-numeric-keys>{keys}</Box>
    </Root>
  );
}

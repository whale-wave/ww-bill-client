import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');
const activeBoundaries: symbol[] = [];

interface DialogFocusBoundaryProps {
  children: ReactNode;
  describedBy?: string;
  label?: string;
  labelledBy?: string;
  onEscape?: () => void;
}

/** Provides modal semantics, focus containment, and focus restoration. */
export function DialogFocusBoundary({ children, describedBy, label, labelledBy, onEscape }: DialogFocusBoundaryProps) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const boundaryIdRef = useRef(Symbol('dialog-boundary'));
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    const boundary = boundaryRef.current;
    if (!boundary)
      return;
    const boundaryId = boundaryIdRef.current;
    activeBoundaries.push(boundaryId);
    const isTopmost = () => activeBoundaries.at(-1) === boundaryId;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const appRoot = document.getElementById('root');
    const appRootWasInert = appRoot?.hasAttribute('inert') ?? false;
    appRoot?.setAttribute('inert', '');

    const focusableElements = () => Array.from(boundary.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const focusFirst = () => (focusableElements()[0] ?? boundary).focus();
    queueMicrotask(focusFirst);

    const handleFocusIn = (event: FocusEvent) => {
      if (isTopmost() && event.target instanceof Node && !boundary.contains(event.target))
        focusFirst();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopmost())
        return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscapeRef.current?.();
        return;
      }
      if (event.key !== 'Tab')
        return;
      const focusable = focusableElements();
      if (!focusable.length) {
        event.preventDefault();
        boundary.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === boundary)) {
        event.preventDefault();
        last?.focus();
      }
      else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      const boundaryIndex = activeBoundaries.indexOf(boundaryId);
      if (boundaryIndex >= 0)
        activeBoundaries.splice(boundaryIndex, 1);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleKeyDown);
      if (!appRootWasInert)
        appRoot?.removeAttribute('inert');
      if (previousFocus?.isConnected)
        previousFocus.focus();
    };
  }, []);

  return (
    <div aria-describedby={describedBy} aria-label={label ?? (labelledBy ? undefined : '对话框')} aria-labelledby={labelledBy} aria-modal="true" ref={boundaryRef} role="dialog" tabIndex={-1}>
      {children}
    </div>
  );
}

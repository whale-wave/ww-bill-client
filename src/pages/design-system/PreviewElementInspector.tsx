import type { StudioToken } from './token-registry';
import { useEffect, useRef } from 'react';

export interface StudioInspectorSelection {
  label: string;
  tokenNames: string[];
}

interface PreviewElementInspectorProps {
  enabled: boolean;
  onExit: () => void;
  onSelect: (selection: StudioInspectorSelection) => void;
  tokens: readonly StudioToken[];
}

const visualProperties = new Set([
  'background',
  'background-color',
  'background-image',
  'backdrop-filter',
  'border',
  'border-color',
  'border-radius',
  'box-shadow',
  'color',
  'fill',
  'filter',
  'font-size',
  'gap',
  'height',
  'line-height',
  'margin',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'margin-top',
  'max-height',
  'min-height',
  'outline',
  'outline-color',
  'padding',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'stroke',
  'width',
]);

const inheritedVisualProperties = new Set(['color', 'fill', 'font-size', 'line-height', 'stroke']);
const variableReferencePattern = /var\(\s*(--ww-[\w-]+)/g;

function getVariableReferences(value: string): string[] {
  return [...value.matchAll(variableReferencePattern)].map(match => match[1]);
}

function collectRuleStyles(ruleList: CSSRuleList, element: Element, styles: CSSStyleDeclaration[]) {
  Array.from(ruleList).forEach((rule) => {
    if (rule instanceof CSSStyleRule) {
      try {
        if (element.matches(rule.selectorText))
          styles.push(rule.style);
      }
      catch {
        // A browser may expose selectors that Element#matches cannot evaluate.
      }
      return;
    }
    if ('cssRules' in rule) {
      try {
        collectRuleStyles((rule as CSSGroupingRule).cssRules, element, styles);
      }
      catch {
        // Ignore inaccessible nested stylesheet rules and keep inspecting the rest.
      }
    }
  });
}

function getMatchedStyles(element: Element): CSSStyleDeclaration[] {
  const styles: CSSStyleDeclaration[] = [];
  Array.from(document.styleSheets).forEach((styleSheet) => {
    try {
      collectRuleStyles(styleSheet.cssRules, element, styles);
    }
    catch {
      // Third-party stylesheets can be unreadable; the studio only needs its local rules.
    }
  });
  if (element instanceof HTMLElement && element.style.length)
    styles.push(element.style);
  return styles;
}

function getElementLabel(element: Element): string {
  const labelledAncestor = element.closest('[aria-label], [title]');
  const ariaLabel = labelledAncestor?.getAttribute('aria-label')?.trim() ?? element.getAttribute('aria-label')?.trim();
  if (ariaLabel)
    return ariaLabel;
  const title = labelledAncestor?.getAttribute('title')?.trim() ?? element.getAttribute('title')?.trim();
  if (title)
    return title;
  const text = (element.textContent || element.closest('button')?.textContent)?.replace(/\s+/g, ' ').trim();
  if (text)
    return text.slice(0, 24);
  return element.tagName.toLowerCase();
}

function isInspectableElement(value: EventTarget | null): value is Element {
  return value instanceof Element
    && !value.closest('[data-design-studio-inspector-layer]')
    && !['BODY', 'HTML', 'SCRIPT', 'STYLE'].includes(value.tagName);
}

function updateOutline(outline: HTMLDivElement | null, element: Element | null) {
  if (!outline)
    return;
  if (!element) {
    outline.hidden = true;
    return;
  }
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    outline.hidden = true;
    return;
  }
  outline.hidden = false;
  outline.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
  outline.style.width = `${rect.width}px`;
  outline.style.height = `${rect.height}px`;
}

function getRelevantTokenNames(element: Element, tokens: readonly StudioToken[]): string[] {
  const aliases = new Map<string, string[]>();
  tokens.forEach((token) => {
    token.dependsOn?.forEach((alias) => {
      aliases.set(alias, [...(aliases.get(alias) ?? []), token.name]);
    });
  });

  const variableDefinitions = new Map<string, string>();
  const directReferences = new Set<string>();
  const nodes = [element];
  let ancestor = element.parentElement;
  while (ancestor) {
    nodes.push(ancestor);
    ancestor = ancestor.parentElement;
  }

  nodes.forEach((node, index) => {
    getMatchedStyles(node).forEach((style) => {
      Array.from(style).forEach((property) => {
        const value = style.getPropertyValue(property);
        if (property.startsWith('--')) {
          if (!variableDefinitions.has(property))
            variableDefinitions.set(property, value);
          return;
        }
        if ((index === 0 ? visualProperties : inheritedVisualProperties).has(property))
          getVariableReferences(value).forEach(reference => directReferences.add(reference));
      });
    });
  });

  const resolved = new Set<string>();
  const visit = (name: string) => {
    if (resolved.has(name))
      return;
    resolved.add(name);
    aliases.get(name)?.forEach(alias => resolved.add(alias));
    getVariableReferences(variableDefinitions.get(name) ?? '').forEach(visit);
  };
  directReferences.forEach(visit);
  return tokens.filter(token => resolved.has(token.name)).map(token => token.name);
}

export function PreviewElementInspector({ enabled, onExit, onSelect, tokens }: PreviewElementInspectorProps) {
  const hoverOutlineRef = useRef<HTMLDivElement>(null);
  const selectedOutlineRef = useRef<HTMLDivElement>(null);
  const selectedElementRef = useRef<Element | null>(null);

  useEffect(() => {
    const hoverOutline = hoverOutlineRef.current;
    const selectedOutline = selectedOutlineRef.current;
    if (!enabled || !hoverOutline || !selectedOutline) {
      updateOutline(hoverOutline, null);
      updateOutline(selectedOutline, null);
      selectedElementRef.current = null;
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      updateOutline(hoverOutline, isInspectableElement(event.target) ? event.target : null);
    };
    const handleClick = (event: MouseEvent) => {
      if (!isInspectableElement(event.target))
        return;
      event.preventDefault();
      event.stopPropagation();
      selectedElementRef.current = event.target;
      updateOutline(selectedOutline, event.target);
      onSelect({ label: getElementLabel(event.target), tokenNames: getRelevantTokenNames(event.target, tokens) });
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape')
        onExit();
    };
    const refreshSelectedOutline = () => updateOutline(selectedOutline, selectedElementRef.current);
    document.addEventListener('pointermove', handlePointerMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('resize', refreshSelectedOutline);
    window.addEventListener('scroll', refreshSelectedOutline, true);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('resize', refreshSelectedOutline);
      window.removeEventListener('scroll', refreshSelectedOutline, true);
    };
  }, [enabled, onExit, onSelect, tokens]);

  return (
    <>
      <div aria-hidden className="design-studio__inspect-outline" data-design-studio-inspector-layer hidden ref={hoverOutlineRef} />
      <div aria-hidden className="design-studio__inspect-outline design-studio__inspect-outline--selected" data-design-studio-inspector-layer hidden ref={selectedOutlineRef} />
    </>
  );
}

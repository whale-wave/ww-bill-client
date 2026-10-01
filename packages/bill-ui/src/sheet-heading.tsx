import type { ElementType, ReactNode } from 'react';
import './sheet-heading.scss';

export function SheetHeadingVisual({ title, description, icon, closeIcon, closeLabel, onClose, primitives: { Box = 'div', Header = 'header', Text = 'span', Title = 'h2', Button = 'button' } = {} }: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  closeIcon: ReactNode;
  closeLabel: string;
  onClose: () => void;
  primitives?: { Box?: ElementType; Header?: ElementType; Text?: ElementType; Title?: ElementType; Button?: ElementType };
}) {
  return (
    <Header className="ww-sheet-header bill-sheet-heading">
      {icon && <Box className="ww-sheet-header__icon bill-sheet-heading__icon">{icon}</Box>}
      <Box className="bill-sheet-heading__content">
        <Title className="bill-sheet-heading__title">{title}</Title>
        {description && <Text className="bill-sheet-heading__description">{description}</Text>}
      </Box>
      <Button type="button" aria-label={closeLabel} className="ww-sheet-header__close bill-sheet-heading__close" onClick={onClose}>{closeIcon}</Button>
    </Header>
  );
}

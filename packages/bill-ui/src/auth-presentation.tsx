import type { ElementType, ReactNode } from 'react';
import './auth-presentation.scss';

export function AuthPresentation({ children, controls, footer, kicker, logo, subtitle, surface, title, primitives = { Box: 'div', Header: 'header', Main: 'main', Text: 'span', Title: 'h1' } }: {
  children?: ReactNode;
  controls?: ReactNode;
  footer?: ReactNode;
  kicker?: ReactNode;
  logo: ReactNode;
  subtitle?: ReactNode;
  surface: ReactNode;
  title: ReactNode;
  primitives?: { Box: ElementType; Header: ElementType; Main: ElementType; Text: ElementType; Title: ElementType };
}) {
  const { Box, Header, Main, Text, Title } = primitives;
  return (
    <Box className="bill-auth">
      <Box aria-hidden="true" className="bill-auth__glow bill-auth__glow--blue" />
      <Box aria-hidden="true" className="bill-auth__glow bill-auth__glow--pink" />
      <Header className="bill-auth__header">{controls}</Header>
      <Main className="bill-auth__main">
        <Box className="bill-auth__content">
          <Box className="bill-auth__brand">
            <Box className="bill-auth__logo">{logo}</Box>
            <Box className="bill-auth__heading">
              <Box className="bill-auth__title-row">
                <Title className="bill-auth__title">{title}</Title>
                {kicker && <Text className="bill-auth__kicker">{kicker}</Text>}
              </Box>
              {subtitle && <Text className="bill-auth__subtitle">{subtitle}</Text>}
            </Box>
          </Box>
          {surface}
          {children}
          {footer && <Box className="bill-auth__footer">{footer}</Box>}
        </Box>
      </Main>
    </Box>
  );
}

export function FormFieldVisual({ children, className = '', error, inputId, label, prefix, suffix, primitives = { Label: 'label', Box: 'div', Text: 'span' }, disabled }: {
  children: ReactNode;
  className?: string;
  error?: ReactNode;
  inputId?: string;
  label: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  disabled?: boolean;
  primitives?: { Label: ElementType; Box: ElementType; Text: ElementType };
}) {
  const { Label, Box, Text } = primitives;
  return (
    <Label className={`bill-form-field ${className}`} htmlFor={inputId}>
      <Text className="bill-form-field__label">{label}</Text>
      <Box className={`ww-field-frame bill-form-field__frame${disabled ? ' bill-form-field__frame--disabled' : ''}${error ? ' bill-form-field__frame--error' : ''}`}>
        {prefix && <Box className="bill-form-field__prefix">{prefix}</Box>}
        {children}
        {suffix && <Box className="bill-form-field__suffix">{suffix}</Box>}
      </Box>
      {error && <Text className="bill-form-field__error" id={inputId ? `${inputId}-error` : undefined} role="alert">{error}</Text>}
    </Label>
  );
}

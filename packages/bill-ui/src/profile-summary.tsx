import type { ElementType, ReactNode } from 'react';
import './profile-summary.scss';

export function ProfileSummaryVisual({ action, avatar, metrics, name, title, primitives = { Box: 'div', Text: 'div' } }: {
  action?: ReactNode;
  avatar: ReactNode;
  metrics: ReactNode;
  name: ReactNode;
  title?: ReactNode;
  primitives?: { Box: ElementType; Text: ElementType };
}) {
  const { Box, Text } = primitives;
  return (
    <Box className="bill-profile-summary">
      <Box className="bill-profile-summary__identity">
        {avatar}
        <Box className="bill-profile-summary__details">
          <Text className="bill-profile-summary__name">{name}</Text>
          {title && <Box className="bill-profile-summary__title">{title}</Box>}
          {action && <Box className="bill-profile-summary__action">{action}</Box>}
        </Box>
      </Box>
      <Box className="ww-user-summary-metrics bill-profile-summary__metrics">{metrics}</Box>
    </Box>
  );
}

export function ProfileTitleContent({ icon, label, primitive: Text = 'span' }: { icon: ReactNode; label: ReactNode; primitive?: ElementType }) {
  return (
    <>
      {icon}
      <Text className="bill-profile-summary__title-text">{label}</Text>
    </>
  );
}

export function ProfileCheckInVisual({ children, icon, interactive = false, disabled = false, busy = false, onClick, primitive: Root = 'span' }: {
  children: ReactNode;
  icon: ReactNode;
  interactive?: boolean;
  disabled?: boolean;
  busy?: boolean;
  onClick?: () => void;
  primitive?: ElementType;
}) {
  return (
    <Root className={`ww-profile-check-in bill-profile-check-in${interactive ? ' bill-profile-check-in--interactive' : ''}${disabled ? ' bill-profile-check-in--disabled' : ''}`} type={interactive && Root === 'button' ? 'button' : undefined} aria-busy={busy} disabled={interactive ? disabled : undefined} onClick={onClick}>
      {icon}
      {children}
    </Root>
  );
}

export function ProfileAvatarVisual({ avatar, badge, label, onClick, primitives = {} }: {
  avatar: ReactNode;
  badge?: ReactNode;
  label?: string;
  onClick?: () => void;
  primitives?: { Root?: ElementType; Box?: ElementType };
}) {
  const { Root = 'button', Box = 'span' } = primitives;
  return (
    <Root className="ww-user-summary-avatar bill-profile-summary__avatar" type={Root === 'button' ? 'button' : undefined} aria-label={label} onClick={onClick}>
      <Box className="bill-profile-summary__avatar-content">{avatar}</Box>
      {badge && <Box className="ww-user-summary-edit bill-profile-summary__avatar-badge">{badge}</Box>}
    </Root>
  );
}

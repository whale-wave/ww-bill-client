import type { CSSProperties, FC, ReactNode } from 'react';
import classNames from 'classnames';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../icon';

const classPrefix = `bwm-nav-bar`;

export interface NavBarProps {
  back?: string | null;
  backArrow?: boolean | ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  onBack?: () => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const NavBar: FC<NavBarProps> = ({
  back = '',
  backArrow = true,
  children,
  className,
  left,
  onBack,
  right,
  style,
}) => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  }, [navigate, onBack]);

  return (
    <div className={classNames(classPrefix, className)} style={style}>
      <div className={`${classPrefix}-left`} role="button">
        {back !== null && (
          <div className={`${classPrefix}-back`} onClick={handleBack}>
            {backArrow && (
              <span className={`${classPrefix}-back-arrow`}>
                {backArrow === true ? <Icon name="left" /> : backArrow}
              </span>
            )}
            <span aria-hidden="true">{back}</span>
          </div>
        )}
        {left}
      </div>
      <div className={`${classPrefix}-title`}>{children}</div>
      <div className={`${classPrefix}-right`}>{right}</div>
    </div>
  );
};

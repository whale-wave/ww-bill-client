import type { CSSProperties, FC } from 'react';
import classNames from 'classnames';

const classPrefix = 'bwm-icon';

interface IconProps {
  className?: string;
  name: string;
  block?: boolean;
  style?: CSSProperties;
}

const defaultProps = {
  block: false,
};

export const Icon: FC<IconProps> = (p) => {
  const { name, className, block, style } = Object.assign({ ...defaultProps }, p);
  return (
    <svg
      className={classNames('icon', classPrefix, className, {
        [`${classPrefix}-block`]: block,
      })}
      style={style}
      aria-hidden="true"
    >
      <use xlinkHref={`#icon-${name}`} />
    </svg>
  );
};

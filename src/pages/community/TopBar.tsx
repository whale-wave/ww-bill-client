import type { FC } from 'react';
import classNames from 'classnames';
import styles from './TopBar.module.scss';

interface TabData {
  name: string;
  onClick: () => void;
  [key: string]: string | ((...args: unknown[]) => void);
}

interface TopBarProps {
  data: TabData[];
  index: number;
  onChange: (index: number) => void;
}

const TopBar: FC<TopBarProps> = ({ data, index, onChange }) => {
  return (
    <div className={classNames(styles.wrapper, 'flex items-center')}>
      {data.map((tab, i) => (
        <div
          key={tab.name}
          className={classNames(
            styles.title,
            index === i && styles.active,
            'flex items-center justify-center h-full relative',
          )}
          onClick={() => onChange(i)}
        >
          {tab.name}
        </div>
      ))}
    </div>
  );
};

export default TopBar;

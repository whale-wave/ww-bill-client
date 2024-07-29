import React from 'react';
import classNames from 'classnames';

export interface BottomActionActionItem {
  key: string | number;
  label?: string;
  onClick?: () => void;
  render?: (actionItem: BottomActionActionItem) => React.ReactNode;
}

interface BottomActionProps {
  className?: string;
  actions: BottomActionActionItem[];
  placeholderClassName?: string;
}

const BottomAction: React.FC<BottomActionProps> = (props) => {
  const { className, actions, placeholderClassName } = props;
  return (
    <>
      <div className={classNames(placeholderClassName, 'flex-shrink-0')}></div>
      <div
        className={classNames(className, 'fixed w-full bottom-0 left-0 flex bg-white')}
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-white shadow-md" style={{ transform: 'rotate(180deg)' }}></div>
        {actions.map((actionItem, index) => (
          <React.Fragment key={actionItem.key}>
            <div
              className="flex-grow flex flex-shrink-0 justify-center items-center"
              onClick={actionItem?.onClick}
            >
              {actionItem.render
                ? (
                    actionItem.render(actionItem)
                  )
                : (
                  <div>{actionItem.label}</div>
                  )}
            </div>
            {index < actions.length - 1 && (
              <div className="w-[1px] h-[50%] bg-bg-gray"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

export default BottomAction;

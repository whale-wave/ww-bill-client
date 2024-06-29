import React from 'react';
import classNames from 'classnames';

export interface BottomActionActionItem {
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
        className={classNames(className, 'fixed w-full bottom-0 left-0 flex')}
      >
        {actions.map((actionItem, index) => (
          <React.Fragment key={actionItem.label}>
            <div
              className="flex-grow flex flex-shrink-0 justify-center items-center"
              onClick={actionItem?.onClick}
            >
              {actionItem.render
                ? (
                    actionItem.render(actionItem)
                  )
                : (
                  <div key={actionItem.label}>{actionItem.label}</div>
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

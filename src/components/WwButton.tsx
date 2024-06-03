import React from 'react';
import { Button } from 'antd-mobile';

interface WwButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
}

const WwButton: React.FC<WwButtonProps> = (props) => {
  const { onClick, children } = props;

  return (
    <Button
      block
      className={'!w-[80%] !rounded-[12px] !mt-10 !text-black333'}
      color="primary"
      size="large"
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default WwButton;

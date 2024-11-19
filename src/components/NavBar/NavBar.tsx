import React, { useCallback } from 'react';
import type { NavBarProps as AntdNavBarProps } from 'antd-mobile';
import { NavBar as AntdNavBar } from 'antd-mobile';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

interface NavBarProps extends AntdNavBarProps {
}

const NavBar: React.FC<NavBarProps> = (props) => {
  const navigate = useNavigate();

  const { className, children, back = '返回', onBack: _onBack, ...restProps } = props;

  const onBack = useCallback(() => {
    if (_onBack) {
      _onBack();
    }
    else {
      navigate(-1);
    }
  }, [_onBack]);

  return (
    <AntdNavBar
      className={classNames('bg-primary flex-shrink-0 fixed top-0 left-0 w-full', className)}
      back={back}
      onBack={onBack}
      {...restProps}
    >
      {children}
    </AntdNavBar>
  );
};

export default NavBar;

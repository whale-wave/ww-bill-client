import { FC, useCallback } from 'react';
import { NavBar } from 'bw-mobile';
import { useNavigate } from 'react-router-dom';
import { playSound } from '@/modules';

const ForgetPassword: FC = () => {
  const navigate = useNavigate();

  const onGoToBack = useCallback(() => {
    playSound.turnPage();
    navigate(-1);
  }, []);

  return (
    <div>
      <NavBar back="返回" onBack={onGoToBack}>
        找回密码
      </NavBar>
      <div className={'flex-grow-1 bg-[red]'}></div>
    </div>
  );
};

export default ForgetPassword;

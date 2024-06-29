import type { FC, JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/store';

interface LoginGuardProps {
  children: JSX.Element;
}

const LoginGuard: FC<LoginGuardProps> = ({ children }) => {
  const { token } = useUserStore(({ token }) => ({ token }));
  const location = useLocation();
  if (token)
    return children;
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default LoginGuard;

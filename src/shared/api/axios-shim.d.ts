import type { AuthRequestAuth, AuthRequestIdentity } from './auth-injection';
import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    authContext?: AuthRequestAuth;
    authIdentity?: AuthRequestIdentity;
    loading?: boolean;
    silent?: boolean;
  }
}

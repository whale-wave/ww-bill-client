import { api } from '../../shared/api'

interface LoginResult {
  token: string
  userInfo: { id: number; userId: string }
}

export function login(username: string, password: string) {
  return api.post<LoginResult>('/auth/login', { username, password })
}

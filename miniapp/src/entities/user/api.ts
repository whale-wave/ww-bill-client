import { api } from '../../shared/api'

export interface UserInfo {
  id: number
  userId: string
  name: string
  username: string
  email: string
  avatar: string | null
  recordCount: number
  checkIn?: boolean
  checkInAll?: number
  checkInKeep?: number
  billRecord?: {
    expend: number
    income: number
    month: number
    surplus: number
  }
}

export function getUserInfo(signal?: AbortSignal) {
  return api.get<UserInfo>('/user/userInfo', { signal })
}

export function postCheckIn() {
  return api.post<unknown>('/check_in', null)
}

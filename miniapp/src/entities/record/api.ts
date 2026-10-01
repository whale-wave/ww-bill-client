import type { RecordIndicatorSource } from '@ww-bill/bill-core'
import { api } from '../../shared/api'
import type { RecordType } from '../../shared/model/record-type'

export interface RecordEntry extends RecordIndicatorSource {
  id: number
  amount: string
  originalAmount?: string
  remark: string
  time: string
  type: RecordType
  category: {
    id: number
    name: string
    path?: string
    icon: string
    backgroundColor?: string | null
    textIconEnabled?: boolean
    textIconIndex?: number
    iconType?: 'BUILTIN' | 'IMAGE'
  }
}

export interface RecordPage {
  total: number
  data: RecordEntry[]
  expend: number
  income: number
  limit?: number
  offset?: number
}

export interface CreateRecordInput {
  amount: string
  categoryId: number
  remark: string
  time: string
  type: RecordType
}

export function getRecords(monthStart: string, offset: number, limit = 50, signal?: AbortSignal) {
  return api.get<RecordPage>('/record', {
    query: { startDate: monthStart, offset, limit },
    signal,
  })
}

export function createRecord(input: CreateRecordInput) {
  return api.post<undefined>('/record', input)
}

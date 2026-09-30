import { api } from '../../shared/api'
import type { RecordType } from '../../shared/model/record-type'

export type { RecordType } from '../../shared/model/record-type'

export interface Category {
  id: number
  name: string
  type: RecordType
  icon: string
  iconType?: 'BUILTIN' | 'IMAGE'
  parentId?: number | null
  sortOrder: number
  status: 'ACTIVE' | 'ARCHIVED'
}

interface CategoryPage {
  data: Category[]
  total: number
}

export async function getCategories(recordType: RecordType, signal?: AbortSignal) {
  const response = await api.get<CategoryPage>('/category', {
    query: { type: recordType, status: 'ACTIVE' },
    signal,
  })
  return response.data
}

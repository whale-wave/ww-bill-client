import type { RecordPage } from './api'

export function nextRecordPageOffset(lastPage: RecordPage, pages: RecordPage[]): number | undefined {
  const loaded = pages.reduce((count, page) => count + page.data.length, 0)
  return loaded < lastPage.total && lastPage.data.length > 0 ? loaded : undefined
}

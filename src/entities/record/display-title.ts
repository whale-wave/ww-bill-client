export function getRecordDisplayTitle(remark: string | null | undefined, categoryName: string): string {
  return remark?.trim() || categoryName;
}

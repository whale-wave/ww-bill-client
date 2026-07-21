export const ledgerDataKeys = {
  all: ['ledger-data'] as const,
  tagRoot: () => [...ledgerDataKeys.all, 'tag'] as const,
  tagsRoot: (ledgerId: string) => [...ledgerDataKeys.tagRoot(), ledgerId] as const,
  tags: (ledgerId: string, status: string = 'ACTIVE') => [
    ...ledgerDataKeys.tagsRoot(ledgerId),
    status,
  ] as const,
  recoveryRoot: () => [...ledgerDataKeys.all, 'recovery'] as const,
  recovery: (ledgerId: string, days = 30) => [
    ...ledgerDataKeys.recoveryRoot(),
    ledgerId,
    days,
  ] as const,
  exportRoot: () => [...ledgerDataKeys.all, 'export'] as const,
  exportsRoot: (ledgerId: string) => [...ledgerDataKeys.exportRoot(), ledgerId] as const,
  exportTask: (ledgerId: string, taskId: string) => [
    ...ledgerDataKeys.exportsRoot(ledgerId),
    taskId,
  ] as const,
};

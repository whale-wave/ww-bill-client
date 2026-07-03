export const invoiceKeys = {
  all: ['invoice'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: () => [...invoiceKeys.lists()] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

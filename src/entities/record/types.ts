export interface RecordEntry {
  amount: string;
  category: {
    createdAt: string;
    icon: string;
    id: number;
    name: string;
    updatedAt: string;
  };
  createdAt: string;
  id: number;
  remark: string;
  status?: boolean;
  time: string;
  type: 'sub' | 'add';
  updatedAt: string;
  version: number;
  ledgerId?: string;
  tags?: Array<{
    id: string;
    name: string;
    colorKey?: string;
    iconKey?: string;
    status?: 'ACTIVE' | 'ARCHIVED';
  }>;
}

/** @deprecated Use RecordEntry. Kept temporarily for existing page state types. */
export type recordChildren = RecordEntry;

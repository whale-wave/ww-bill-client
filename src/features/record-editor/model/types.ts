import type { CategoryAmountType, CategoryEntity } from '@/entities/category';
import type { PostRecordApiData, RecordEntry } from '@/entities/record';

export type RecordEditorMode = 'create' | 'edit';

export interface RecordEditorSeed {
  amount?: string;
  category?: Pick<CategoryEntity, 'icon' | 'id' | 'name' | 'type'>;
  recordType: CategoryAmountType;
  remark?: string;
  tagIds?: string[];
  time: string;
}

export type RecordDraft = PostRecordApiData;

export interface RecordEditorTag {
  id: string;
  name: string;
}

export type RecordEditorValidationError = 'amount' | 'category';

export type RecordEditorReturnContext
  = | { kind: 'history' }
    | { kind: 'personal-calendar'; selectTime: number }
    | { kind: 'custom-calendar'; ledgerId: string; selectTime: number }
    | { kind: 'custom-records'; ledgerId: string }
    | { kind: 'personal-detail'; recordId: number }
    | { kind: 'custom-detail'; ledgerId: string; recordId: number }
    | { kind: 'household-calendar'; householdId: string; selectTime: number }
    | { kind: 'household-detail'; householdId: string; recordId: number };

export interface RecordEditorLocationState {
  recordEditor: {
    initialRecord?: RecordEntry;
    returnContext: RecordEditorReturnContext;
  };
}

export function isRecordEditorLocationState(value: unknown): value is RecordEditorLocationState {
  if (typeof value !== 'object' || value === null || !('recordEditor' in value))
    return false;
  const editor = value.recordEditor;
  return typeof editor === 'object'
    && editor !== null
    && 'returnContext' in editor;
}

export function isLegacyRecordEditorState(value: unknown): value is RecordEntry {
  return typeof value === 'object'
    && value !== null
    && 'id' in value
    && 'amount' in value
    && 'category' in value
    && 'time' in value
    && 'type' in value
    && 'version' in value;
}

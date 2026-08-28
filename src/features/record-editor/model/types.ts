import type { CalculatorState } from './useCalculator';
import type { CategoryAmountType, CategoryEntity } from '@/entities/category';
import type { PostRecordApiData, RecordEntry } from '@/entities/record';

export type RecordEditorMode = 'create' | 'edit';

export interface RecordEditorSeed {
  amount?: string;
  calculator?: CalculatorState;
  category?: Pick<CategoryEntity, 'icon' | 'id' | 'name' | 'type'>;
  imageAssetId?: string | null;
  imagePreviewFile?: File;
  isTagPickerVisible?: boolean;
  shouldReconcileTags?: boolean;
  recordType: CategoryAmountType;
  remark?: string;
  tagIds?: string[];
  attachment?: NonNullable<RecordEntry['attachments']>[number];
  hasImage?: boolean;
  time: string;
}

export interface RecordEditorTagManagementState {
  draft: RecordEditorSeed;
  returnMode: 'replace';
  returnTo: {
    pathname: string;
    search: string;
    state?: unknown;
  };
}

export interface RecordEditorTagManagementLocationState {
  recordEditorTagManagement?: Pick<RecordEditorTagManagementState, 'draft'>;
}

export function readRecordEditorTagManagementNavigationState(value: unknown): RecordEditorTagManagementState | undefined {
  if (typeof value !== 'object' || value === null || !('recordEditorTagManagement' in value))
    return undefined;
  const tagManagement = value.recordEditorTagManagement;
  if (typeof tagManagement !== 'object' || tagManagement === null || !('draft' in tagManagement) || !('returnMode' in tagManagement) || !('returnTo' in tagManagement))
    return undefined;
  if (tagManagement.returnMode !== 'replace')
    return undefined;
  const returnTo = tagManagement.returnTo;
  if (typeof returnTo !== 'object' || returnTo === null || !('pathname' in returnTo) || typeof returnTo.pathname !== 'string')
    return undefined;
  return tagManagement as RecordEditorTagManagementState;
}

/** Removes a previous settings round-trip marker before creating another one. */
export function omitRecordEditorTagManagementState(value: unknown) {
  if (typeof value !== 'object' || value === null || !('recordEditorTagManagement' in value))
    return value;
  const { recordEditorTagManagement: _tagManagement, ...rest } = value as Record<string, unknown>;
  return rest;
}

export function readRecordEditorTagManagementState(value: unknown): RecordEditorTagManagementLocationState | undefined {
  if (typeof value !== 'object' || value === null || !('recordEditorTagManagement' in value))
    return undefined;
  const tagManagement = value.recordEditorTagManagement;
  if (typeof tagManagement !== 'object' || tagManagement === null || !('draft' in tagManagement))
    return undefined;
  return value as RecordEditorTagManagementLocationState;
}

export type RecordDraft = Omit<PostRecordApiData, 'imageAssetId'> & { imageAssetId?: string | null };

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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isValidSelectTime(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && !Number.isNaN(new Date(value).valueOf());
}

function isRecordEditorReturnContext(value: unknown): value is RecordEditorReturnContext {
  if (typeof value !== 'object' || value === null || !('kind' in value))
    return false;

  switch (value.kind) {
    case 'history':
      return true;
    case 'personal-calendar':
      return 'selectTime' in value && isValidSelectTime(value.selectTime);
    case 'personal-detail':
      return 'recordId' in value && isPositiveInteger(value.recordId);
    case 'custom-calendar':
      return 'ledgerId' in value
        && isNonEmptyString(value.ledgerId)
        && 'selectTime' in value
        && isValidSelectTime(value.selectTime);
    case 'custom-records':
      return 'ledgerId' in value && isNonEmptyString(value.ledgerId);
    case 'custom-detail':
      return 'ledgerId' in value
        && isNonEmptyString(value.ledgerId)
        && 'recordId' in value
        && isPositiveInteger(value.recordId);
    case 'household-calendar':
      return 'householdId' in value
        && isNonEmptyString(value.householdId)
        && 'selectTime' in value
        && isValidSelectTime(value.selectTime);
    case 'household-detail':
      return 'householdId' in value
        && isNonEmptyString(value.householdId)
        && 'recordId' in value
        && isPositiveInteger(value.recordId);
    default:
      return false;
  }
}

export function isRecordEditorLocationState(value: unknown): value is RecordEditorLocationState {
  if (typeof value !== 'object' || value === null || !('recordEditor' in value))
    return false;
  const editor = value.recordEditor;
  return typeof editor === 'object'
    && editor !== null
    && 'returnContext' in editor
    && isRecordEditorReturnContext(editor.returnContext)
    && (!('initialRecord' in editor)
      || editor.initialRecord === undefined
      || isLegacyRecordEditorState(editor.initialRecord));
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

import type { AssignableLedgerRole } from '@/entities/ledger';
import { LedgerRole } from '@/entities/ledger';

export interface JoinRequestPermissionGroup {
  descriptionKey: string;
  key: 'browse' | 'records' | 'budget' | 'ledgerManagement';
  titleKey: string;
}

const PERMISSION_GROUPS = {
  browse: {
    descriptionKey: 'requestDetail.permissions.browse.description',
    key: 'browse',
    titleKey: 'requestDetail.permissions.browse.title',
  },
  budget: {
    descriptionKey: 'requestDetail.permissions.budget.description',
    key: 'budget',
    titleKey: 'requestDetail.permissions.budget.title',
  },
  ledgerManagement: {
    descriptionKey: 'requestDetail.permissions.ledgerManagement.description',
    key: 'ledgerManagement',
    titleKey: 'requestDetail.permissions.ledgerManagement.title',
  },
  records: {
    descriptionKey: 'requestDetail.permissions.records.description',
    key: 'records',
    titleKey: 'requestDetail.permissions.records.title',
  },
} as const satisfies Record<string, JoinRequestPermissionGroup>;

const ROLE_PERMISSION_GROUPS = {
  [LedgerRole.ADMIN]: [
    PERMISSION_GROUPS.browse,
    PERMISSION_GROUPS.records,
    PERMISSION_GROUPS.budget,
    PERMISSION_GROUPS.ledgerManagement,
  ],
  [LedgerRole.BOOKKEEPER]: [
    PERMISSION_GROUPS.browse,
    PERMISSION_GROUPS.records,
  ],
  [LedgerRole.VIEWER]: [PERMISSION_GROUPS.browse],
} as const satisfies Record<AssignableLedgerRole, readonly JoinRequestPermissionGroup[]>;

export function getJoinRequestPermissionGroups(role: AssignableLedgerRole) {
  return ROLE_PERMISSION_GROUPS[role];
}

export function getJoinRequestRoleDescriptionKey(role: AssignableLedgerRole) {
  return `requestDetail.roleDescriptions.${role}` as const;
}

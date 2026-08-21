import type { FC, ReactNode } from 'react';
import type {
  LedgerInvitationPreview,
  LedgerJoinRequestStatus,
  LedgerMemberStatus,
  LedgerSummary,
  LedgerUserSummary,
} from '@/entities/ledger';
import {
  ChevronRight,
  CircleAlert,
  Inbox,
  ShieldAlert,
  TriangleAlert,
} from 'lucide-react';
import { LedgerUserAvatar, LedgerVisualIcon } from '@/entities/ledger';
import { IllustratedEmptyState, PageLoadingState } from '@/shared/ui';
import { getLedgerUserDisplayName } from './model';

interface QueryStateProps {
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  title: string;
  type: 'loading' | 'error' | 'empty' | 'permission' | 'invalid';
}

export const CollaborationQueryState: FC<QueryStateProps> = ({
  description,
  onRetry,
  retryLabel,
  title,
  type,
}) => {
  if (type === 'loading') {
    return <PageLoadingState compact label={title} testId="collaboration-loading" />;
  }

  const icon = type === 'empty'
    ? <Inbox className="text-primary-deep" size={38} strokeWidth={1.7} />
    : type === 'permission'
      ? <ShieldAlert className="text-primary-deep" size={38} strokeWidth={1.7} />
      : type === 'invalid'
        ? <CircleAlert className="text-primary-deep" size={38} strokeWidth={1.7} />
        : <TriangleAlert className="text-primary-deep" size={38} strokeWidth={1.7} />;

  return (
    <IllustratedEmptyState
      actionLabel={onRetry ? retryLabel : undefined}
      className="min-h-[360px]"
      description={description}
      icon={icon}
      onAction={onRetry}
      title={title}
    />
  );
};

export function LedgerSummaryBlock({ ledger }: { ledger: LedgerSummary }) {
  return (
    <div className="flex items-center bg-white px-4 py-4">
      <span className="mr-3 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-primary text-xl text-font-black">
        <LedgerVisualIcon iconKey={ledger.iconKey} kind={ledger.kind} templateKey={ledger.templateKey} />
      </span>
      <div className="min-w-0">
        <div className="one-line text-lg font-medium text-font-black">{ledger.name}</div>
        <div className="mt-1 text-xs text-font-gray">{ledger.id}</div>
      </div>
    </div>
  );
}

export { LedgerUserAvatar };

interface UserRowProps {
  fallback: string;
  onClick?: () => void;
  secondary?: ReactNode;
  testId?: string;
  trailing?: ReactNode;
  user: LedgerUserSummary;
}

export const LedgerUserRow: FC<UserRowProps> = ({
  fallback,
  onClick,
  secondary,
  testId,
  trailing,
  user,
}) => {
  const content = (
    <>
      <LedgerUserAvatar size={42} user={user} />
      <span className="ml-3 min-w-0 flex-grow text-left">
        <span className="one-line block text-[14px] font-black text-ww-ink">
          {getLedgerUserDisplayName(user, fallback)}
        </span>
        {secondary && <span className="mt-1 block truncate text-[11px] font-semibold text-ww-soft">{secondary}</span>}
      </span>
      {trailing}
      {onClick && <ChevronRight className="ml-2 flex-shrink-0 text-[#9eb1bd]" size={18} />}
    </>
  );

  return onClick
    ? (
        <button
          className="flex min-h-[68px] w-full items-center border-0 border-b border-solid border-border-primary bg-transparent px-4 text-left transition last:border-b-0 active:bg-primary-light/25"
          data-testid={testId}
          onClick={onClick}
          type="button"
        >
          {content}
        </button>
      )
    : (
        <div className="flex min-h-[68px] items-center border-0 border-b border-solid border-border-primary bg-transparent px-4 last:border-b-0">
          {content}
        </div>
      );
};

export function CollaborationStatusBadge({
  label,
  status,
}: {
  label: string;
  status: LedgerJoinRequestStatus | LedgerMemberStatus;
}) {
  const active = status === 'PENDING' || status === 'ACTIVE';
  const positive = status === 'APPROVED';
  return (
    <span
      className={active
        ? 'rounded-full bg-primary-light/65 px-2 py-0.5 text-[10px] font-bold text-primary-deep'
        : positive
          ? 'rounded-full bg-[#e2f5ec]/80 px-2 py-0.5 text-[10px] font-bold text-[#1f7a52]'
          : 'rounded-full bg-bg-gray px-2 py-0.5 text-[10px] font-bold text-font-gray'}
    >
      {label}
    </span>
  );
}

export function InvitationPreviewCard({
  fallbackOwner,
  preview,
}: {
  fallbackOwner: string;
  preview: LedgerInvitationPreview;
}) {
  return (
    <section className="bg-white">
      <LedgerSummaryBlock ledger={preview.ledger} />
      <LedgerUserRow
        fallback={fallbackOwner}
        secondary={preview.owner.username}
        user={preview.owner}
      />
    </section>
  );
}

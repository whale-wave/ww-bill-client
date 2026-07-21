import type { FC, ReactNode } from 'react';
import type {
  LedgerInvitationPreview,
  LedgerJoinRequestStatus,
  LedgerMemberStatus,
  LedgerSummary,
  LedgerUserSummary,
} from '@/entities/ledger';
import { Button, ErrorBlock, SpinLoading } from 'antd-mobile';
import { RightOutline, UserOutline } from 'antd-mobile-icons';
import { LedgerVisualIcon } from '@/entities/ledger';
import { getLedgerUserDisplayName } from './model';

interface QueryStateProps {
  type: 'loading' | 'error' | 'empty' | 'permission' | 'invalid';
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export const CollaborationQueryState: FC<QueryStateProps> = ({
  description,
  onRetry,
  retryLabel,
  title,
  type,
}) => {
  if (type === 'loading') {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-sm text-font-gray">
        <SpinLoading />
        <span>{title}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-4">
      <ErrorBlock description={description} status="default" title={title} />
      {onRetry && (
        <Button className="mt-4" color="primary" fill="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export function LedgerSummaryBlock({ ledger }: { ledger: LedgerSummary }) {
  return (
    <div className="flex items-center bg-white px-4 py-4">
      <span className="mr-3 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-primary text-xl text-font-black">
        <LedgerVisualIcon templateKey="custom" />
      </span>
      <div className="min-w-0">
        <div className="one-line text-lg font-medium text-font-black">{ledger.name}</div>
        <div className="mt-1 text-xs text-font-gray">{ledger.id}</div>
      </div>
    </div>
  );
}

interface UserAvatarProps {
  user: LedgerUserSummary;
  size?: number;
}

export const LedgerUserAvatar: FC<UserAvatarProps> = ({ size = 42, user }) => (
  user.avatar
    ? (
        <img
          alt=""
          className="flex-shrink-0 rounded-full bg-bg-gray object-cover"
          height={size}
          src={user.avatar}
          width={size}
        />
      )
    : (
        <span
          className="flex flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg text-font-black"
          style={{ height: size, width: size }}
        >
          <UserOutline />
        </span>
      )
);

interface UserRowProps {
  user: LedgerUserSummary;
  fallback: string;
  secondary?: ReactNode;
  trailing?: ReactNode;
  testId?: string;
  onClick?: () => void;
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
      <LedgerUserAvatar user={user} />
      <span className="ml-3 min-w-0 flex-grow text-left">
        <span className="one-line block text-base text-font-black">
          {getLedgerUserDisplayName(user, fallback)}
        </span>
        {secondary && <span className="mt-1 block text-xs text-font-gray">{secondary}</span>}
      </span>
      {trailing}
      {onClick && <RightOutline className="ml-2 flex-shrink-0 text-font-gray" />}
    </>
  );

  return onClick
    ? (
        <button
          className="flex min-h-[68px] w-full items-center border-0 border-b border-solid border-[#EBEBEB] bg-white px-4 active:bg-slate-50"
          data-testid={testId}
          onClick={onClick}
          type="button"
        >
          {content}
        </button>
      )
    : (
        <div className="flex min-h-[68px] items-center border-0 border-b border-solid border-[#EBEBEB] bg-white px-4">
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
      className={`rounded px-2 py-1 text-xs ${active
        ? 'bg-primary text-font-black'
        : positive
          ? 'bg-green-50 text-green-700'
          : 'bg-bg-gray text-font-gray'}`}
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

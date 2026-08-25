import type { FC, ReactNode } from 'react';
import type { MemberCardItem } from '../model/types';
import { LedgerUserAvatar } from '@/entities/ledger';
import { ContentStack, GradientPanel } from '@/shared/ui';

export const MemberEditorPresentation: FC<{
  children?: ReactNode;
  member: MemberCardItem;
}> = ({ children, member }) => {
  const user = member.user ?? {
    avatar: member.avatar,
    name: typeof member.name === 'string' ? member.name : undefined,
  };

  return (
    <ContentStack>
      <GradientPanel className="flex items-center gap-3 px-4 py-4" elevation="low" surface="glass">
        <LedgerUserAvatar size={56} user={user} />
        <span className="min-w-0 flex-grow">
          <span className="flex items-center gap-2">
            <strong className="truncate text-[16px] font-black text-ww-ink">{member.name}</strong>
            {member.badge && (
              <span className="shrink-0 rounded-full bg-primary-light/65 px-2 py-0.5 text-[10px] font-bold text-primary-deep">
                {member.badge}
              </span>
            )}
          </span>
          <span className="mt-1 block truncate text-[11px] font-semibold text-ww-soft">
            ID:
            {' '}
            {member.userId}
          </span>
          {member.description && (
            <span className="mt-1 block truncate text-[12px] font-bold text-ww-mid">{member.description}</span>
          )}
        </span>
      </GradientPanel>
      <GradientPanel className="px-4 py-4" elevation="low" surface="glass">
        {children}
      </GradientPanel>
    </ContentStack>
  );
};

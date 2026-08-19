import type { FC, ReactNode } from 'react';
import type { MemberCardItem } from '../model/types';
import { ContentStack, GradientPanel } from '@/shared/ui';

export const MemberEditorPresentation: FC<{
  children: ReactNode;
  member: MemberCardItem;
}> = ({ children, member }) => (
  <ContentStack>
    <GradientPanel className="flex items-center gap-3 px-4 py-4" elevation="low" surface="glass">
      {member.avatar
        ? (
            <img
              alt=""
              className="h-14 w-14 shrink-0 rounded-[17px] border-2 border-solid border-white object-cover shadow-ww-xs"
              src={member.avatar}
            />
          )
        : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[17px] bg-[linear-gradient(145deg,#c8eaf6,#e8f6ff)] text-xl font-black text-primary-deep shadow-ww-xs">
              {String(member.name).slice(0, 1)}
            </span>
          )}
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

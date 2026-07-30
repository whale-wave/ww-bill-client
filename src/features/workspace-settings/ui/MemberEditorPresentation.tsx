import type { FC, ReactNode } from 'react';
import type { MemberCardItem } from '../model/types';

export const MemberEditorPresentation: FC<{
  children: ReactNode;
  member: MemberCardItem;
}> = ({ children, member }) => (
  <div className="pb-6" data-member-editor>
    <section className="bg-white px-4 py-5">
      <div className="flex items-center">
        {member.avatar
          ? <img alt="" className="h-14 w-14 rounded-full object-cover" src={member.avatar} />
          : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-gray text-xl text-font-gray">
                {String(member.name).slice(0, 1)}
              </span>
            )}
        <span className="ml-3 min-w-0 flex-grow">
          <span className="flex items-center gap-2">
            <strong className="truncate text-lg font-medium text-font-black">{member.name}</strong>
            {member.badge && (
              <span className="rounded-full bg-[#e8f6f9] px-2 py-0.5 text-xs text-[#18839b]">
                {member.badge}
              </span>
            )}
          </span>
          <span className="mt-1 block text-sm text-font-gray">
            ID:
            {' '}
            {member.userId}
          </span>
          {member.description && (
            <span className="mt-1 block text-xs text-font-gray">{member.description}</span>
          )}
        </span>
      </div>
    </section>
    <section className="mt-3 bg-white px-4 py-4">
      {children}
    </section>
  </div>
);

import type { FC } from 'react';
import type { HouseholdMember } from '@/entities/household';
import type { LedgerMember } from '@/entities/ledger';
import type { MemberColorKey } from '@/shared/config/member-colors';
import { Toast } from 'antd-mobile';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useHouseholdMembersQuery,
  useUpdateMyHouseholdNicknameMutation,
} from '@/entities/household';
import {
  LedgerMemberStatus,
  useLedgerMembersQuery,
  useLedgerQuery,
  useUpdateLedgerMemberMutation,
} from '@/entities/ledger';
import { useGetUserUserInfoQuery } from '@/entities/user';
import { getApiErrorStatus } from '@/features/household';
import { MEMBER_COLOR_KEYS, MEMBER_COLOR_PALETTE } from '@/shared/config/member-colors';
import { AppButton, GradientPanel, PageHeader } from '@/shared/ui';

type Scope = 'household' | 'ledger';

interface Props {
  scope: Scope;
}

function getMemberName(member: HouseholdMember | LedgerMember) {
  return member.nickname || member.user.name || member.user.username || '成员';
}

const MemberColorPage: FC<Props> = ({ scope }) => {
  const params = useParams<{ householdId?: string; ledgerId?: string }>();
  const navigate = useNavigate();
  const id = scope === 'household' ? params.householdId : params.ledgerId;
  const userQuery = useGetUserUserInfoQuery();
  const householdMembers = useHouseholdMembersQuery({
    params: { householdId: params.householdId ?? '' },
    queryOptions: { enabled: scope === 'household' && Boolean(params.householdId) },
  });
  const ledgerMembers = useLedgerMembersQuery({
    params: { ledgerId: params.ledgerId ?? '', status: LedgerMemberStatus.ACTIVE },
    queryOptions: { enabled: scope === 'ledger' && Boolean(params.ledgerId) },
  });
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId: params.ledgerId ?? '' },
    queryOptions: { enabled: scope === 'ledger' && Boolean(params.ledgerId) },
  });
  const [updateHousehold, householdState] = useUpdateMyHouseholdNicknameMutation();
  const [updateLedger, ledgerState] = useUpdateLedgerMemberMutation();
  const members = (scope === 'household' ? householdMembers.data : ledgerMembers.data) as Array<HouseholdMember | LedgerMember>;
  const currentUserId = Number(userQuery.data?.userId ?? userQuery.data?.id);
  const currentMember = useMemo(
    () => members.find(member => member.user.id === currentUserId),
    [currentUserId, members],
  );
  const [draft, setDraft] = useState<MemberColorKey | undefined>();
  const selected = draft ?? currentMember?.colorKey;
  const occupiedBy = new Map(
    members.filter(member => member.user.id !== currentUserId).map(member => [member.colorKey, getMemberName(member)]),
  );
  const loading = householdState.isLoading || ledgerState.isLoading;

  const save = async () => {
    if (!id || !currentMember || !selected || selected === currentMember.colorKey)
      return;
    try {
      if (scope === 'household') {
        await updateHousehold({
          householdId: id,
          data: { colorKey: selected, version: currentMember.version },
        });
      }
      else {
        await updateLedger({
          ledgerId: id,
          memberId: currentMember.id,
          data: { colorKey: selected, version: currentMember.version },
        });
      }
      Toast.show({ content: '成员颜色已更新', icon: 'success' });
      navigate(-1);
    }
    catch (error) {
      if (getApiErrorStatus(error) === 409) {
        await (scope === 'household' ? householdMembers.refetch() : ledgerMembers.refetch());
        setDraft(undefined);
        Toast.show({ content: '颜色已被其他成员使用，请重新选择', icon: 'fail' });
      }
      else {
        Toast.show({ content: '保存失败，请稍后重试', icon: 'fail' });
      }
    }
  };

  return (
    <div className="page-new min-h-screen px-[18px] pb-8">
      <PageHeader backLabel="返回" onBack={() => navigate(-1)} title="我的成员颜色" subtitle="仅在当前协作账本中生效" />
      <main className="mx-auto mt-3 w-full max-w-[520px] space-y-4">
        <GradientPanel className="px-4 py-4" elevation="standard" surface="glass">
          <p className="mb-3 text-[12px] font-semibold text-ww-mid">选择一个未被其他成员使用的颜色</p>
          <div className="grid grid-cols-4 gap-3" role="group" aria-label="成员颜色">
            {MEMBER_COLOR_KEYS.map((key) => {
              const palette = MEMBER_COLOR_PALETTE[key];
              const owner = occupiedBy.get(key);
              const active = selected === key;
              return (
                <button
                  aria-label={owner ? `${palette.label}，由${owner}使用` : palette.label}
                  aria-pressed={active}
                  className={`relative flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-[18px] border-2 px-1 text-[11px] font-bold transition ${owner ? 'cursor-not-allowed opacity-55' : 'active:scale-[.98]'}`}
                  disabled={Boolean(owner)}
                  key={key}
                  onClick={() => setDraft(key)}
                  style={{ backgroundColor: palette.background, borderColor: active ? palette.foreground : 'transparent', color: palette.foreground }}
                  type="button"
                >
                  <span aria-hidden="true" className="h-6 w-6 rounded-full border border-white/70" style={{ backgroundColor: palette.foreground }} />
                  <span>{palette.label}</span>
                  {owner && (
                    <span className="max-w-full truncate text-[9px] text-ww-mid">
                      已由
                      {owner}
                      {' '}
                      使用
                    </span>
                  )}
                  {active && <span aria-hidden="true" className="absolute right-1.5 top-1 text-[13px]">✓</span>}
                </button>
              );
            })}
          </div>
        </GradientPanel>
        <AppButton disabled={!currentMember || !selected || selected === currentMember.colorKey} fullWidth loading={loading} loadingLabel="保存中" onClick={() => void save()}>
          保存成员颜色
        </AppButton>
        {scope === 'ledger' && ledgerQuery.data && !currentMember && (
          <p className="text-center text-xs text-ww-mid">当前账号不是此账本的活跃成员</p>
        )}
      </main>
    </div>
  );
};

export function HouseholdMemberColorPage() {
  return <MemberColorPage scope="household" />;
}

export function LedgerMemberColorPage() {
  return <MemberColorPage scope="ledger" />;
}

import type { FC } from 'react';
import type { AssignableLedgerRole } from '@/entities/ledger';
import { Toast } from 'antd-mobile';
import { Check, ChevronRight, UserRoundCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LedgerCapability,
  LedgerJoinDecision,
  LedgerJoinRequestStatus,
  useDecideJoinRequestMutation,
  useLedgerJoinRequestsQuery,
  useLedgerQuery,
} from '@/entities/ledger';
import {
  CollaborationQueryState,
  getAssignableRoles,
  getErrorMessage,
  getLedgerUserDisplayName,
  LedgerUserAvatar,
} from '@/features/ledger-collaboration';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { AppBottomSheet, ContentStack, GradientPanel, PageHeader, SectionStack } from '@/shared/ui';
import {
  getJoinRequestPermissionGroups,
  getJoinRequestRoleDescriptionKey,
} from './model';

const LedgerJoinRequestDetailPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const { ledgerId = '', requestId = '' } = useParams<{
    ledgerId: string;
    requestId: string;
  }>();
  const ledgerQuery = useLedgerQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId) },
  });
  const canReview = ledgerQuery.data?.capabilities.includes(
    LedgerCapability.MEMBER_REVIEW,
  );
  const requestsQuery = useLedgerJoinRequestsQuery({
    params: { ledgerId },
    queryOptions: { enabled: Boolean(ledgerId && requestId && canReview) },
  });
  const request = requestsQuery.data.find(item => item.id === requestId);
  const assignableRoles = getAssignableRoles(ledgerQuery.data?.myRole);
  const [assignedRole, setAssignedRole] = useState<AssignableLedgerRole>();
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [decide, mutation] = useDecideJoinRequestMutation();
  const submittingRef = useRef(false);
  const applicantName = request
    ? getLedgerUserDisplayName(request.applicant, t('common.unknownUser'))
    : t('requestDetail.title');

  const handleDecision = async (decision: LedgerJoinDecision) => {
    if (!request || submittingRef.current)
      return;
    if (decision === LedgerJoinDecision.APPROVED && !assignedRole) {
      setErrorMessage(t('requestDetail.roleRequired'));
      return;
    }
    submittingRef.current = true;
    setErrorMessage('');
    try {
      await decide({
        data: {
          ...(decision === LedgerJoinDecision.APPROVED
            ? { assignedRole }
            : {}),
          decision,
          version: request.version,
        },
        ledgerId,
        requestId,
      });
      Toast.show({ content: t('requestDetail.processed'), icon: 'success' });
      navigate(ROUTES_PATH.LEDGER_JOIN_REQUESTS.getPath(ledgerId), { replace: true });
    }
    catch (error) {
      const message = getErrorMessage(error, t('requestDetail.processFailed'));
      setErrorMessage(message);
      Toast.show({ content: message });
    }
    finally {
      submittingRef.current = false;
    }
  };

  const loading = ledgerQuery.isLoading || (canReview && requestsQuery.isLoading);
  const error = ledgerQuery.isError || (canReview && requestsQuery.isError);
  const isPending = request?.status === LedgerJoinRequestStatus.PENDING;

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        subtitle={t('requestDetail.subtitle')}
        title={t('requestDetail.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-6">
        <div className="mx-auto w-full max-w-[520px]">
          {(!ledgerId || !requestId) && (
            <CollaborationQueryState
              description={t('requestDetail.invalidDescription')}
              title={t('requestDetail.invalid')}
              type="invalid"
            />
          )}
          {ledgerId && requestId && loading && (
            <CollaborationQueryState title={t('requests.loading')} type="loading" />
          )}
          {ledgerId && requestId && error && (
            <CollaborationQueryState
              description={t('requests.loadErrorDescription')}
              onRetry={() => {
                ledgerQuery.refetch();
                requestsQuery.refetch();
              }}
              retryLabel={t('common.retry')}
              title={t('requests.loadError')}
              type="error"
            />
          )}
          {ledgerQuery.data && !canReview && (
            <CollaborationQueryState
              description={t('common.noPermissionDescription')}
              title={t('common.noPermission')}
              type="permission"
            />
          )}
          {canReview && !loading && !error && !request && (
            <CollaborationQueryState
              description={t('requestDetail.notFoundDescription')}
              title={t('requestDetail.notFound')}
              type="empty"
            />
          )}
          {request && !loading && !error && (
            <SectionStack>
              <ContentStack>
                <GradientPanel className="flex items-center gap-3 px-4 py-4" elevation="low" surface="glass">
                  <span className="sr-only">{t('requestDetail.avatar')}</span>
                  <LedgerUserAvatar size={48} user={request.applicant} />
                  <span className="min-w-0 flex-grow">
                    <span className="block truncate text-[15px] font-black text-ww-ink">{applicantName}</span>
                    {request.applicantRemark && (
                      <span className="mt-1 block truncate text-[12px] font-bold text-ww-mid">
                        {request.applicantRemark}
                      </span>
                    )}
                  </span>
                </GradientPanel>

                <GradientPanel className="overflow-hidden px-4 py-1" elevation="low" surface="glass">
                  <div className="flex min-h-[56px] items-center justify-between gap-3 border-0 border-b border-solid border-border-primary">
                    <span className="text-[12px] font-bold text-ww-mid">{t('requestDetail.remark')}</span>
                    <span className="min-w-0 truncate text-right text-[13px] font-black text-ww-ink">
                      {request.applicantRemark || '—'}
                    </span>
                  </div>
                  {isPending && (
                    <button
                      className="flex min-h-[56px] w-full items-center justify-between gap-3 border-0 bg-transparent p-0 text-left"
                      data-testid="join-request-role-row"
                      disabled={assignableRoles.length === 0}
                      onClick={() => setRolePickerOpen(true)}
                      type="button"
                    >
                      <span className="text-[12px] font-bold text-ww-mid">{t('requestDetail.assignedRole')}</span>
                      <span className="flex min-w-0 items-center gap-1 text-[13px] font-black text-ww-ink">
                        <span className="truncate">
                          {assignedRole ? t(`role.${assignedRole}`) : t('requestDetail.chooseRole')}
                        </span>
                        <ChevronRight aria-hidden="true" className="shrink-0 text-[#9eb1bd]" size={18} />
                      </span>
                    </button>
                  )}
                </GradientPanel>

                {isPending && assignedRole && (
                  <GradientPanel className="px-4 py-4" elevation="low" surface="glass">
                    <h2 className="text-[12px] font-extrabold text-ww-ink">{t('requestDetail.permissionsTitle')}</h2>
                    <div className="mt-2 space-y-2.5">
                      {getJoinRequestPermissionGroups(assignedRole).map(group => (
                        <div className="rounded-[14px] bg-white/60 px-3 py-2.5" key={group.key}>
                          <span className="block text-[12px] font-black text-ww-ink">{t(group.titleKey)}</span>
                          <span className="mt-0.5 block text-[11px] font-semibold leading-4 text-ww-mid">
                            {t(group.descriptionKey)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GradientPanel>
                )}

                {!isPending && (
                  <GradientPanel className="px-4 py-4" elevation="low" surface="glass">
                    <p className="text-[13px] font-bold text-ww-mid">{t('requestDetail.alreadyProcessed')}</p>
                    {request.assignedRole && (
                      <p className="mt-2 text-[13px] font-black text-ww-ink">
                        {t('requestDetail.resultRole', {
                          role: t(`role.${request.assignedRole}`),
                        })}
                      </p>
                    )}
                    {request.decisionRemark && (
                      <p className="mt-2 text-[12px] font-semibold text-ww-soft">{request.decisionRemark}</p>
                    )}
                  </GradientPanel>
                )}
              </ContentStack>

              {isPending && (
                <div>
                  {errorMessage && <p className="mb-3 text-center text-[12px] font-bold text-[#b24f71]" role="alert">{errorMessage}</p>}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="h-[52px] w-full rounded-[18px] border border-solid border-border-primary bg-white/85 text-[14px] font-extrabold text-primary-deep shadow-ww disabled:opacity-45"
                      data-testid="join-request-ignore"
                      disabled={mutation.isLoading}
                      onClick={() => void handleDecision(LedgerJoinDecision.IGNORED)}
                      type="button"
                    >
                      {t('requestDetail.ignore')}
                    </button>
                    <button
                      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45"
                      data-testid="join-request-approve"
                      disabled={mutation.isLoading || !assignedRole}
                      onClick={() => void handleDecision(LedgerJoinDecision.APPROVED)}
                      type="button"
                    >
                      {mutation.isLoading
                        ? (
                            <span>{t('requestDetail.processed')}</span>
                          )
                        : (
                            <>
                              <UserRoundCheck size={18} />
                              {t('requestDetail.approve')}
                            </>
                          )}
                    </button>
                  </div>
                </div>
              )}
            </SectionStack>
          )}
        </div>
      </main>

      <AppBottomSheet
        destroyOnClose
        onClose={() => setRolePickerOpen(false)}
        onMaskClick={() => setRolePickerOpen(false)}
        showCloseButton
        visible={rolePickerOpen}
      >
        <section className="px-4 pb-[max(20px,env(safe-area-inset-bottom))]" data-testid="join-request-role-popup">
          <h2 className="py-2 text-center">{t('requestDetail.rolePickerTitle')}</h2>
          <div className="space-y-2" role="listbox">
            {assignableRoles.map(role => (
              <button
                aria-selected={assignedRole === role}
                className="flex w-full items-center gap-3 rounded-[16px] border border-solid border-border-primary bg-white/90 px-4 py-3 text-left shadow-ww-xs"
                data-testid={`join-request-role-${role}`}
                key={role}
                onClick={() => {
                  setAssignedRole(role);
                  setErrorMessage('');
                  setRolePickerOpen(false);
                }}
                role="option"
                type="button"
              >
                <span className="min-w-0 flex-grow">
                  <span className="block text-[14px] font-black text-ww-ink">{t(`role.${role}`)}</span>
                  <span className="mt-0.5 block text-[11px] font-semibold leading-4 text-ww-mid">
                    {t(getJoinRequestRoleDescriptionKey(role))}
                  </span>
                </span>
                {assignedRole === role && (
                  <Check aria-label={t('requestDetail.selected')} className="shrink-0 text-primary-deep" size={18} />
                )}
              </button>
            ))}
          </div>
        </section>
      </AppBottomSheet>
    </div>
  );
};

export default LedgerJoinRequestDetailPage;

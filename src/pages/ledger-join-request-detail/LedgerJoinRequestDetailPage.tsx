import type { FC } from 'react';
import type { AssignableLedgerRole } from '@/entities/ledger';
import { Button, Toast } from 'antd-mobile';
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
  CollaborationStatusBadge,
  getAssignableRoles,
  getErrorMessage,
  LedgerUserRow,
} from '@/features/ledger-collaboration';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

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
  const [decisionRemark, setDecisionRemark] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [decide, mutation] = useDecideJoinRequestMutation();
  const submittingRef = useRef(false);
  const effectiveAssignedRole = assignedRole
    && assignableRoles.includes(assignedRole as never)
    ? assignedRole
    : assignableRoles[0];

  const handleDecision = async (decision: LedgerJoinDecision) => {
    if (!request || submittingRef.current)
      return;
    if (decision === LedgerJoinDecision.APPROVED && !effectiveAssignedRole) {
      setErrorMessage(t('requestDetail.roleRequired'));
      return;
    }
    submittingRef.current = true;
    setErrorMessage('');
    try {
      await decide({
        data: {
          ...(decision === LedgerJoinDecision.APPROVED
            ? { assignedRole: effectiveAssignedRole }
            : {}),
          decision,
          ...(decisionRemark.trim() ? { decisionRemark: decisionRemark.trim() } : {}),
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

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('requestDetail.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto pb-6">
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
          <>
            <section className="mt-3 bg-white">
              <LedgerUserRow
                fallback={t('common.unknownUser')}
                secondary={request.applicant.username}
                trailing={(
                  <CollaborationStatusBadge
                    label={t(`joinRequestStatus.${request.status}`)}
                    status={request.status}
                  />
                )}
                user={request.applicant}
              />
              <div className="px-4 py-4">
                <p className="text-xs text-font-gray">{t('requestDetail.remark')}</p>
                <p className="mt-2 text-base leading-6 text-font-black">
                  {request.applicantRemark}
                </p>
                <p className="mt-4 text-xs text-font-gray">
                  {t('requestDetail.createdAt', {
                    date: new Date(request.createdAt).toLocaleString(),
                  })}
                </p>
              </div>
            </section>
            {request.status === LedgerJoinRequestStatus.PENDING
              ? (
                  <section className="mt-3 bg-white px-4 py-5">
                    <label className="block text-sm text-font-black" htmlFor="join-assigned-role">
                      {t('requestDetail.assignedRole')}
                    </label>
                    <select
                      className="mt-3 h-[48px] w-full rounded border border-solid border-[#EBEBEB] bg-white px-3 text-base"
                      id="join-assigned-role"
                      onChange={event => setAssignedRole(event.target.value as AssignableLedgerRole)}
                      value={effectiveAssignedRole}
                    >
                      {assignableRoles.map(role => (
                        <option key={role} value={role}>{t(`role.${role}`)}</option>
                      ))}
                    </select>
                    <label className="mt-5 block text-sm text-font-black" htmlFor="join-decision-remark">
                      {t('requestDetail.decisionRemark')}
                    </label>
                    <textarea
                      className="mt-3 min-h-[92px] w-full resize-none box-border rounded border border-solid border-[#EBEBEB] p-3 text-base leading-6 outline-none"
                      id="join-decision-remark"
                      maxLength={500}
                      onChange={event => setDecisionRemark(event.target.value)}
                      placeholder={t('requestDetail.decisionRemarkPlaceholder')}
                      value={decisionRemark}
                    />
                    {errorMessage && <p className="mt-3 text-sm text-red-500" role="alert">{errorMessage}</p>}
                    <Button
                      block
                      className="mt-6"
                      color="primary"
                      disabled={mutation.isLoading || !effectiveAssignedRole}
                      loading={mutation.isLoading}
                      onClick={() => handleDecision(LedgerJoinDecision.APPROVED)}
                    >
                      {t('requestDetail.approve')}
                    </Button>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <Button
                        disabled={mutation.isLoading}
                        onClick={() => handleDecision(LedgerJoinDecision.REJECTED)}
                      >
                        {t('requestDetail.reject')}
                      </Button>
                      <Button
                        disabled={mutation.isLoading}
                        onClick={() => handleDecision(LedgerJoinDecision.IGNORED)}
                      >
                        {t('requestDetail.ignore')}
                      </Button>
                    </div>
                  </section>
                )
              : (
                  <section className="mt-3 bg-white px-4 py-5 text-sm leading-6 text-font-gray">
                    <p>{t('requestDetail.alreadyProcessed')}</p>
                    {request.assignedRole && (
                      <p className="mt-2">
                        {t('requestDetail.resultRole', {
                          role: t(`role.${request.assignedRole}`),
                        })}
                      </p>
                    )}
                    {request.decisionRemark && <p className="mt-2">{request.decisionRemark}</p>}
                  </section>
                )}
          </>
        )}
      </main>
    </div>
  );
};

export default LedgerJoinRequestDetailPage;

import type { FC } from 'react';
import type { AssignableLedgerRole } from '@/entities/ledger';
import { Button, Popup, Toast } from 'antd-mobile';
import { CheckOutline, RightOutline } from 'antd-mobile-icons';
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
import { NavBar } from '@/shared/ui';
import styles from './index.module.scss';
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
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} className={styles.navBar} onBack={() => navigate(-1)}>
        {applicantName}
      </NavBar>
      <main className={styles.content}>
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
            <section className={styles.infoSection}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t('requestDetail.avatar')}</span>
                <LedgerUserAvatar size={48} user={request.applicant} />
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t('requestDetail.remark')}</span>
                <span className={styles.infoValue}>{request.applicantRemark}</span>
              </div>
              {isPending && (
                <button
                  className={styles.infoRowButton}
                  data-testid="join-request-role-row"
                  disabled={assignableRoles.length === 0}
                  onClick={() => setRolePickerOpen(true)}
                  type="button"
                >
                  <span className={styles.infoLabel}>{t('requestDetail.assignedRole')}</span>
                  <span className={styles.roleValue}>
                    {assignedRole ? t(`role.${assignedRole}`) : t('requestDetail.chooseRole')}
                    <RightOutline aria-hidden="true" className={styles.arrow} />
                  </span>
                </button>
              )}
            </section>

            {isPending && assignedRole && (
              <section className={styles.permissionSection}>
                <h2 className={styles.sectionTitle}>{t('requestDetail.permissionsTitle')}</h2>
                <div className={styles.permissionList}>
                  {getJoinRequestPermissionGroups(assignedRole).map(group => (
                    <div className={styles.permissionRow} key={group.key}>
                      <span className={styles.permissionTitle}>{t(group.titleKey)}</span>
                      <span className={styles.permissionDescription}>{t(group.descriptionKey)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!isPending && (
              <section className={styles.processedSection}>
                <p>{t('requestDetail.alreadyProcessed')}</p>
                {request.assignedRole && (
                  <p>
                    {t('requestDetail.resultRole', {
                      role: t(`role.${request.assignedRole}`),
                    })}
                  </p>
                )}
                {request.decisionRemark && <p>{request.decisionRemark}</p>}
              </section>
            )}

            {isPending && (
              <footer className={styles.actionBar}>
                {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}
                <div className={styles.actions}>
                  <Button
                    block
                    className={styles.secondaryAction}
                    data-testid="join-request-ignore"
                    disabled={mutation.isLoading}
                    onClick={() => void handleDecision(LedgerJoinDecision.IGNORED)}
                  >
                    {t('requestDetail.ignore')}
                  </Button>
                  <Button
                    block
                    color="primary"
                    data-testid="join-request-approve"
                    disabled={mutation.isLoading || !assignedRole}
                    loading={mutation.isLoading}
                    onClick={() => void handleDecision(LedgerJoinDecision.APPROVED)}
                  >
                    {t('requestDetail.approve')}
                  </Button>
                </div>
              </footer>
            )}
          </>
        )}
      </main>

      <Popup
        bodyClassName={styles.rolePopup}
        destroyOnClose
        onClose={() => setRolePickerOpen(false)}
        onMaskClick={() => setRolePickerOpen(false)}
        position="bottom"
        showCloseButton
        visible={rolePickerOpen}
      >
        <section className={styles.rolePicker} data-testid="join-request-role-popup">
          <h2 className={styles.rolePickerTitle}>{t('requestDetail.rolePickerTitle')}</h2>
          <div className={styles.roleOptions} role="listbox">
            {assignableRoles.map(role => (
              <button
                aria-selected={assignedRole === role}
                className={styles.roleOption}
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
                <span className={styles.roleOptionCopy}>
                  <span className={styles.roleOptionTitle}>{t(`role.${role}`)}</span>
                  <span className={styles.roleOptionDescription}>
                    {t(getJoinRequestRoleDescriptionKey(role))}
                  </span>
                </span>
                {assignedRole === role && (
                  <CheckOutline aria-label={t('requestDetail.selected')} className={styles.roleCheck} />
                )}
              </button>
            ))}
          </div>
        </section>
      </Popup>
    </div>
  );
};

export default LedgerJoinRequestDetailPage;

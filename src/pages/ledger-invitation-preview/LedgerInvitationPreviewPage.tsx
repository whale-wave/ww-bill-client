import type { FC, FormEvent } from 'react';
import { Button, Toast } from 'antd-mobile';
import { CheckCircleFill } from 'antd-mobile-icons';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useInvitationPreviewQuery,
  useSubmitJoinRequestMutation,
} from '@/entities/ledger';
import {
  CollaborationQueryState,
  createIdempotencyKey,
  getErrorMessage,
  InvitationPreviewCard,
  normalizeInvitationCode,
  validateJoinRequest,
} from '@/features/ledger-collaboration';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const LedgerInvitationPreviewPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const params = useParams<{ code: string }>();
  const code = normalizeInvitationCode(params.code ?? '');
  const previewQuery = useInvitationPreviewQuery({
    params: { code },
    queryOptions: { enabled: Boolean(code) },
  });
  const [submitJoinRequest, mutation] = useSubmitJoinRequestMutation();
  const [remark, setRemark] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submittingRef.current)
      return;
    let validated: ReturnType<typeof validateJoinRequest>;
    try {
      validated = validateJoinRequest(code, remark);
    }
    catch (error) {
      const key = error instanceof Error ? error.message : 'invalid';
      setErrorMessage(t(`join.validation.${key}`));
      return;
    }
    submittingRef.current = true;
    setErrorMessage('');
    try {
      await submitJoinRequest({
        code,
        data: {
          idempotencyKey: createIdempotencyKey('ledger-join'),
          remark: validated.remark,
        },
      });
      setSubmitted(true);
    }
    catch (error) {
      const message = getErrorMessage(error, t('join.submitFailed'));
      setErrorMessage(message);
      Toast.show({ content: message });
    }
    finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>
        {t('preview.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto pb-6">
        {!code && (
          <CollaborationQueryState
            description={t('preview.invalidDescription')}
            title={t('preview.invalid')}
            type="invalid"
          />
        )}
        {code && previewQuery.isLoading && (
          <CollaborationQueryState title={t('preview.loading')} type="loading" />
        )}
        {code && previewQuery.isError && (
          <CollaborationQueryState
            description={t('preview.loadErrorDescription')}
            onRetry={() => previewQuery.refetch()}
            retryLabel={t('common.retry')}
            title={t('preview.loadError')}
            type="error"
          />
        )}
        {previewQuery.data && !submitted && (
          <>
            <InvitationPreviewCard
              fallbackOwner={t('common.unknownUser')}
              preview={previewQuery.data}
            />
            <form className="mt-3 bg-white px-4 py-5" onSubmit={handleSubmit}>
              <p className="text-sm text-font-gray">
                {t('preview.expiresAt', {
                  date: new Date(previewQuery.data.expiresAt).toLocaleString(),
                })}
              </p>
              <label className="mt-5 block text-base text-font-black" htmlFor="preview-remark">
                {t('join.remark')}
              </label>
              <textarea
                className="mt-3 min-h-[120px] w-full resize-none box-border rounded border-0 bg-bg-gray p-3 text-base leading-6 outline-none"
                id="preview-remark"
                maxLength={30}
                onChange={event => setRemark(event.target.value)}
                placeholder={t('join.remarkPlaceholder')}
                value={remark}
              />
              <div className="mt-2 text-right text-xs text-font-gray">
                {remark.length}
                /30
              </div>
              {errorMessage && <p className="mt-3 text-sm text-red-500" role="alert">{errorMessage}</p>}
              <Button
                block
                className="mt-6"
                color="primary"
                disabled={mutation.isLoading}
                loading={mutation.isLoading}
                type="submit"
              >
                {t('preview.confirm')}
              </Button>
            </form>
          </>
        )}
        {submitted && (
          <div className="mx-4 mt-6 flex flex-col items-center rounded bg-white px-5 py-12 text-center">
            <CheckCircleFill className="text-6xl text-green-500" />
            <h1 className="mt-5 text-2xl font-medium text-font-black">
              {t('join.submittedTitle')}
            </h1>
            <p className="mt-3 text-sm leading-6 text-font-gray">
              {t('join.submittedDescription')}
            </p>
            <Button block className="mt-8" color="primary" onClick={() => navigate(-1)}>
              {t('common.done')}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default LedgerInvitationPreviewPage;

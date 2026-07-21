import type { FC, FormEvent } from 'react';
import { Button, Toast } from 'antd-mobile';
import { CheckCircleFill } from 'antd-mobile-icons';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmitJoinRequestMutation } from '@/entities/ledger';
import {
  createIdempotencyKey,
  getErrorMessage,
  validateJoinRequest,
} from '@/pages/ledger-collaboration/model';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const LedgerJoinPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const [submitJoinRequest, mutation] = useSubmitJoinRequestMutation();
  const [code, setCode] = useState('');
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
        code: validated.code,
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
        {t('join.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-4 pb-6 pt-6">
        {submitted
          ? (
              <div className="flex flex-col items-center rounded bg-white px-5 py-12 text-center">
                <CheckCircleFill className="text-6xl text-green-500" />
                <h1 className="mt-5 text-2xl font-medium text-font-black">
                  {t('join.submittedTitle')}
                </h1>
                <p className="mt-3 text-sm leading-6 text-font-gray">
                  {t('join.submittedDescription')}
                </p>
                <Button
                  block
                  className="mt-8"
                  color="primary"
                  onClick={() => navigate(-1)}
                >
                  {t('common.done')}
                </Button>
              </div>
            )
          : (
              <form className="rounded bg-white px-4 py-6" onSubmit={handleSubmit}>
                <label className="block text-base text-font-black" htmlFor="ledger-invite-code">
                  {t('join.code')}
                </label>
                <input
                  autoCapitalize="characters"
                  className="mt-3 h-[52px] w-full box-border rounded border-0 bg-bg-gray px-3 text-base outline-none"
                  id="ledger-invite-code"
                  maxLength={100}
                  onChange={event => setCode(event.target.value)}
                  placeholder={t('join.codePlaceholder')}
                  value={code}
                />
                <label className="mt-6 block text-base text-font-black" htmlFor="ledger-join-remark">
                  {t('join.remark')}
                </label>
                <textarea
                  className="mt-3 min-h-[120px] w-full resize-none box-border rounded border-0 bg-bg-gray p-3 text-base leading-6 outline-none"
                  id="ledger-join-remark"
                  maxLength={30}
                  onChange={event => setRemark(event.target.value)}
                  placeholder={t('join.remarkPlaceholder')}
                  value={remark}
                />
                <div className="mt-2 text-right text-xs text-font-gray">
                  {remark.length}
                  /30
                </div>
                {errorMessage && (
                  <p className="mt-3 text-sm text-red-500" role="alert">{errorMessage}</p>
                )}
                <Button
                  block
                  className="mt-6"
                  color="primary"
                  disabled={mutation.isLoading}
                  loading={mutation.isLoading}
                  type="submit"
                >
                  {t('join.submit')}
                </Button>
              </form>
            )}
      </main>
    </div>
  );
};

export default LedgerJoinPage;

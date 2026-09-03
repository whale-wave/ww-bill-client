import type { FC } from 'react';
import { Form, Input, TextArea, Toast } from 'antd-mobile';
import { CircleCheck, KeyRound, MessageSquareText } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmitJoinRequestMutation } from '@/entities/ledger';
import {
  createIdempotencyKey,
  getErrorMessage,
  normalizeInvitationCode,
  validateJoinRequest,
} from '@/features/ledger-collaboration';
import { useTranslation } from '@/shared/i18n';
import {
  IllustratedEmptyState,
  PageHeader,
  Surface,
} from '@/shared/ui';
import './ledger-join.scss';

const LedgerJoinPage: FC = () => {
  const { t } = useTranslation('ledger');
  const navigate = useNavigate();
  const [submitJoinRequest, mutation] = useSubmitJoinRequestMutation();
  const [code, setCode] = useState('');
  const [remark, setRemark] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (submittingRef.current)
      return;
    let validated: ReturnType<typeof validateJoinRequest>;
    try {
      validated = validateJoinRequest(code, remark);
    }
    catch (error) {
      const key = error instanceof Error ? error.message : 'invalid';
      const message = t(`join.validation.${key}`);
      setErrorMessage(message);
      Toast.show({ content: message });
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  const isFormValid = /^[A-HJ-NP-Z2-9]{6}$/.test(code)
    && remark.trim().length >= 1
    && remark.trim().length <= 30;
  const isLoading = isSubmitting || mutation.isLoading;

  return (
    <div className="page-new ledger-join-page relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-20 h-56 w-56 rounded-full bg-primary-light/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-52 w-52 rounded-full bg-ww-pink-light/25 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        title={t('join.title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-auto px-[18px] pb-6 pt-2">
        <div className="mx-auto w-full max-w-[520px]">
          {submitted
            ? (
                <IllustratedEmptyState
                  actionLabel={t('common.done')}
                  className="min-h-[460px]"
                  description={t('join.submittedDescription')}
                  icon={<CircleCheck className="text-primary-deep" size={42} strokeWidth={2.1} />}
                  onAction={() => navigate(-1)}
                  title={t('join.submittedTitle')}
                />
              )
            : (
                <Form
                  className="ledger-join-form"
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Surface
                    className="px-4 py-4"
                    data-testid="ledger-join-code-field"
                    material="content"
                  >
                    <label className="block text-[12px] font-extrabold text-ww-mid" htmlFor="ledger-invite-code">
                      {t('join.codeGuide')}
                    </label>
                    <div className="mt-2.5 flex min-h-[54px] items-center gap-3 rounded-[16px] border border-solid border-border-primary bg-primary-light/25 px-3.5 shadow-ww-xs">
                      <KeyRound className="shrink-0 text-primary-deep" size={19} strokeWidth={1.8} />
                      <Form.Item noStyle>
                        <Input
                          autoCapitalize="characters"
                          clearable
                          className="ledger-join-input"
                          id="ledger-invite-code"
                          maxLength={100}
                          onChange={value => setCode(normalizeInvitationCode(value))}
                          placeholder={t('join.codePlaceholder')}
                          value={code}
                        />
                      </Form.Item>
                    </div>
                  </Surface>

                  <Surface
                    className="mt-3 px-4 py-4"
                    data-testid="ledger-join-remark-field"
                    material="content"
                  >
                    <label className="block text-[12px] font-extrabold text-ww-mid" htmlFor="ledger-join-remark">
                      {t('join.remarkGuide')}
                    </label>
                    <div className="mt-2.5 flex min-h-[108px] items-start gap-3 rounded-[16px] border border-solid border-border-primary bg-primary-light/25 px-3.5 py-3 shadow-ww-xs">
                      <MessageSquareText className="mt-0.5 shrink-0 text-primary-deep" size={19} strokeWidth={1.8} />
                      <Form.Item noStyle>
                        <TextArea
                          autoSize={{ minRows: 3, maxRows: 5 }}
                          className="ledger-join-textarea"
                          id="ledger-join-remark"
                          maxLength={30}
                          onChange={setRemark}
                          placeholder={t('join.remarkPlaceholder')}
                          showCount
                          value={remark}
                        />
                      </Form.Item>
                    </div>
                  </Surface>

                  {errorMessage && (
                    <p className="mt-3 text-center text-[12px] font-bold text-feedback-danger" role="alert">
                      {errorMessage}
                    </p>
                  )}
                  <button
                    className="mt-4 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww transition disabled:opacity-45"
                    data-testid="ledger-join-submit"
                    disabled={!isFormValid || isLoading}
                    type="submit"
                  >
                    {isLoading ? t('join.submitting') : t('join.submit')}
                  </button>
                </Form>
              )}
        </div>
      </main>
    </div>
  );
};

export default LedgerJoinPage;

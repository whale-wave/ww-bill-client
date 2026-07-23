import type { FC } from 'react';
import {
  Button,
  Form,
  Input,
  NavBar,
  SafeArea,
  TextArea,
  Toast,
} from 'antd-mobile';
import { CheckCircleFill } from 'antd-mobile-icons';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmitJoinRequestMutation } from '@/entities/ledger';
import {
  createIdempotencyKey,
  getErrorMessage,
  normalizeInvitationCode,
  validateJoinRequest,
} from '@/pages/ledger-collaboration/model';
import { useTranslation } from '@/shared/i18n';
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
    <div className="page-new ledger-join-page">
      <SafeArea position="top" />
      <NavBar
        back={t('common:nav.back')}
        className="ledger-join-navbar"
        onBack={() => navigate(-1)}
      >
        {t('join.title')}
      </NavBar>
      <main className="ledger-join-content">
        {submitted
          ? (
              <div className="ledger-join-submitted">
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
              <Form
                className="ledger-join-form"
                layout="vertical"
                onFinish={handleSubmit}
              >
                <section
                  className="ledger-join-field-group"
                  data-testid="ledger-join-code-field"
                >
                  <label className="ledger-join-field-label" htmlFor="ledger-invite-code">
                    {t('join.codeGuide')}
                  </label>
                  <div className="ledger-join-input-shell">
                    <Form.Item noStyle>
                      <Input
                        autoCapitalize="characters"
                        clearable
                        id="ledger-invite-code"
                        maxLength={100}
                        onChange={value => setCode(normalizeInvitationCode(value))}
                        placeholder={t('join.codePlaceholder')}
                        value={code}
                      />
                    </Form.Item>
                  </div>
                </section>
                <section
                  className="ledger-join-field-group"
                  data-testid="ledger-join-remark-field"
                >
                  <label className="ledger-join-field-label" htmlFor="ledger-join-remark">
                    {t('join.remarkGuide')}
                  </label>
                  <div className="ledger-join-textarea-shell">
                    <Form.Item noStyle>
                      <TextArea
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        id="ledger-join-remark"
                        maxLength={30}
                        onChange={setRemark}
                        placeholder={t('join.remarkPlaceholder')}
                        showCount
                        value={remark}
                      />
                    </Form.Item>
                  </div>
                </section>
                {errorMessage && (
                  <p className="ledger-join-error" role="alert">{errorMessage}</p>
                )}
                <Button
                  block
                  className="ledger-join-submit"
                  color="primary"
                  data-testid="ledger-join-submit"
                  disabled={!isFormValid || isLoading}
                  loading={isLoading}
                  type="submit"
                >
                  {t('join.submit')}
                </Button>
              </Form>
            )}
      </main>
    </div>
  );
};

export default LedgerJoinPage;

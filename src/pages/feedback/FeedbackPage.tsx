import type { FeedbackCategory } from '@/entities/feedback';
import { Input, TextArea, Toast } from 'antd-mobile';
import { Bug, Check, Lightbulb, MessageCircleMore, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePostFeedbackMutation } from '@/entities/feedback';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { GradientPanel, PageHeader } from '@/shared/ui';
import pkg from '../../../package.json';

const CATEGORIES = [
  { icon: Lightbulb, key: 'suggestion' },
  { icon: Bug, key: 'bug' },
] as const satisfies ReadonlyArray<{ icon: typeof Lightbulb; key: FeedbackCategory }>;

interface FeedbackLocationState {
  from?: string;
}

export default function FeedbackPage() {
  const { t } = useTranslation('feedback');
  const navigate = useNavigate();
  const location = useLocation();
  const submitMutation = usePostFeedbackMutation();
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const sourcePage = (location.state as FeedbackLocationState | null)?.from ?? '';
  const isContentValid = content.trim().length >= 5;

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    if (!isContentValid) {
      Toast.show({ content: t('validation') });
      return;
    }
    try {
      await submitMutation.mutateAsync({
        appVersion: pkg.version,
        category,
        contact: contact.trim(),
        content: content.trim(),
        pageUrl: sourcePage,
      });
      setIsComplete(true);
    }
    catch {
      Toast.show({ content: t('submitFailed'), icon: 'fail' });
    }
  };

  const handleContinue = () => {
    setCategory('suggestion');
    setContact('');
    setContent('');
    setHasAttemptedSubmit(false);
    setIsComplete(false);
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full bg-primary-light/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-16 h-48 w-48 rounded-full bg-ww-pink/15 blur-3xl" />
      <PageHeader
        backLabel={t('common:nav.back')}
        onBack={() => navigate(-1)}
        subtitle={t('subtitle')}
        title={t('title')}
      />
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto w-full max-w-[480px]">
          {isComplete
            ? (
                <GradientPanel className="mt-8 px-6 py-8 text-center" elevation="high" surface="aurora">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/75 text-primary-deep shadow-ww">
                    <Check size={30} strokeWidth={2.4} />
                  </span>
                  <h1 className="mt-5 text-[20px] font-black text-ww-ink">{t('successTitle')}</h1>
                  <p className="mx-auto mt-2 max-w-[300px] text-[12px] font-semibold leading-5 text-ww-mid">{t('successDescription')}</p>
                  <button className="ww-theme-primary-action mt-7 h-[50px] w-full rounded-[17px] border-0 text-[14px] font-black" onClick={handleContinue} type="button">
                    {t('continue')}
                  </button>
                  <button className="mt-2 h-11 w-full border-0 bg-transparent text-[12px] font-extrabold text-primary-deep" onClick={() => navigate(ROUTES_PATH.MINE.getPath(), { replace: true })} type="button">
                    {t('backMine')}
                  </button>
                </GradientPanel>
              )
            : (
                <>
                  <GradientPanel className="mb-5 flex items-start gap-3.5 px-5 py-5" elevation="standard" surface="aurora">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-white/72 text-primary-deep shadow-ww-xs">
                      <MessageCircleMore size={23} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <h1 className="text-[16px] font-black leading-6 text-ww-ink">{t('heroTitle')}</h1>
                      <p className="mt-1 text-[11px] font-semibold leading-[18px] text-ww-mid">{t('heroDescription')}</p>
                    </div>
                  </GradientPanel>

                  <section aria-labelledby="feedback-category-label">
                    <h2 className="mb-2 px-1 text-[12px] font-black text-ww-ink" id="feedback-category-label">{t('categoryLabel')}</h2>
                    <div className="grid grid-cols-2 gap-2.5">
                      {CATEGORIES.map(({ icon: CategoryIcon, key }) => {
                        const isSelected = category === key;
                        return (
                          <button
                            aria-pressed={isSelected}
                            className={`flex h-[62px] items-center gap-3 rounded-[18px] border border-solid px-3.5 text-left transition active:scale-[0.98] ${isSelected ? 'border-primary/65 bg-primary-light/55 shadow-ww-xs' : 'border-border-primary bg-white/75'}`}
                            key={key}
                            onClick={() => setCategory(key)}
                            type="button"
                          >
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] ${isSelected ? 'bg-white text-primary-deep shadow-ww-xs' : 'bg-[#eef6f9] text-ww-mid'}`}>
                              <CategoryIcon size={18} strokeWidth={1.8} />
                            </span>
                            <span className="min-w-0 truncate text-[12px] font-black text-ww-ink">{t(`categories.${key}`)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <GradientPanel className="mt-5 overflow-hidden px-4 py-4" elevation="low" surface="glass">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[12px] font-black text-ww-ink" htmlFor="feedback-content">{t('contentLabel')}</label>
                      <span className="font-number text-[10px] font-bold text-ww-soft">
                        {content.length}
                        /2000
                      </span>
                    </div>
                    <div className={`mt-3 rounded-[16px] border border-solid bg-white/82 px-3.5 py-3 shadow-ww-xs focus-within:ring-2 ${hasAttemptedSubmit && !isContentValid ? 'border-[#d76a86] ring-2 ring-ww-pink-light/65' : 'border-border-primary focus-within:border-primary-mid focus-within:ring-primary-light/60'}`}>
                      <TextArea
                        aria-describedby="feedback-content-hint"
                        aria-invalid={hasAttemptedSubmit && !isContentValid}
                        id="feedback-content"
                        autoSize={{ maxRows: 9, minRows: 6 }}
                        maxLength={2000}
                        onChange={setContent}
                        placeholder={t('contentPlaceholder')}
                        value={content}
                      />
                    </div>
                    <p
                      className={`mt-2 px-1 text-[10px] font-bold ${hasAttemptedSubmit && !isContentValid ? 'text-[#b74f70]' : 'text-ww-soft'}`}
                      id="feedback-content-hint"
                      role={hasAttemptedSubmit && !isContentValid ? 'alert' : undefined}
                    >
                      {hasAttemptedSubmit && !isContentValid ? t('validation') : t('contentHint')}
                    </p>

                    <label className="mt-5 block text-[12px] font-black text-ww-ink" htmlFor="feedback-contact">{t('contactLabel')}</label>
                    <div className="mt-3 flex h-[50px] items-center rounded-[16px] border border-solid border-border-primary bg-white/82 px-3.5 shadow-ww-xs focus-within:border-primary-mid focus-within:ring-2 focus-within:ring-primary-light/60">
                      <Input
                        id="feedback-contact"
                        clearable
                        maxLength={120}
                        onChange={setContact}
                        placeholder={t('contactPlaceholder')}
                        value={contact}
                      />
                    </div>
                    <p className="mt-3 flex items-start gap-1.5 px-1 text-[10px] font-semibold leading-4 text-ww-soft">
                      <ShieldCheck className="mt-0.5 shrink-0" size={13} />
                      <span>{t('privacyHint')}</span>
                    </p>
                  </GradientPanel>

                  <button
                    className="ww-theme-primary-action mt-5 h-[52px] w-full rounded-[18px] border-0 text-[14px] font-black disabled:opacity-45"
                    disabled={submitMutation.isLoading}
                    onClick={() => void handleSubmit()}
                    type="button"
                  >
                    {submitMutation.isLoading ? t('submitting') : t('submit')}
                  </button>
                </>
              )}
        </div>
      </main>
    </div>
  );
}

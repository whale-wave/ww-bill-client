import type { FC } from 'react';
import { Toast } from 'antd-mobile';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '@/entities/user';
import { useTranslation } from '@/shared/i18n';
import { FormField, GradientPanel, PageHeader } from '@/shared/ui';

const Password: FC = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const disabled = !oldPassword || !newPassword || !rePassword || isSubmitting;

  const handleChangePassword = async () => {
    if (newPassword !== rePassword) {
      Toast.show({ content: t('password.passwordMismatch'), icon: 'fail' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { statusCode } = await changePassword({ newPassword, password: oldPassword });
      if (statusCode === 200) {
        Toast.show({ content: t('password.saveSuccess'), icon: 'success' });
        setTimeout(navigate, 600, -1);
      }
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/35 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('password.title')} />
      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="mb-5 flex items-center gap-3 px-1">
            <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary-light/60 text-primary-deep"><ShieldCheck size={22} /></span>
            <div>
              <h2 className="text-[14px] font-extrabold text-ww-ink">{t('password.securityTitle')}</h2>
              <p className="mt-0.5 text-[11px] text-ww-mid">{t('password.securityHint')}</p>
            </div>
          </div>
          <GradientPanel className="space-y-4 px-5 py-5" elevation="high" surface="glass">
            <FormField autoComplete="current-password" label={t('password.oldPassword')} onChange={setOldPassword} placeholder={t('password.oldPasswordPlaceholder')} prefix={<LockKeyhole size={18} />} type="password" value={oldPassword} />
            <FormField autoComplete="new-password" label={t('password.newPassword')} onChange={setNewPassword} placeholder={t('password.newPasswordPlaceholder')} prefix={<LockKeyhole size={18} />} type="password" value={newPassword} />
            <FormField autoComplete="new-password" label={t('password.confirmPassword')} onChange={setRePassword} placeholder={t('password.confirmPasswordPlaceholder')} prefix={<LockKeyhole size={18} />} type="password" value={rePassword} />
            <button className="mt-2 h-[52px] w-full rounded-[18px] border-0 bg-primary text-[14px] font-extrabold text-white shadow-ww disabled:opacity-45" disabled={disabled} onClick={() => void handleChangePassword()} type="button">{isSubmitting ? t('common:nav.loading') : t('password.save')}</button>
          </GradientPanel>
        </div>
      </main>
    </div>
  );
};

export default Password;

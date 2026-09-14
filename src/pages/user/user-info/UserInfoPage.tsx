import type { FC } from 'react';
import { Camera, ChevronRight, Hash, LockKeyhole, LogOut, Mail, UserRound } from 'lucide-react';

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportPresence } from '@/entities/auth';
import { useGetUserUserInfoQuery, usePutUserUserInfoMutation } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { uploadFile } from '@/shared/api';
import { useTranslation } from '@/shared/i18n';
import choseFile from '@/shared/lib/chose-file';
import {
  AppButton,
  AppModal,
  confirmAppAction,
  FormField,
  PageHeader,
  PageLoadingState,
  showAppActionSheet,
  Surface,
  UserAvatar,
} from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';

const UserInfo: FC = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const { data: userInfo } = useGetUserUserInfoQuery();
  const [putUserUserInfoMutate] = usePutUserUserInfoMutation();
  const { logOut } = useAuthStore(({ logOut }) => ({ logOut }));
  const [name, setName] = useState('');

  const onGoToPassword = useCallback(() => navigate('/password'), [navigate]);

  const onLogout = async () => {
    const confirmed = await confirmAppAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('common:action.logout'),
      description: t('info.logoutHint'),
      icon: <LogOut size={22} strokeWidth={1.8} />,
      title: t('info.logoutTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    await reportPresence('offline').catch(() => undefined);
    logOut();
    navigate('/login');
  };

  const onOpenChangeNameModel = () => {
    if (userInfo)
      setName(userInfo.name);
    setModalVisible(true);
  };

  const onChangeName = async () => {
    if (!userInfo || !name.trim())
      return;
    const { statusCode } = await putUserUserInfoMutate({ name: name.trim() });
    if (statusCode === 200) {
      setModalVisible(false);
    }
  };

  const handleChangeAvatar = async () => {
    if (!userInfo)
      return;
    const files = await choseFile();
    if (!files?.[0])
      return;
    const formData = new FormData();
    formData.append('file', files[0]);
    const { statusCode, data } = await uploadFile(formData);
    if (statusCode !== 200) {
      showAppError({ content: t('info.updateFailed'), icon: 'fail' });
      return;
    }
    await putUserUserInfoMutate({ name: userInfo.name, avatar: data.url });
  };

  const onChangeEmailActionSheet = useCallback(() => {
    showAppActionSheet({
      actions: [{
        key: 'edit',
        onClick: () => {
          navigate(`/settings/email/change/captcha?email=${userInfo?.email}`);
        },
        text: t('info.changeEmail'),
      }],
      cancelText: t('common:nav.cancel'),
      description: t('info.changeEmailDescription'),
      title: t('info.emailActionsTitle'),
    });
  }, [navigate, t, userInfo?.email]);

  if (!userInfo) {
    return (
      <div className="page-new">
        <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('info.title')} />
        <PageLoadingState label={t('common:nav.loading')} testId="user-info-loading" />
      </div>
    );
  }

  const rows = [
    { icon: Hash, label: t('info.accountId'), value: userInfo.username },
    { icon: Mail, label: t('info.email'), onClick: onChangeEmailActionSheet, value: userInfo.email },
    { icon: UserRound, label: t('info.nickname'), onClick: onOpenChangeNameModel, value: userInfo.name },
    { icon: LockKeyhole, label: t('password.title'), onClick: onGoToPassword, value: t('info.securityHint') },
  ];

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-52 w-52 rounded-full bg-primary-light/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-20 h-48 w-48 rounded-full bg-ww-pink-light/30 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={() => navigate(-1)} title={t('info.title')} />

      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-[520px] space-y-5">
          <Surface className="flex flex-col items-center px-5 py-6 text-center" material="raised">
            <button className="relative border-0 bg-transparent" onClick={() => void handleChangeAvatar()} type="button">
              <span className="flex h-[82px] w-[82px] items-center justify-center overflow-hidden rounded-full border-[3px] border-solid border-white bg-white shadow-ww-lg">
                <UserAvatar alt={userInfo.name} fallback="icon" name={userInfo.name} size={76} src={userInfo.avatar} />
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-solid border-white bg-primary text-white shadow-ww-xs">
                <Camera size={14} />
              </span>
            </button>
            <h2 className="mt-4 text-[20px] font-black text-ww-ink">{userInfo.name}</h2>
            <p className="mt-1 text-[11px] font-semibold text-ww-mid">{userInfo.email}</p>
            <AppButton className="mt-4" onClick={() => void handleChangeAvatar()} size="compact" variant="secondary">
              {t('info.changeAvatar')}
            </AppButton>
          </Surface>

          <Surface className="overflow-hidden px-4 py-1" material="content">
            {rows.map(row => (
              <button
                className="flex min-h-[66px] w-full items-center gap-3 border-0 border-b border-solid border-border-primary bg-transparent text-left last:border-b-0"
                disabled={!row.onClick}
                key={row.label}
                onClick={row.onClick}
                type="button"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-primary-light/55 text-primary-deep"><row.icon size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-bold text-ww-ink">{row.label}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-ww-soft">{row.value}</span>
                </span>
                {row.onClick && <ChevronRight className="text-ww-ghost" size={16} />}
              </button>
            ))}
          </Surface>

          <AppButton fullWidth onClick={() => void onLogout()} variant="danger">
            <LogOut size={17} />
            {t('common:action.logout')}
          </AppButton>
        </div>
      </main>

      <AppModal
        aria-labelledby="nickname-dialog-title"
        actions={[
          { key: 'cancel', onClick: () => setModalVisible(false), text: t('common:nav.cancel') },
          { key: 'confirm', onClick: () => void onChangeName(), text: t('common:nav.confirm') },
        ]}
        closeOnMaskClick
        content={(
          <div aria-labelledby="nickname-dialog-title">
            <h2 className="text-center text-[17px] font-extrabold text-ww-ink" id="nickname-dialog-title">{t('info.changeNickname')}</h2>
            <FormField className="mt-5" label={t('info.nickname')} onChange={setName} placeholder={t('info.namePlaceholder')} value={name} />
          </div>
        )}
        onClose={() => setModalVisible(false)}
        visible={modalVisible}
      />
    </div>
  );
};

export default UserInfo;

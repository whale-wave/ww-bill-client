import type { FC } from 'react';
import { Toast } from 'antd-mobile';
import { Camera, ChevronRight, Hash, LockKeyhole, LogOut, Mail, UserRound } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserUserInfoQuery, usePutUserUserInfoMutation } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { uploadFile } from '@/shared/api';
import { useTranslation } from '@/shared/i18n';
import choseFile from '@/shared/lib/chose-file';
import {
  confirmAppAction,
  FormField,
  PageHeader,
  PageLoadingState,
  showAppActionSheet,
  Surface,
} from '@/shared/ui';

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
    const { statusCode } = await putUserUserInfoMutate({ name: name.trim(), avatar: userInfo.avatar });
    if (statusCode === 200) {
      setModalVisible(false);
      Toast.show({ content: t('info.updateSuccess'), icon: 'success' });
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
      Toast.show({ content: t('info.updateFailed'), icon: 'fail' });
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
                {userInfo.avatar
                  ? <img alt={userInfo.name} className="h-full w-full object-cover" src={userInfo.avatar} />
                  : <UserRound className="text-primary-deep" size={34} />}
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-solid border-white bg-primary text-white shadow-ww-xs">
                <Camera size={14} />
              </span>
            </button>
            <h2 className="mt-4 text-[20px] font-black text-ww-ink">{userInfo.name}</h2>
            <p className="mt-1 text-[11px] font-semibold text-ww-mid">{userInfo.email}</p>
            <button className="mt-4 min-h-11 rounded-full border border-solid border-white/90 bg-white/65 px-4 text-[11px] font-extrabold text-primary-deep shadow-ww-xs" onClick={() => void handleChangeAvatar()} type="button">
              {t('info.changeAvatar')}
            </button>
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

          <button className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[18px] border border-solid border-feedback-danger bg-white/75 text-[13px] font-extrabold text-feedback-danger shadow-ww-xs" onClick={() => void onLogout()} type="button">
            <LogOut size={17} />
            {t('common:action.logout')}
          </button>
        </div>
      </main>

      {modalVisible && (
        <div aria-labelledby="nickname-dialog-title" aria-modal="true" className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 px-6 backdrop-blur-[3px]" onClick={() => setModalVisible(false)} role="dialog">
          <Surface className="w-full max-w-[340px] px-5 py-5" material="floating">
            <div onClick={event => event.stopPropagation()}>
              <h2 className="text-center text-[17px] font-extrabold text-ww-ink" id="nickname-dialog-title">{t('info.changeNickname')}</h2>
              <FormField className="mt-5" label={t('info.nickname')} onChange={setName} placeholder={t('info.namePlaceholder')} value={name} />
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button className="h-11 rounded-[15px] border-0 bg-bg-gray text-[13px] font-bold text-ww-mid" onClick={() => setModalVisible(false)} type="button">{t('common:nav.cancel')}</button>
                <button className="h-11 rounded-[15px] border-0 bg-primary text-[13px] font-extrabold text-white" onClick={() => void onChangeName()} type="button">{t('common:nav.confirm')}</button>
              </div>
            </div>
          </Surface>
        </div>
      )}
    </div>
  );
};

export default UserInfo;

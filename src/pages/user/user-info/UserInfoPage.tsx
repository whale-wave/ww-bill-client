import type { FC } from 'react';
import { Camera, ChevronRight, Hash, LoaderCircle, LockKeyhole, LogOut, Mail, ShieldAlert, UserRound } from 'lucide-react';

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportPresence } from '@/entities/auth';
import { useGetAccountDeletionStatusQuery, useGetUserUserInfoQuery, usePostAccountDeletionEmailCodeMutation, usePostAccountDeletionMutation, usePutUserUserInfoMutation } from '@/entities/user';
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
  useMotionPreference,
  UserAvatar,
} from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';
import { verifyUploadedAvatar } from './model/avatar-image-crop';
import { AvatarImageCropDialog } from './ui/AvatarImageCropDialog';

type AvatarUpdateState = 'idle' | 'uploading' | 'success';

const UserInfo: FC = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [deletionCode, setDeletionCode] = useState('');
  const [hasReadDeletionNotice, setHasReadDeletionNotice] = useState(false);
  const [avatarCropSourceUrl, setAvatarCropSourceUrl] = useState<string>();
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>();
  const [avatarUpdateState, setAvatarUpdateState] = useState<AvatarUpdateState>('idle');
  const { data: userInfo } = useGetUserUserInfoQuery();
  const { data: deletionStatusResponse, refetch: refetchDeletionStatus } = useGetAccountDeletionStatusQuery(deletionModalVisible);
  const [putUserUserInfoMutate] = usePutUserUserInfoMutation();
  const deletionCodeMutation = usePostAccountDeletionEmailCodeMutation();
  const deletionMutation = usePostAccountDeletionMutation();
  const { logOut } = useAuthStore(({ logOut }) => ({ logOut }));
  const { isMotionEnabled } = useMotionPreference();
  const [name, setName] = useState('');
  const isAvatarUploading = avatarUpdateState === 'uploading';

  useEffect(() => () => {
    if (avatarCropSourceUrl)
      URL.revokeObjectURL(avatarCropSourceUrl);
  }, [avatarCropSourceUrl]);

  useEffect(() => () => {
    if (avatarPreviewUrl)
      URL.revokeObjectURL(avatarPreviewUrl);
  }, [avatarPreviewUrl]);

  useEffect(() => {
    if (avatarUpdateState !== 'success')
      return;
    const timer = window.setTimeout(setAvatarUpdateState, 2200, 'idle');
    return () => window.clearTimeout(timer);
  }, [avatarUpdateState]);

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

  const onOpenDeletion = async () => {
    setDeletionCode('');
    setHasReadDeletionNotice(false);
    setDeletionModalVisible(true);
    await refetchDeletionStatus();
  };

  const onSendDeletionCode = async () => {
    try {
      await deletionCodeMutation.mutateAsync();
      showAppError({ content: t('deletion.codeSent'), icon: 'success' });
    }
    catch (error) {
      showAppError(error, { fallbackMessage: t('deletion.codeSendFailed') });
    }
  };

  const onRequestDeletion = async () => {
    if (!hasReadDeletionNotice || !deletionCode.trim())
      return;
    try {
      const response = await deletionMutation.mutateAsync(deletionCode.trim());
      if (response.statusCode !== 200)
        return;
      logOut();
      navigate('/login', { state: { accountDeletionScheduledAt: response.data.deletionScheduledAt } });
    }
    catch (error) {
      showAppError(error, { fallbackMessage: t('deletion.requestFailed') });
    }
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
    if (!userInfo || isAvatarUploading)
      return;
    const files = await choseFile({ accept: 'image/*' });
    const file = files?.[0];
    if (!file)
      return;
    if (!file.type.startsWith('image/')) {
      showAppError({ content: t('info.avatarImageOnly'), icon: 'fail' });
      return;
    }
    setAvatarUpdateState('idle');
    setAvatarCropSourceUrl(URL.createObjectURL(file));
  };

  const handleAvatarCropConfirm = async (croppedImage: File) => {
    if (!userInfo || isAvatarUploading)
      return;
    setAvatarUpdateState('uploading');
    try {
      const formData = new FormData();
      formData.append('file', croppedImage);
      const uploadResponse = await uploadFile(formData);
      if (uploadResponse.statusCode !== 200 || !uploadResponse.data?.url)
        throw new Error(t('info.avatarUploadFailed'));
      await verifyUploadedAvatar(uploadResponse.data.url);

      const updateResponse = await putUserUserInfoMutate({
        avatar: uploadResponse.data.url,
        name: userInfo.name,
      });
      if (updateResponse.statusCode !== 200)
        throw new Error(t('info.avatarUploadFailed'));

      setAvatarPreviewUrl(URL.createObjectURL(croppedImage));
      setAvatarCropSourceUrl(undefined);
      setAvatarUpdateState('success');
    }
    catch (error) {
      setAvatarUpdateState('idle');
      showAppError(error, { fallbackMessage: t('info.avatarUploadFailed') });
    }
  };

  const avatarActionLabel = avatarUpdateState === 'uploading'
    ? t('info.avatarUploading')
    : avatarUpdateState === 'success'
      ? t('info.avatarUpdated')
      : t('info.changeAvatar');

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
            <button aria-busy={isAvatarUploading || undefined} className="relative border-0 bg-transparent disabled:cursor-wait" disabled={isAvatarUploading} onClick={() => void handleChangeAvatar()} type="button">
              <span className="flex h-[82px] w-[82px] items-center justify-center overflow-hidden rounded-full border-[3px] border-solid border-white bg-white shadow-ww-lg">
                <UserAvatar alt={userInfo.name} fallback="icon" name={userInfo.name} size={76} src={avatarPreviewUrl ?? userInfo.avatar} />
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-solid border-white bg-primary text-white shadow-ww-xs">
                {isAvatarUploading ? <LoaderCircle className={isMotionEnabled ? 'animate-spin' : undefined} size={14} /> : <Camera size={14} />}
              </span>
            </button>
            <h2 className="mt-4 text-[20px] font-black text-ww-ink">{userInfo.name}</h2>
            <p className="mt-1 text-[11px] font-semibold text-ww-mid">{userInfo.email}</p>
            <button aria-busy={isAvatarUploading || undefined} className="mt-4 min-h-11 rounded-full border border-solid border-white/90 bg-white/65 px-4 text-[11px] font-extrabold text-primary-deep shadow-ww-xs disabled:cursor-wait disabled:opacity-60" disabled={isAvatarUploading} onClick={() => void handleChangeAvatar()} type="button">
              {avatarActionLabel}
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
          <button className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[18px] border border-solid border-feedback-danger/50 bg-transparent text-[12px] font-bold text-feedback-danger" onClick={() => void onOpenDeletion()} type="button">
            <ShieldAlert size={16} />
            {t('deletion.open')}
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
      {avatarCropSourceUrl && (
        <AvatarImageCropDialog
          isSubmitting={isAvatarUploading}
          onCancel={() => {
            if (!isAvatarUploading)
              setAvatarCropSourceUrl(undefined);
          }}
          onConfirm={handleAvatarCropConfirm}
          sourceUrl={avatarCropSourceUrl}
        />
      )}
      {deletionModalVisible && (
        <div aria-labelledby="account-deletion-dialog-title" aria-modal="true" className="fixed inset-0 z-[1001] flex items-end bg-black/25 px-3 pt-12 backdrop-blur-[3px] sm:items-center sm:justify-center" role="dialog">
          <Surface className="max-h-full w-full max-w-[520px] overflow-hidden rounded-b-none px-5 py-5 sm:rounded-[24px]" material="floating">
            <div className="flex max-h-[calc(100vh-5rem)] flex-col">
              <h2 className="text-[18px] font-extrabold text-ww-ink" id="account-deletion-dialog-title">{t('deletion.title')}</h2>
              <div className="mt-3 min-h-0 space-y-3 overflow-y-auto pr-1 text-[13px] leading-6 text-ww-mid">
                <p>{t('deletion.intro')}</p>
                <ul className="m-0 space-y-2 pl-5">
                  <li>{t('deletion.item1')}</li>
                  <li>{t('deletion.item2')}</li>
                  <li>{t('deletion.item3')}</li>
                </ul>
                {deletionStatusResponse?.data && !deletionStatusResponse.data.canRequest && <p className="rounded-xl bg-feedback-danger/10 px-3 py-2 font-bold text-feedback-danger">{t('deletion.blocked', deletionStatusResponse.data.blockers)}</p>}
              </div>
              <label className="mt-4 flex items-start gap-2 text-[12px] font-semibold leading-5 text-ww-ink">
                <input checked={hasReadDeletionNotice} className="mt-1" onChange={event => setHasReadDeletionNotice(event.target.checked)} type="checkbox" />
                {t('deletion.acknowledge')}
              </label>
              <FormField className="mt-4" inputMode="numeric" label={t('deletion.code')} maxLength={6} onChange={setDeletionCode} placeholder={t('deletion.codePlaceholder')} value={deletionCode} />
              <button className="mt-3 h-11 rounded-[15px] border border-solid border-primary bg-white text-[13px] font-bold text-primary-deep disabled:opacity-50" disabled={deletionCodeMutation.isLoading} onClick={() => void onSendDeletionCode()} type="button">{t('deletion.sendCode')}</button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="h-11 rounded-[15px] border-0 bg-bg-gray text-[13px] font-bold text-ww-mid" onClick={() => setDeletionModalVisible(false)} type="button">{t('common:nav.cancel')}</button>
                <button className="h-11 rounded-[15px] border-0 bg-feedback-danger text-[13px] font-extrabold text-white disabled:opacity-50" disabled={!hasReadDeletionNotice || !deletionCode.trim() || !deletionStatusResponse?.data?.canRequest || deletionMutation.isLoading} onClick={() => void onRequestDeletion()} type="button">{t('deletion.submit')}</button>
              </div>
            </div>
          </Surface>
        </div>
      )}
    </div>
  );
};

export default UserInfo;

import { useRef, useState } from 'react'
import { MetricRow, ProfileAvatarVisual, ProfileCheckInVisual, ProfileSummaryVisual, ProfileTitleContent } from '@ww-bill/bill-ui'
import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { PageLoadingState } from '../../shared/ui/page-loading-state'
import { EmptyState } from '../../shared/ui/empty-state'
import './index.scss'
import { Page } from '../../shared/ui/page'
import { DesignIcon } from '../../shared/ui/design-icon'
import { useUserInfo } from '../../entities/user'
import { useAchievementSummary } from '../../entities/achievement'
import { useCheckIn } from '../../features/check-in'
import { useAuthGate, useAuthStore } from '../../features/auth'
import { errorMessage } from '../../shared/lib/errors'
import { resolvePublicMediaUrl } from '../../shared/lib/public-media-url'
import { Surface } from '../../shared/ui/surface'
import { AppButton } from '../../shared/ui/app-button'

export default function MinePage() {
  const checkInLock = useRef(false)
  const [checkInError, setCheckInError] = useState('')
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null)
  const isAuthenticated = useAuthGate()
  const userQuery = useUserInfo({ queryOptions: { enabled: isAuthenticated } })

  const achievementQuery = useAchievementSummary({ queryOptions: { enabled: isAuthenticated } })
  const checkInMutation = useCheckIn()

  async function handleCheckIn() {
    if (checkInLock.current || userQuery.data?.checkIn)
      return
    checkInLock.current = true
    setCheckInError('')
    try {
      await checkInMutation.mutateAsync()
    }
    catch (error) {
      setCheckInError(errorMessage(error))
    }
    finally {
      checkInLock.current = false
    }
  }

  useDidShow(() => {
    if (isAuthenticated)
      void userQuery.refetch()
  })

  function handleLogout() {
    useAuthStore.getState().logOut()
    void Taro.reLaunch({ url: '/pages/login/index' })
  }

  return (
    <Page className='page'>
      {userQuery.isLoading && <PageLoadingState label='正在加载账号信息…' />}
      {userQuery.isError && <EmptyState error title='加载失败' description={errorMessage(userQuery.error)} actionLabel='重试' onAction={() => void userQuery.refetch()} />}
      {userQuery.data && <>
        <Surface className='mine-profile' material='raised'>
          <ProfileSummaryVisual
            primitives={{ Box: View, Text }}
            avatar={<ProfileAvatarVisual primitives={{ Root: View, Box: View }} avatar={userQuery.data.avatar && failedAvatar !== userQuery.data.avatar ? <Image className='bill-profile-summary__avatar-image' mode='aspectFill' src={resolvePublicMediaUrl(userQuery.data.avatar, 'avatar-v1') ?? userQuery.data.avatar} onError={() => setFailedAvatar(userQuery.data?.avatar ?? null)} /> : <DesignIcon name='avatar-user' size={30} tone='category' />} />}
            name={userQuery.data.name || userQuery.data.username}
            title={<ProfileTitleContent primitive={Text} icon={<DesignIcon name='profile-title' size={12} tone='active' />} label={achievementQuery.data?.currentTitle?.name ?? '航程称号 · 开启你的航程'} />}
            action={<ProfileCheckInVisual primitive={userQuery.data.checkIn ? View : Button} interactive={!userQuery.data.checkIn} disabled={checkInMutation.isLoading} busy={checkInMutation.isLoading} onClick={userQuery.data.checkIn ? undefined : () => void handleCheckIn()} icon={<DesignIcon name='check-in' size={14} tone='active' />}>{userQuery.data.checkIn ? '已打卡' : checkInMutation.isLoading ? '正在打卡' : '立即打卡'}</ProfileCheckInVisual>}
            metrics={<MetricRow density='hero' primitives={{ Root: View, Cell: View, Label: Text, Value: View, Text }} items={[
              { key: 'keep', label: '连续打卡', suffix: '天', tone: 'primary', value: userQuery.data.checkInKeep ?? 0 },
              { key: 'all', label: '打卡总天数', suffix: '天', value: userQuery.data.checkInAll ?? 0 },
              { key: 'records', valueClassName: 'bill-profile-summary__record-count', label: '记账总笔数', suffix: '笔', tone: 'expense', value: userQuery.data.recordCount ?? 0 },
            ]}
            />}
          />
        </Surface>
      </>}
      {checkInError && <View className='mine-check-in-error error-text'>{checkInError}</View>}
      <AppButton variant='secondary' className='mine-logout' onClick={handleLogout}>退出登录</AppButton>
    </Page>
  )
}

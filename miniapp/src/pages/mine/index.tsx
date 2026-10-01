import { useState } from 'react'
import { MetricRow, ProfileSummaryVisual } from '@ww-bill/bill-ui'
import { Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import './index.scss'
import { Page } from '../../shared/ui/page'
import { DesignIcon } from '../../shared/ui/design-icon'
import { useUserInfo } from '../../entities/user'
import { useAuthGate, useAuthStore } from '../../features/auth'
import { errorMessage } from '../../shared/lib/errors'
import { resolvePublicMediaUrl } from '../../shared/lib/public-media-url'
import { Surface } from '../../shared/ui/surface'
import { AppButton } from '../../shared/ui/app-button'
import { EmptyState } from '../../shared/ui/empty-state'

export default function MinePage() {
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null)
  const isAuthenticated = useAuthGate()
  const userQuery = useUserInfo({ queryOptions: { enabled: isAuthenticated } })

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
      {userQuery.isLoading && <View className='state-panel'>正在加载账号信息…</View>}
      {userQuery.isError && <EmptyState error title='加载失败' description={errorMessage(userQuery.error)} actionLabel='重试' onAction={() => void userQuery.refetch()} />}
      {userQuery.data && <>
        <Surface className='mine-profile' material='raised'>
          <ProfileSummaryVisual
            primitives={{ Box: View, Text }}
            avatar={<View className='ww-user-summary-avatar bill-profile-summary__avatar'>{userQuery.data.avatar && failedAvatar !== userQuery.data.avatar ? <Image mode='aspectFill' src={resolvePublicMediaUrl(userQuery.data.avatar, 'avatar-v1') ?? userQuery.data.avatar} onError={() => setFailedAvatar(userQuery.data?.avatar ?? null)} /> : <DesignIcon name='avatar-user' size={30} tone='category' />}</View>}
            name={userQuery.data.name || userQuery.data.username}
            title={<Text>{userQuery.data.email || userQuery.data.username}</Text>}
            metrics={<MetricRow density='hero' primitives={{ Root: View, Cell: View, Label: Text, Value: View, Text }} items={[
              { key: 'keep', label: '连续签到', suffix: '天', tone: 'primary', value: userQuery.data.checkInKeep ?? 0 },
              { key: 'all', label: '累计签到', suffix: '天', value: userQuery.data.checkInAll ?? 0 },
              { key: 'records', valueClassName: 'bill-profile-summary__record-count', label: '累计记账', suffix: '笔', tone: 'expense', value: userQuery.data.recordCount ?? 0 },
            ]}
            />}
          />
        </Surface>
      </>}
      <AppButton variant='secondary' className='mine-logout' onClick={handleLogout}>退出登录</AppButton>
    </Page>
  )
}

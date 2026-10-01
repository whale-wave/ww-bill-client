import { Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { MetricRow, ProfileSummaryVisual } from '@ww-bill/bill-ui'
import { DesignIcon } from '../../shared/ui/design-icon'
import { useUserInfo } from '../../entities/user'
import { useAuthGate, useAuthStore } from '../../features/auth'
import { errorMessage } from '../../shared/lib/errors'
import { Surface } from '../../shared/ui/surface'
import { AppButton } from '../../shared/ui/app-button'
import './index.scss'

export default function MinePage() {
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
    <View className='page'>
      <Text className='page__title'>我的</Text>
      {userQuery.isLoading && <View className='state-panel'>正在加载账号信息…</View>}
      {userQuery.isError && <View className='state-panel'><Text className='error-text'>{errorMessage(userQuery.error)}</Text><AppButton variant='secondary' onClick={() => void userQuery.refetch()}>重试</AppButton></View>}
      {userQuery.data && <>
        <Surface className='mine-profile' material='raised'>
          <ProfileSummaryVisual
            primitives={{ Box: View, Text }}
            avatar={<View className='ww-user-summary-avatar bill-profile-summary__avatar'>{userQuery.data.avatar ? <Image mode='aspectFill' src={userQuery.data.avatar} /> : <DesignIcon name='avatar-user' size={30} tone='category' />}</View>}
            name={userQuery.data.name || userQuery.data.username}
            title={<Text>{userQuery.data.email || userQuery.data.username}</Text>}
            metrics={<MetricRow density='hero' primitives={{ Root: View, Cell: View, Label: Text, Value: View, Text }} items={[
              { key: 'keep', label: '连续签到', suffix: '天', tone: 'primary', value: userQuery.data.checkInKeep ?? 0 },
              { key: 'all', label: '累计签到', suffix: '天', value: userQuery.data.checkInAll ?? 0 },
              { key: 'records', label: '累计记账', suffix: '笔', tone: 'expense', value: userQuery.data.recordCount ?? 0 },
            ]}
            />}
          />
        </Surface>
      </>}
      <AppButton variant='secondary' className='mine-logout' onClick={handleLogout}>退出登录</AppButton>
    </View>
  )
}

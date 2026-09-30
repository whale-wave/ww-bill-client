import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useUserInfo } from '../../entities/user'
import { useAuthGate, useAuthStore } from '../../features/auth'
import { errorMessage } from '../../shared/lib/errors'
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
      {userQuery.isError && <View className='state-panel'><Text className='error-text'>{errorMessage(userQuery.error)}</Text><Button className='button button--plain' onClick={() => void userQuery.refetch()}>重试</Button></View>}
      {userQuery.data && <>
        <View className='card mine-profile'>
          <View className='mine-profile__avatar'>{(userQuery.data.name || userQuery.data.username || '我').slice(0, 1)}</View>
          <View><Text className='mine-profile__name'>{userQuery.data.name || userQuery.data.username}</Text><Text className='muted'>{userQuery.data.email || userQuery.data.username}</Text></View>
        </View>
        <View className='card row'><Text>累计记账</Text><Text className='money'>{userQuery.data.recordCount ?? 0} 笔</Text></View>
      </>}
      <Button className='button button--plain mine-logout' onClick={handleLogout}>退出登录</Button>
    </View>
  )
}

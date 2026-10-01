import { useState } from 'react'
import { Input, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useMutation } from '@tanstack/react-query'
import { login } from '../../entities/auth'
import { useAuthStore } from '../../features/auth'
import { errorMessage } from '../../shared/lib/errors'
import { Surface } from '../../shared/ui/surface'
import { AppButton } from '../../shared/ui/app-button'
import './index.scss'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const loginMutation = useMutation({ mutationFn: () => login(username.trim(), password) })

  useDidShow(() => {
    if (useAuthStore.getState().token)
      void Taro.switchTab({ url: '/pages/index/index' })
  })

  async function handleLogin() {
    if (!username.trim() || !password) {
      setFormError('请输入账号和密码')
      return
    }
    setFormError('')
    try {
      const result = await loginMutation.mutateAsync()
      if (!result.token)
        throw new Error('登录结果缺少令牌')
      useAuthStore.getState().startSession(result.token, result.userInfo?.userId ?? String(result.userInfo?.id ?? ''))
      await Taro.switchTab({ url: '/pages/index/index' })
    }
    catch (error) {
      setFormError(errorMessage(error))
    }
  }

  return (
    <View className='page login-page'>
      <Text className='login-page__brand'>鲸浪记账</Text>
      <Text className='muted'>登录已有账号，继续查看你的账本</Text>
      <Surface className='card login-page__form'>
        <Text>账号或邮箱</Text>
        <Input className='input-field' value={username} placeholder='请输入账号或邮箱' onInput={event => setUsername(event.detail.value)} />
        <Text>密码</Text>
        <Input className='input-field' value={password} password placeholder='请输入密码' onInput={event => setPassword(event.detail.value)} />
        {formError && <Text className='error-text'>{formError}</Text>}
        <AppButton loading={loginMutation.isLoading} disabled={loginMutation.isLoading} onClick={handleLogin}>登录</AppButton>
      </Surface>
    </View>
  )
}

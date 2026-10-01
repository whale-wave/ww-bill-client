import { useState } from 'react'
import { Image, Input, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { AuthPresentation, FormFieldVisual } from '@ww-bill/bill-ui'
import { useMutation } from '@tanstack/react-query'
import appLogo from '../../assets/brand/whale-logo.png'
import { DesignIcon } from '../../shared/ui/design-icon'
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
    <AuthPresentation
      primitives={{ Box: View, Header: View, Main: View, Text, Title: Text }}
      title='登录'
      logo={<Image className='bill-auth__logo-image' mode='aspectFill' src={appLogo} />}
      surface={(
        <Surface className='bill-auth__surface login-form' material='raised'>
          <FormFieldVisual label='账号或邮箱' prefix={<DesignIcon name='avatar-user' size={18} tone='category' />} primitives={{ Label: View, Box: View, Text }}>
            <Input className='bill-form-field__input' disabled={loginMutation.isLoading} value={username} placeholder='请输入账号或邮箱' onInput={event => setUsername(event.detail.value)} />
          </FormFieldVisual>
          <FormFieldVisual label='密码' prefix={<DesignIcon name='auth-lock' size={18} tone='category' />} primitives={{ Label: View, Box: View, Text }}>
            <Input className='bill-form-field__input' disabled={loginMutation.isLoading} value={password} password placeholder='请输入密码' onInput={event => setPassword(event.detail.value)} onConfirm={() => void handleLogin()} />
          </FormFieldVisual>
          {formError && <Text className='error-text'>{formError}</Text>}
          <AppButton loading={loginMutation.isLoading} disabled={loginMutation.isLoading} onClick={handleLogin}>登录</AppButton>
        </Surface>
      )}
    />
  )
}

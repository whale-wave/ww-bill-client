import { useState } from 'react'
import { Button, Image, Input, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { AuthFieldsVisual, AuthPrimaryActionContent, AuthPresentation, FormFieldVisual } from '@ww-bill/bill-ui'
import { useMutation } from '@tanstack/react-query'
import './index.scss'
import appLogo from '../../assets/brand/whale-logo.png'
import { DesignIcon } from '../../shared/ui/design-icon'
import { login } from '../../entities/auth'
import { useAuthStore } from '../../features/auth'
import { errorMessage } from '../../shared/lib/errors'
import { Surface } from '../../shared/ui/surface'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
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
          <AuthFieldsVisual primitive={View}>
          <FormFieldVisual label='账号或邮箱' prefix={<DesignIcon name='avatar-user' size={18} tone='category' />} primitives={{ Label: View, Box: View, Text }}>
            <Input className='bill-form-field__input' disabled={loginMutation.isLoading} value={username} placeholder='请输入账号或邮箱' onInput={event => setUsername(event.detail.value)} />
          </FormFieldVisual>
          <FormFieldVisual label='密码' suffix={!loginMutation.isLoading && <Button className='bill-form-field__suffix-action' aria-label={isPasswordVisible ? '隐藏密码' : '显示密码'} onClick={() => setIsPasswordVisible(value => !value)}><DesignIcon name={isPasswordVisible ? 'amount-hidden' : 'amount-visible'} size={18} /></Button>} prefix={<DesignIcon name='auth-lock' size={18} tone='category' />} primitives={{ Label: View, Box: View, Text }}>
            <Input className='bill-form-field__input' disabled={loginMutation.isLoading} value={password} password={!isPasswordVisible} placeholder='请输入密码' onInput={event => setPassword(event.detail.value)} onConfirm={() => void handleLogin()} />
          </FormFieldVisual>
          </AuthFieldsVisual>
          {formError && <Text className='error-text'>{formError}</Text>}
          <Button className='bill-auth-primary-action' disabled={loginMutation.isLoading} aria-busy={loginMutation.isLoading} onClick={handleLogin}><AuthPrimaryActionContent primitive={View} loading={loginMutation.isLoading}>登录</AuthPrimaryActionContent></Button>
        </Surface>
      )}
    />
  )
}

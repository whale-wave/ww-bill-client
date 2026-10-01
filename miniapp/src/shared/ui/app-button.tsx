import type { ComponentProps } from 'react'
import { Button, View } from '@tarojs/components'
import { ButtonContent, buttonPresentationClassNames, type ButtonAppearance } from '@ww-bill/bill-ui'

type AppButtonProps = Omit<ComponentProps<typeof Button>, keyof ButtonAppearance> & ButtonAppearance & {
  loadingLabel?: string
}

/** Taro events and native disabled behavior stay outside the shared visual. */
export function AppButton({ children, className, disabled, fullWidth = true, loading = false, loadingLabel, size = 'medium', variant = 'primary', ...props }: AppButtonProps) {
  return (
    <Button {...props} className={`${buttonPresentationClassNames({ fullWidth, loading, size, variant })}${className ? ` ${className}` : ''}`} disabled={disabled || loading} aria-busy={loading || undefined}>
      <ButtonContent fullWidth={fullWidth} loading={loading} loadingLabel={loadingLabel} primitive={View} size={size} variant={variant}>
        {children}
      </ButtonContent>
    </Button>
  )
}

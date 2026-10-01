import { Button, Text, View } from '@tarojs/components'
import { ActionMenuItemContent, ActionMenuLayout, type DesignIconName } from '@ww-bill/bill-ui'
import { DesignIcon } from './design-icon'

export function ActionMenu({ items, columns = 3, variant = 'gradient-tiles' }: {
  items: { key: string, label: string, icon: DesignIconName, onClick: () => void, tone?: string }[]
  columns?: number
  variant?: 'card' | 'gradient-tiles' | 'mine-actions'
}) {
  return <ActionMenuLayout columns={columns} variant={variant} primitive={View}>
    {items.map(item => <Button key={item.key} className={`bill-action-menu__item bill-action-menu__item--${variant} bill-action-menu__tone--${item.tone ?? 'blue'}`} onClick={item.onClick}>
      <ActionMenuItemContent icon={<DesignIcon name={item.icon} size={variant === 'gradient-tiles' ? 22 : 20} tone='category' />} label={item.label} tone={item.tone} variant={variant} primitives={{ Box: View, Text }} />
    </Button>)}
  </ActionMenuLayout>
}

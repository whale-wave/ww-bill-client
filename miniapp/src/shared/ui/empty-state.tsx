import { Button, Text, View } from '@tarojs/components'
import { EmptyStateVisual } from '@ww-bill/bill-ui'
import { DesignIcon } from './design-icon'

export function EmptyState({ title, description, actionLabel, onAction, error = false }: { title: string, description?: string, actionLabel?: string, onAction?: () => void, error?: boolean }) {
  return <EmptyStateVisual
    primitives={{ Box: View, Title: Text, Description: Text, Dot: View }}
    title={title}
    description={description}
    icon={<DesignIcon name={error ? 'empty-alert' : 'tab-detail-active'} size={46} tone={error ? 'expense' : 'ink'} />}
    accentIcon={onAction ? <DesignIcon name={error ? 'empty-retry' : 'tab-add'} size={19} tone='inverse' /> : undefined}
    action={onAction && actionLabel ? <Button className='bill-empty-state__action' onClick={onAction}>{actionLabel}</Button> : undefined}
  />
}

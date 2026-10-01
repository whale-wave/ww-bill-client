import Taro from '@tarojs/taro'
import { Button, View } from '@tarojs/components'
import { BottomNavigation, NavigationItemVisual, type DesignIconName } from '@ww-bill/bill-ui'
import './index.scss'
import { useAppearanceTemplate } from '../shared/model/appearance'
import { useOverlayStore } from '../shared/model/overlay'
import { DesignIcon } from '../shared/ui/design-icon'

const tabs: { path: string, label: string, icon: DesignIconName, prominent?: boolean }[] = [
  { path: '/pages/index/index', label: '明细', icon: 'tab-detail' },
  { path: '/pages/chart/index', label: '图表', icon: 'tab-chart' },
  { path: '/pages/record-create/index', label: '记账', icon: 'tab-add', prominent: true },
  { path: '/pages/discover/index', label: '发现', icon: 'tab-discovery' },
  { path: '/pages/mine/index', label: '我的', icon: 'tab-mine' },
]

function CustomTabBar() {
  const template = useAppearanceTemplate()
  const overlayCount = useOverlayStore(state => state.count)
  const pages = Taro.getCurrentPages()
  const currentPath = `/${pages[pages.length - 1]?.route ?? ''}`

  function handleSwitch(path: string) {
    if (path !== currentPath)
      void Taro.switchTab({ url: path })
  }

  function handleCreate() {
    void Taro.navigateTo({ url: '/pages/record-create/index' })
  }

  if (overlayCount > 0)
    return null

  return (
    <BottomNavigation
      activeIndex={tabs.findIndex(tab => tab.path === currentPath)}
      ariaLabel='主导航'
      className={`custom-tab-bar bill-theme--${template}`}
      itemCount={tabs.length}
      indicatorPrimitive={View}
      primitive={View}
    >
      {tabs.map(tab => (
        <Button
          key={tab.path}
          className={`ww-floating-dock__button${currentPath === tab.path ? ' ww-floating-dock__button--active' : ''}${tab.prominent ? ' ww-floating-dock__button--prominent' : ''}`}
          ariaLabel={tab.label}
          aria-selected={currentPath === tab.path}
          onClick={() => tab.prominent ? handleCreate() : handleSwitch(tab.path)}
        >
          <NavigationItemVisual
            icon={<DesignIcon name={tab.icon} size={tab.prominent ? 22 : 19} tone={tab.prominent ? 'inverse' : currentPath === tab.path ? 'active' : 'inactive'} />}
            isActive={currentPath === tab.path}
            label={tab.label}
            primitive={View}
            prominent={tab.prominent}
          />
        </Button>
      ))}
    </BottomNavigation>
  )
}

CustomTabBar.options = { addGlobalClass: true }

export default CustomTabBar

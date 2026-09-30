import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import './index.scss'

const tabs = [
  { path: '/pages/index/index', label: '明细', icon: '▤' },
  { path: '/pages/chart/index', label: '图表', icon: '▥' },
  { path: '/pages/discover/index', label: '发现', icon: '◇' },
  { path: '/pages/mine/index', label: '我的', icon: '◉' },
]

function CustomTabBar() {
  const pages = Taro.getCurrentPages()
  const currentPath = `/${pages[pages.length - 1]?.route ?? ''}`

  function handleSwitch(path: string) {
    if (path !== currentPath)
      void Taro.switchTab({ url: path })
  }

  function handleCreate() {
    void Taro.navigateTo({ url: '/pages/record-create/index' })
  }

  return (
    <View className='custom-tab-bar'>
      {tabs.slice(0, 2).map(tab => (
        <View key={tab.path} className={`custom-tab-bar__item ${currentPath === tab.path ? 'is-active' : ''}`} onClick={() => handleSwitch(tab.path)}>
          <Text className='custom-tab-bar__icon'>{tab.icon}</Text>
          <Text>{tab.label}</Text>
        </View>
      ))}
      <View className='custom-tab-bar__create' onClick={handleCreate}>
        <Text className='custom-tab-bar__plus'>＋</Text>
        <Text className='custom-tab-bar__create-label'>记账</Text>
      </View>
      {tabs.slice(2).map(tab => (
        <View key={tab.path} className={`custom-tab-bar__item ${currentPath === tab.path ? 'is-active' : ''}`} onClick={() => handleSwitch(tab.path)}>
          <Text className='custom-tab-bar__icon'>{tab.icon}</Text>
          <Text>{tab.label}</Text>
        </View>
      ))}
    </View>
  )
}

CustomTabBar.options = { addGlobalClass: true }

export default CustomTabBar

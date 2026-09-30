export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/chart/index',
    'pages/discover/index',
    'pages/mine/index',
    'pages/login/index',
    'pages/record-create/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f2f8fa',
    navigationBarTitleText: '鲸浪记账',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    custom: true,
    color: '#637987',
    selectedColor: '#23728e',
    backgroundColor: '#ffffff',
    list: [
      { pagePath: 'pages/index/index', text: '明细' },
      { pagePath: 'pages/chart/index', text: '图表' },
      { pagePath: 'pages/discover/index', text: '发现' },
      { pagePath: 'pages/mine/index', text: '我的' },
    ],
  },
})

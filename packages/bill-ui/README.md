# Bill UI

Web 与 Taro 共用的无状态展示组件。组件只接收展示数据与平台原语，不直接读取 store、调用接口或处理导航。

`RecordLine` 默认使用 Web 的 `div`/`span`；小程序通过 `primitives` 传入 Taro 的 `View`/`Text`。两端各自负责外层交互、分类图标、金额格式化和数据获取。样式随组件打包，通过各端的 CSS 变量提供主题色。

`MetricRow` 提供 Web 账单卡片和小程序图表/发现页的指标展示；`CategoryChoiceVisual` 提供记账分类的图标、标签、选中标记和子分类提示。两者只处理传入的展示数据，点击、动效、查询和选中状态继续留在各自应用。

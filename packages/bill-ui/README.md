# Bill UI

Web 与 Taro 共用的无状态展示组件。组件只接收展示数据与平台原语，不直接读取 store、调用接口或处理导航。

`RecordLine` 默认使用 Web 的 `div`/`span`；小程序通过 `primitives` 传入 Taro 的 `View`/`Text`。两端各自负责外层交互、分类图标、金额格式化和数据获取。样式随组件打包，通过各端的 CSS 变量提供主题色。

`MetricRow` 提供 Web 账单卡片和小程序图表/发现页的指标展示；`CategoryChoiceVisual` 提供记账分类的图标、标签、选中标记和子分类提示。两者只处理传入的展示数据，点击、动效、查询和选中状态继续留在各自应用。

`SurfacePresentation` 提供五种公共材质，Web 和 Taro 的本地 `Surface` 适配器只选择宿主元素。组件不接收事件或业务状态，交互由外层容器负责。

主题声明集中在 `src/styles/_token-values.scss` 的 Sass mixin 中。Web 原有样式入口引用这些声明并保留选择器和顺序；Taro 引入 `@ww-bill/bill-ui/tokens.scss`，使用适合小程序的主题选择器。两端共享 token 值与 Surface 材质规则，不代表全部页面已完成视觉对齐。

`Dashboard*Visual` 来自当前 Web 统计面板，接收标题、已格式化指标、图形和控件插槽。公共组件不持有查询、筛选或切换状态。折线和圆环几何由 bill-core 提供；Web 使用浏览器 SVG/CSS，小程序使用自己的 SVG 图片适配器。

字体族及文件清单由 `presentationFonts` 提供。Web 保留 Fontsource 分片加载，小程序负责 `loadFontFace`；完整字体托管在 Web `static/fonts`，不打入微信代码包。

# 鲸浪主题工坊

开发环境访问 `#/design-system` 可打开主题工坊。它是隔离的本地预览：不会初始化登录态、读取业务数据或写入账户外观配置。

左侧选择 Glass、Fresh、Minimal、MONO 或 Konsta iOS 候选；右侧的修改会保存到浏览器本地存储，并即时发送给中间 iframe。工坊当前注册可编辑视觉 token，覆盖品牌和文字颜色、表面与阴影、间距与圆角、财务/反馈语义色及六组图表色。颜色使用颜色选择器，尺寸使用范围滑杆，材质和阴影使用受控预设；不提供任意 CSS 文本输入。

Konsta iOS 候选是仅限工坊的浅色试验风格：它以鲸浪蓝为强调色，采用中性画布、玻璃 Chrome、边缘高光和轻阴影。它会映射到 Glass 基础模板以复用现有组件，但额外样式只由 iframe 的 `data-design-studio-template="konsta-ios"` 标识启用；它不属于账户外观接口，也不会被用户外观设置显示或保存。预览目录中的“风格组件”会集中展示玻璃材质、主次和禁用按钮、输入焦点、分段选择、分组列表与弹层入口；明细、图表、记账、发现、我的仍用于验证同一套 token 在业务场景中的表现。“导航示例”直接复用系统的资产概览预览页，滚动后可观察标题栏覆盖内容的半透明模糊玻璃。候选需要对应的本地样式支持，导出的 CSS/JSON 是调参记录，不表示可直接作为正式账号主题导入。

主色、正文、次要文字和弱化文字会自动同步到对应的 RGB 语义变量，确保 Tailwind 语义样式和传统 CSS 变量同时更新。财务色、反馈色和图表色保持独立，不会跟随主色改变。仅注册过且格式有效的 token 会进入预览和导出结果。

点击“检查预览元素”会启用只存在于 iframe 预览里的检查模式：鼠标移到元素上会显示蓝色边框，点击会锁定选中边框并阻止该次预览交互。右侧仅保留该元素在实际 CSS 规则中引用到的可编辑 token；`Esc` 或“退出元素检查”可返回全部 token。检查器同时识别 token 的语义别名，例如正文色对应的 `--ww-color-fg`。

“复制 JSON”输出未来可用于导入的 `version`、`name`、`baseTemplate` 与 `tokens`；“复制 CSS”输出同一份有效覆盖的 CSS 变量。清除按钮只清除当前基础模板的本地草稿。

## Konsta iOS 源码迁移

本轮直接参考本地 Konsta 5.4.0 源码，没有新增 npm 依赖，也没有改变 React 18、Tailwind 3 的构建体系。MIT 许可保存在 `docs/licenses/konsta-MIT.txt`。移植内容由 `StudioIosAdapters.tsx`、`ios-tabbar-gesture.ts` 和 `studio-ios.scss` 承载，仅由候选标识启用，不新增业务组件体系。

| 组件 | 源码参考 | 工坊适配 |
| --- | --- | --- |
| Badge / Chip | `BadgeClasses.js`、`ChipClasses.js` 与颜色定义 | 保留 16/20px badge、28px chip、填充/描边及删除入口；强调色接鲸浪品牌色 |
| Card | `CardClasses.js`、`CardColors.js` | 24px 圆角、16px 内容留白、头尾分割线，展区展示普通/阴影/描边；源组件没有独立动画 |
| List / Inputs | `ListClasses.js`、`ListItemClasses.js`、`ListInput.jsx`、`ListInputClasses.js` | 分组浅色表面、缩进细分割线、浮动标签与聚焦反馈；复用 FormField，保留输入事件、校验、禁用和只读 |
| Navbar | `Navbar.jsx`、`GlassClasses.js` 与 `glass.css` | 不用候选 Navbar 覆盖业务页面：明细、图表、发现、我的保留各自原有的顶部功能区。“导航示例”直接复用 `AssetOverviewPreviewPage` 这个系统资产概览页；工坊专用标识让其真实 `PageHeader` 在内容滚动后覆盖为透明、2px 背景模糊并向下渐隐的层，返回仍回到工坊业务场景。白色玻璃只用于返回按钮。Konsta default、medium、large 模式暂不接入 |
| Dialog / Sheet | `DialogClasses.js`、`SheetClasses.js`、玻璃色与阴影 | 400ms；Dialog 从 0.85 倍淡入，Sheet 底部滑入，50% 黑色遮罩淡入淡出 |
| FAB | `FabClasses.js`、`FabColors.js`、`glass.css` | 44px 胶囊/圆形玻璃边缘与 100ms 按压变色，使用鲸浪颜色；不新增展开菜单或指针跟随高光 |
| Progressbar | `Progressbar.jsx`、`ProgressbarClasses.js` | 6px 轨道、200ms 位移更新，百分比限制在 0–100 |
| Searchbar | `Searchbar.jsx`、`SearchbarClasses.js` | 聚焦时收缩输入区域、取消按钮 300ms 缩放渐显；取消清空并失焦，减轻外阴影 |
| Tabbar | `use-ios-tabbar-highlight.js`、`ToolbarPaneClasses.js` | 复用 BottomTabBarPresentation，通过 MotionValue 驱动跟手位移，松手选择最近标签；新增 pointercancel、单指所有权、卸载清理与重复点击抑制 |
| Toggle | `ToggleClasses.js` 与玻璃 thumb 阴影 | 64×28px 轨道、300ms 拇指移动、按压玻璃反馈；与 Tabbar 共用 1.12 倍按压参数，禁用时不响应 |

Dialog/Sheet 的动画由工坊原生 dialog 容器适配，以复现固定时长；内容仍复用 Surface、AppButton 和 SheetHeader。原生 dialog 提供焦点约束、背景 inert、Escape 和关闭后的焦点恢复。正式 AppSheet/确认弹窗入口没有改动。

候选材质遵循：普通卡片和列表以高对比浅色内容表面为主，不逐行加阴影；少量汇总卡保留轻阴影；导航、Tabbar、FAB 与操作控件使用半透明、背景模糊与内边缘高光。Searchbar 保留内边缘，外阴影降为轻量预设。五页仍复用原有数据和展示组件，记账备注使用相同输入适配，“我的”分组列表使用相同列表规则。

预览首先应用兼容 Glass 基础主题，再设候选标识，最后应用候选默认参数及用户覆盖。更新前的覆盖会完整移除；切换模板关闭弹层，退出卸载手势监听与动画。重置恢复候选默认参数，旧记录仍按原模板恢复。CSS 导出带样式依赖注释，JSON 导出包含 `requiresStyleSupport`，均保留候选标识和有效参数。

减少动态效果同时遵循系统偏好与工坊开关。工坊用相同 MotionProvider 偏好入口模拟应用减少动态效果：停用过渡和按压放大，弹层直接呈现最终状态；Tabbar 仍可拖动选中，但不做额外动画。工坊不读取账号设置或发送账号更新请求。

## 本轮验收记录（2026-09-18）

- 375px、430px 下组件展区、五页和资产概览导航示例共 14 组浏览器检查通过，无横向溢出或浏览器运行错误；截图检查金额、卡片、列表和图表内容，资产概览滚动后验证标题栏半透明模糊玻璃。
- 按钮禁用、输入编辑与浮动标签、分段切换、搜索聚焦/取消、开关、进度更新、Dialog/Sheet 进入退出、遮罩、Escape 和焦点恢复通过。
- 真实触摸拖动至最近标签后选择正确，取消/多指/禁用目标/重复点击与监听清理另有针对性测试。
- 系统减少动态效果及工坊开关通过；切换 Glass 后候选容器、弹层和覆盖参数移除，重返候选恢复默认值。
- 工坊界面实时调参、保存恢复、重置、JSON 导出与新增材质参数的元素检查通过；浏览器验证未产生业务写入请求。
- 26 项针对性测试、类型检查、构建、ESLint、Surface 契约及主题层叠检查通过。ESLint 保留项目已有警告，构建保留既有大分块提示；未运行完整测试集。
- 设计体系债务检查仍因四处已有颜色硬编码失败：NotificationDetailModal 两处、system-status-bar 一处、compatibility.stories 一处；本轮未修改这些文件或放宽检查基线。

可在运行中的开发服务上执行 `node scripts/verify-studio-ios.mjs` 复验，默认地址 `http://localhost:3231`，也可通过 `STUDIO_URL` 指定。截图及检查结果写入独立临时目录，命令完成时打印路径。该验证覆盖五页、组件交互、减少动态效果、隔离、调参保存恢复、导出与元素检查；实体设备上的手感仍需体验确认。

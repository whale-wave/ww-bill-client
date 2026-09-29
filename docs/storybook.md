# Storybook 组件预览

Storybook 是 client 的本地组件预览与交互回归入口，不连接账户、后端或原生设备。主题工坊仍用于整页 token 调整和导出。

## 使用方式

```sh
pnpm storybook
pnpm build:storybook
pnpm test:storybook
pnpm lint:type:storybook
```

首次运行浏览器回归前执行 `pnpm exec playwright install chromium`。若开发机已维护独立的 Chrome for Testing，可通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定其可执行文件。静态构建输出到 `storybook-static/`，该目录不会提交。

## 预览环境

- 工具栏可切换 Glass、Fresh、Minimal 主题，中文或英文，以及适老模式。
- 默认尺寸为 375 × 812；另提供 390 × 844、430 × 932 和桌面尺寸。
- 全局预览导入项目字体、Tailwind、Ant Design Mobile 覆盖与 i18n。每个 Story 仅注入它实际需要的 Router 或 Context。

## 当前 Story 覆盖

`Foundations/Core UI` 覆盖材质、按钮、金额、指标、进度、圆环、头像和设计图标。

`Shared/Forms and feedback` 覆盖表单、密码可见性、选择框、Action Field、空态、加载态、Sheet 与 Modal。

`Entities/Presentations` 覆盖资产、账单、预算、用户、账本模板与记录空态。

`Features/Presentation states` 覆盖家庭摘要、协作状态和标签排行的加载、成功与失败状态。

`Compatibility/Legacy UI` 集中展示旧 `Button`、`WwButton`、`Input`、`List`、`NavBar`、`TabList`、`Icon`、`Comment`、`Share`、`Mask`、`FixedPin` 和 `Gap`，方便维护既有页面。

记录编辑与定位、附件/通知媒体、账本切换和分类管理仍依赖设备或请求能力，不接入首期预览。接入这些组件前，先把调用收敛到可注入的接口。

## 编写约定

- Story 与组件放在同一 FSD 层，文件名为 `*.stories.tsx`。
- 使用固定、类型安全的示例数据和本地状态；不得访问真实接口。
- 包含可交互状态时，使用 `storybook/test` 写 `play` 断言。
- 弹层 Story 使用 `fullscreen` 布局，查询 Portal 时从 `document.body` 取元素。

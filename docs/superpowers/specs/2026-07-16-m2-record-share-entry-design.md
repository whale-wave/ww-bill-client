# M2 流水分享入口设计

日期：2026-07-16

## 背景

M2 的图表分类详情、消息子页、类别只读和登录保护已经完成。剩余用户可见缺口是 `/share` 已具备真实数据渲染、空态、保存图片、系统分享和复制链接能力，但没有业务页面主动进入该路由。

流水详情页 `/editing/:id` 已显示“分享”固定入口，却没有点击行为。该页面同时持有完整 `RecordEntry`，是最直接且语义清晰的接入点。

## 目标

- 接通流水详情页现有“分享”入口。
- 将当前真实流水传给 `/share`，正确展示金额、收支类型、分类、备注和日期。
- 保留分享页已有的保存图片、系统分享、复制链接、返回和无数据空态行为。
- 为入口的数据流增加自动化回归测试，并完成浏览器端到端验收。

## 非目标

- 不在账单列表增加快捷分享、长按菜单或更多菜单。
- 不新增服务端接口，也不改变流水或分享数据结构。
- 不实现类别新增、编辑、删除或隐藏。
- 不实现消息未读数、摘要接口或社区话题分享。
- 不重构通用分享 feature；当前只有一个明确的账单分享调用方。

## 方案选择

### 采用：通过 React Router state 传递流水

点击流水详情页的固定入口后调用：

```ts
navigate(ROUTES_PATH.SHARE.getPath(), {
  state: { record: state },
});
```

优点：

- 复用现有 `SharePage` 对 `location.state.record` 的支持。
- 业务导航时不会把金额、备注等内容提前写入地址栏。
- 不引入新的中间 store、Context 或服务端状态。
- 改动集中在流水详情页，符合当前 FSD 边界。

### 未采用：入口直接构造 query

该方案便于复制当前地址，但会在普通站内导航时把流水内容放进 URL，并重复 `SharePage` 已有的归一化和 URL 构造职责。

### 未采用：抽取多入口通用分享 feature

当前只有流水详情页存在明确入口。提前抽取通用 feature 会增加接口和目录层级，却没有第二个真实消费者。

## 架构与职责

### `src/pages/record/editing/list.tsx`

- 继续负责展示流水详情字段和固定分享入口。
- 使用 `useNavigate()` 与 `ROUTES_PATH.SHARE.getPath()`。
- 点击入口时只传递 `{ record: state }`，不在此处转换分享字段。

### `src/pages/share/SharePage.tsx`

- 保持现有职责，不为 M2 增加新的分支。
- 从 `location.state.record` 读取来源，并交给 `normalizeShareData()`。
- 站内分享卡使用 state 数据；对外分享时由 `buildShareUrl()` 生成可独立打开的 query 链接。

### `src/pages/share/model/shareUtils.ts`

- 保持唯一的分享数据归一化边界。
- 继续兼容完整 `RecordEntry` 中的嵌套 `category.name`、`amount`、`type`、`remark` 和 `time`。

## 数据流

1. 用户从明细列表进入 `/editing/:id`。
2. `EditingPage` 从接口响应或路由 state 得到当前 `RecordEntry`。
3. 用户点击“分享”。
4. 详情页导航到 `/share`，并传递 `{ record: RecordEntry }`。
5. `SharePage` 调用 `normalizeShareData(record)`，生成 `ShareData`。
6. `ShareCanvas` 渲染真实账单卡片。
7. 用户选择保存图片，或通过系统分享/复制链接向外分享。
8. 对外链接使用 query 参数，可在没有原路由 state 的新页面中恢复分享卡片。

## 异常与边界行为

- 当前流水缺少金额、类型或分类时，`normalizeShareData()` 返回 `null`，沿用 `/share` 现有空态。
- 直接访问 `/share` 且无 state/query 时，沿用明确空态。
- 保存图片失败、系统分享取消、系统分享失败和剪贴板不可用时，沿用现有 Toast 反馈。
- 详情数据仍在加载期间不新增分享占位状态；入口只在现有详情内容能够渲染后可操作。
- 返回按钮继续使用 `navigate(-1)`，回到原流水详情。

## 测试设计

### 自动化测试

- 新增流水详情分享入口组件测试：渲染真实形状的 `RecordEntry`，点击“分享”，断言导航目标为 `/share`，并断言 state 精确为 `{ record }`。
- 继续运行 `test/pages/share/share-utils.test.ts`，证明完整流水可以归一化且生成的外部分享 URL 可恢复必需字段。
- 运行全部 Vitest、TypeScript、ESLint 和 production build 门禁。

### 浏览器验收

- 从真实流水详情点击“分享”，进入 `/share`。
- 核对金额、收支类型、分类、备注和日期与原流水一致。
- 验证返回能回到同一流水详情。
- 验证保存图片成功。
- 验证系统分享；当前环境不支持时验证复制链接提示。
- 打开生成的 query 分享链接，确认无原始 state 时仍能渲染。
- 直接访问无参数 `/share`，确认仍显示空态。

## 验收标准

- 流水详情页现有“分享”入口可点击且进入 `/share`。
- 分享页展示当前流水的真实数据，不出现硬编码业务样例。
- 外部分享 URL 可以独立恢复同一组必需分享字段。
- 所有既有分享异常态保持可用。
- 新增回归测试经历 RED → GREEN，全部质量门禁通过。
- 路线图将 M2 标记为完成，并记录 fresh gate 与浏览器证据。

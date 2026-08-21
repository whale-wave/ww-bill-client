# UI 交互组件收敛与账本视觉数据流统一

## 任务信息

- 项目：`ww-bill-client`
- 任务类型：前端 UI 组件收敛、账本视觉数据流修复、交互状态测试
- 执行方式：单 Agent 连续执行，不创建 PR
- 交付方式：按 Commit 1–5 拆分，每个 commit 独立可 review、可回滚
- 视觉基准：项目内 `DESIGN.md`
- 目标平台：移动端，至少验证 375px viewport

## 最终目标

解决同一种业务语义由多个 UI 实现导致的体验不一致：

```text
同一种业务语义
        ↓
多个组件和页面实现
        ↓
不同页面出现不同交互和视觉
```

本次任务重点不是新增大量组件，而是：

- 识别已有能力
- 收敛组件入口
- 保持现有页面行为
- 修正账本视觉数据流
- 补足 loading、disabled、error、focus 和多语言验证

## 非目标

- 不修改旧的 `shared/ui/button` 实现
- 不一次性替换全项目所有 Button
- 不新增 `AppInput`
- 不把用户头像、账本图标、资产图标统一成同一个 Avatar
- 不为了抽象而修改无关页面
- 不把模板选择视觉和已创建账本视觉强行合并
- 不引入 Playwright 或截图基线，除非执行前已有明确的浏览器回归基础设施
- 不通过页面名称、路由名称或临时 context 参数判断默认账本

## 执行前置检查

在修改任何代码前完成以下检查，并在 Agent 汇报中记录结果。

### 版本和运行状态

- 确认当前 branch、HEAD commit 和工作区是否有用户未提交修改
- 确认截图对应的 build/version/locale
- 用当前 HEAD 在中文和英文环境分别复现目标页面
- 确认截图中的 `settings.xxx` 是否仍能在当前版本出现
- 不要根据旧截图直接创建不存在的翻译 key

### 现有能力清单

至少检查：

- `src/shared/ui/button/`
- `src/shared/ui/form-field/`
- `src/shared/ui/input/`
- `src/pages/asset/ui/IconBlock.tsx`
- `src/entities/ledger/ui/LedgerVisualIcon.tsx`
- `src/entities/ledger/types.ts`
- `src/features/ledger-switcher/`
- `src/features/ledger-collaboration/`
- `src/shared/i18n/`
- `test/shared/ui/`
- `test/shared/i18n/`

特别注意：当前 `FormField` 已被登录、密码、邮箱、成员详情等页面使用，并且现有 API 是受控输入组件。不要未经兼容设计就把它直接改成只接受 `children` 的视觉外壳。

### UI inventory

建立或至少在执行报告中记录以下映射：

| 页面/组件 | 当前按钮 | 当前输入 | 当前账本/资产图标 | i18n namespace | 目标 commit |
| --- | --- | --- | --- | --- | --- |
| `LedgerSettingsPage` | `antd-mobile Button` | 原生 input | 页面 icon map | `ledger` | 1、2 |
| `AssetFormInfoPage` | `antd-mobile Button` | `Form.Item` + `Input` | 资产表单图标 | `asset` | 1、3 |
| `LedgerSwitcherPanel` | 原生 button | 无 | 默认 logo / `WalletCards` | `ledger` | 2 |
| `LedgerCard` | 原生 button | 无 | `LedgerVisualIcon` | `ledger` | 2 |
| `LedgerDetailPage` | 原生 button | 无 | `LedgerVisualIcon` + fallback | `ledger` | 2 |
| `LedgerSummaryBlock` | 无 | 无 | 写死 custom visual | `ledger` | 2 |
| 成员管理 | 原生 button | `FormField` | 用户 avatar | `ledger` / `household` | 5 |

## 领域和组件边界

### Button

新增 `src/shared/ui/app-button/`，作为新的业务按钮契约。

禁止修改旧的 `src/shared/ui/button/`，禁止通过增加 page special case 继续扩展旧组件。

`AppButton` 至少需要支持：

- `variant`: `primary`、`secondary`、`danger`、`ghost`
- `type`: `button`、`submit`、`reset`
- `loading`
- `disabled`
- `fullWidth`
- `loadingLabel`
- `aria-busy`
- `focus-visible`
- loading 时自动禁止重复点击
- loading 时同时表现为 disabled

组件不能硬编码中文 loading 文案。loading 文案由页面通过 `loadingLabel` 或 children 状态传入。

### FormField

优先保留现有 `FormField` 的受控输入能力和已有消费者，不做破坏性 API 替换。

资产表单需要和 `antd-mobile Form.Item` 共存，因此需要先选择一种兼容方案：

1. 以向后兼容方式扩展现有 `FormField`；或
2. 从现有 `FormField` 抽取内部视觉 frame，再让资产表单复用该 frame；或
3. 如果前两种方案会污染现有 API，增加职责明确的 `FormFieldShell`/`FieldFrame`，并在执行报告中说明为什么它不是平行输入组件。

无论采用哪种方案，都必须保持：

- `antd-mobile Form.Item` 负责 value、validation、submit
- 表单视觉层负责 label、description、error、focus 和 disabled 表现
- 不出现两套 value/onChange 状态源

### Avatar / Ledger / Asset 图标

三个语义分开：

| 类型 | 语义 | 默认形状 |
| --- | --- | --- |
| `UserAvatar` / 成员头像 | 用户身份 | 圆形 |
| `LedgerIcon` | 账本空间 | 非头像语义，使用账本容器样式 |
| `IconBlock` / 资产图标 | 资产类别 | 非头像语义，保持现有圆角方形容器 |

当前已有 `IconBlock` 和 `LedgerVisualIcon`。先重构和收敛已有入口，只有现有组件无法表达目标能力时才新增组件。

## Commit 1：组件契约收敛 + 首批迁移

Commit message：

`refactor(ui): introduce shared ui contracts and migrate first consumers`

### 目标

建立新的按钮契约和兼容的表单视觉接入方式，并立即在两个真实页面中验证；本 commit 尽量保持原有颜色、padding、border、spacing 和页面布局不变。

### 包含内容

- 新增 `AppButton`
- 完成 `AppButton` 单元测试
- 确定 `FormField` 与 `antd-mobile Form.Item` 的兼容方案
- 迁移 `LedgerSettingsPage` 的基本设置保存和偏好保存按钮
- 迁移 `AssetFormInfoPage` 的保存按钮
- 如确有必要，接入表单视觉 wrapper，但不在本 commit 做明显视觉重设计

### 不包含内容

- 不修改旧 `shared/ui/button`
- 不处理账本图标数据流
- 不做资产输入框的视觉层级优化
- 不迁移全项目其他保存按钮

### 验收

- `AppButton` 支持 submit 和普通 button 两种语义
- loading 时不可重复提交
- disabled 和 loading 状态可被测试断言
- `LedgerSettingsPage` 和 `AssetFormInfoPage` 行为不回归
- 现有 `FormField` 消费者类型检查通过

## Commit 2：账本视觉 resolution 统一

Commit message：

`refactor(ledger): unify ledger visual resolution`

### 目标

解决默认账本在切换弹窗、列表、详情和协作摘要中显示不同图标的问题。

统一渲染链路：

```text
page
  ↓
LedgerIcon / LedgerVisualIcon
  ↓
resolveLedgerVisual
```

页面不得自行判断 `SYSTEM_DEFAULT`。

### 类型前置条件

当前 `LedgerSummary` 缺少 `kind`，无法可靠识别系统默认账本。执行 Commit 2 前必须确认 API 响应是否包含该字段。

优先方案：给 `LedgerSummary` 增加 `kind`，必要时增加 `templateKey`，并同步客户端 API 类型。若后端响应实际没有字段，不允许在客户端猜测，也不允许增加 `page`/`context` 参数绕过问题；应先报告跨仓库 API contract 依赖。

### resolver 规则

`resolveLedgerVisual` 必须是纯函数，返回类型安全的判别联合，而不是宽泛的 `type: string` 和 `value: string`。

规则固定为：

1. `SYSTEM_DEFAULT` 永远返回 `system-logo / whale-wave`，覆盖 `iconKey` 和 `templateKey`
2. 自定义账本存在合法 `iconKey` 时返回 `ledger-icon / iconKey`
3. 自定义账本没有合法 `iconKey`、但有合法 `templateKey` 时返回 `template-icon / templateKey`
4. 两者都未知或缺失时返回稳定 fallback

### 先写测试

新增 resolver 测试，至少覆盖：

- 系统默认账本携带任意 `iconKey`，仍返回 Whale Wave logo
- 自定义账本使用合法 `iconKey`
- 自定义账本使用 `templateKey` fallback
- unknown `iconKey`
- missing `templateKey`
- 缺失可选字段

### 迁移范围

- `LedgerSwitcherPanel`
- `LedgerCard`
- `LedgerDetailPage`
- `LedgerSummaryBlock`
- ledger collaboration 相关展示

### 明确不强制迁移的场景

模板选择页和已创建账本不是同一个领域：

- `LedgerCreatePage`
- `LedgerTemplateCard`

这些页面展示的是“可创建模板”，可以继续使用模板专用 resolver 或直接使用 `templateKey`。不要让已创建账本 resolver 污染模板视觉。

### 验收

- 系统默认账本在所有已迁移入口使用同一 Whale Wave logo
- 自定义账本优先使用 `iconKey`
- unknown key 有稳定 fallback
- 页面不再出现 `WalletCards`、`BillOutline` 等不符合数据的隐式 fallback
- resolver 测试和相关页面测试通过

## Commit 3：资产输入视觉层级优化

Commit message：

`fix(asset): improve asset form field visual hierarchy`

### 范围

只处理 `AssetFormInfoPage` 及其本次确定的表单视觉 wrapper。

### 目标

让用户一眼识别输入区域，而不是把输入内容误认为普通展示文本。

### 状态要求

默认态：

- 明确边界
- 足够的背景对比度
- 合理 padding
- placeholder 与正文有清晰层级

focus：

- 主色 border 或等价 focus ring
- 不依赖颜色唯一表达焦点
- 键盘操作可以看到 focus-visible

error：

- 明确错误文案
- 错误颜色符合项目语义色
- 错误状态与字段关联

disabled：

- 视觉明显灰化
- 禁止编辑
- 不把 disabled 误认为 loading

其他：

- 余额字段使用数字键盘
- 编辑和新增共用同一套输入视觉
- 不新增 `AppInput`

## Commit 4：递归 i18n parity 校验

Commit message：

`fix(i18n): validate recursive locale parity`

### 目标

阻止缺失翻译 key 和 key 原样进入 UI。

### 实现要求

- 在 `src/shared/i18n/` 下增加可复用的递归 key flatten helper
- 比较 `zh-CN` 与 `en` 的完整路径集合
- 输出 missing keys 和 extra keys
- 复用现有 locale 测试模式，不在每个测试文件中重复递归逻辑
- 增加测试环境的 `missingKeyHandler` 或等价检测
- 检查渲染结果中是否出现类似 `settings.xxx`、`ledger.xxx`、`asset.xxx` 的 raw key

比较的 key 应为完整路径，例如：

- `ledger.settings.preferencesHint`
- `asset.form.save`
- `settings.overview.description`

不要只比较一级 `Object.keys`。

## Commit 5：交互和状态覆盖

Commit message：

`test(ui): add interaction and state coverage`

### 目标

补足组件和页面行为测试，不承诺当前项目尚未具备的像素级截图回归。

### 页面范围

- 我的偏好
- 添加资产
- 编辑资产
- 账本切换
- 账本详情
- 成员管理

### 通用状态

- 默认
- focus
- error
- loading
- disabled
- 长文本
- 中文
- 英文

### Ledger 特殊状态

- `SYSTEM_DEFAULT`
- custom ledger
- valid `iconKey`
- unknown `iconKey`
- missing `templateKey`
- single member
- multiple members

### 测试边界

当前项目已有 Vitest/jsdom 测试。优先增加：

- render 断言
- click/submit 交互断言
- loading 到 success/error 的状态转换
- disabled 防重复提交
- resolver 纯函数测试
- locale parity 测试

只有在明确引入浏览器截图工具、baseline 和 CI diff 后，才能把本 commit 改名为 visual regression。

## 最终验收矩阵

| 页面 | 中文 | 英文 | 默认 | focus | error | loading | disabled | 长文本 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 我的偏好 | ✓ | ✓ | ✓ | - | ✓ | ✓ | ✓ | ✓ |
| 添加资产 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 编辑资产 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 账本切换 | ✓ | ✓ | ✓ | ✓ | ✓ | - | - | ✓ |
| 账本详情 | ✓ | ✓ | ✓ | - | ✓ | - | - | ✓ |
| 成员管理 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

账本还必须覆盖：

- `SYSTEM_DEFAULT`
- custom ledger
- unknown `iconKey`
- missing `templateKey`
- single member
- multiple members

## 每个 Commit 的执行纪律

每个 commit 都必须遵守：

1. 修改前搜索已有组件、类型、测试和调用方
2. 不因为单个页面需求新增平行组件
3. 如果已有组件能力不足，优先兼容扩展或迁移已有入口
4. 完成实现后运行针对性测试
5. 修改代码文件后运行 `npx eslint --fix <修改的代码文件>`
6. 跨模块类型变更后运行 `pnpm lint:type`
7. 较大改动或准备交付时运行 `pnpm lint`、`pnpm lint:type`、`pnpm test`
8. 每个 commit 前执行 `git diff --check`
9. 不自动创建 PR、不自动 push、不覆盖用户已有未提交修改

## 每个 Commit 的汇报格式

完成一个 commit 后，Agent 必须汇报：

- commit hash 和 commit message
- 修改文件列表
- 新增或修改的组件/API
- 已运行的验证命令及结果
- 尚未处理的风险
- 是否发现跨仓库 API contract 依赖
- 下一步准备执行的 commit

## 交付完成标准

只有同时满足以下条件，任务才算完成：

- 5 个 commit 的边界和 message 符合本计划
- 旧 `shared/ui/button` 未被扩展或全仓替换
- 未新增 `AppInput`
- `FormField` 既有消费者没有被破坏
- 账本 visual resolver 有类型和测试覆盖
- `LedgerSummary` 的 `kind` contract 已确认
- 默认账本所有目标入口使用 Whale Wave logo
- 资产表单具备清晰的 default/focus/error/disabled 状态
- zh-CN/en 递归 key parity 通过
- raw i18n key 检查通过
- lint、typecheck、test 通过
- 工作区没有被任务意外覆盖或清理

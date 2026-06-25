# ww-bill-client 前端整理与里程碑计划

更新时间：2026-06-25

## 目标

本计划用于整理 `ww-bill-client` 当前前端实现状态，明确还没有实做完成的功能、代码与文件组织的主要问题，并给出可分阶段执行的里程碑。执行时应遵守项目现有边界：不引入新的 UI 框架，不重建分层体系，优先沿用 `src/api`、`src/hooks/query`、`src/hooks/mutation`、`src/store`、`src/pages`、`src/components` 的既有职责。

## 当前功能地图

已注册路由集中在 `src/router/index.tsx`，文档流程集中在 `docs/flowcharts/feature-flows.md`。

| 模块 | 已有页面/路由 | 当前状态 |
| --- | --- | --- |
| 启动与明细 | `/`, `/detail` | 已有首屏跳转、明细列表、金额展示配置等基础流程 |
| 记账与编辑 | `/bookkeeping`, `/editing/:id`, `/record-calendar`, `/search-record` | 已有新增、编辑、删除、日历、搜索等核心流程 |
| 账单与导出分享 | `/bill`, `/export-data`, `/share` | 账单和导出已有实现，分享页仍偏示例/占位 |
| 预算 | `/budget`, `/budget/category/:type` | 已有总预算、分类预算、增删改清等流程 |
| 资产 | `/asset`, `/asset/add-account`, `/asset/add-form/:id?`, `/asset/detail/:id`, `/asset/chart` | 新实现较完整，React Query/key/mutation 相对规范 |
| 图表 | `/chart`, `/chart/category` | 首页图表已有实现，分类详情页未完成 |
| 发票助手 | `/invoice`, `/invoice/create`, `/invoice/:id`, `/invoice/:id/edit` | 新实现较完整，列表/详情/新增/编辑/删除闭环存在 |
| 固定支出 | `/fixed-expenses`, `/fixed-expenses/create`, `/fixed-expenses/:id`, `/fixed-expenses/:id/edit` | 新实现较完整，表单与缓存失效较规范 |
| 发现与社区 | `/discovery`, `/community`, `/community/personal/:id`, `/post-topic`, `/topic-detail/:id` | 社区基础浏览/发帖/评论存在，但数据层与分享交互未收敛 |
| 消息 | `/message`, `/message/new-follow`, `/message/comment-list`, `/message/system-notify` | 子页面存在，消息首页仍为空态且无入口 |
| 我的与设置 | `/mine`, `/settings`, `/user-info`, `/password`, `/settings/email/change/*` | 基础用户信息、签到、设置存在，多处入口仍占位 |
| 认证 | `/login`, `/sign`, `/forget-password/*` | 登录、注册、找回密码基础流程存在 |

## 未完成和占位功能

### P0 必须优先处理

1. 图表分类详情页未实现

- 证据：`src/pages/Chart/ChartCategory/ChartCategory.tsx` 只渲染占位文本。
- 关联断点：`src/pages/Chart/ChartHome/components/RankingList.tsx` 的分类排行榜点击仅提示“敬请期待”。
- 期望：从图表首页分类排行进入 `/chart/category`，携带统计维度、收支类型、分类 ID，重新请求或复用 `/chart` 数据并展示分类明细列表。

2. 分享页仍是示例数据和半成品交互

- 证据：`src/pages/Share/ShareCanvas.tsx` 使用硬编码展示数据，`src/pages/Share/ShareBtn.tsx` 的“微信”按钮没有事件。
- 期望：分享页从路由 state/query 或业务查询读取真实账单/流水/统计数据；保存图片流程需要错误处理；暂不能做微信分享时应隐藏入口或改为明确的系统分享能力。

### P1 影响主流程体验

1. 消息首页没有功能入口

- 证据：`src/pages/Message/index.tsx` 只展示空态，但路由已注册 `/message/new-follow`、`/message/comment-list`、`/message/system-notify`。
- 期望：消息首页提供新关注、评论、系统通知入口，并展示未读/最近消息摘要；没有数据时展示可操作空态。

2. 类别设置未完成

- 证据：`src/pages/bookkeeping/CategorySettings/index.tsx` 只是占位；`src/pages/settings/index.tsx` 中“类别设置”没有 path/onClick。
- 期望：补齐收入/支出分类查看、排序、新增、编辑、隐藏或删除策略；如果后端能力不足，应先隐藏入口。

3. 登录保护边界不足

- 证据：当前只保护 `/user-info`、`/password`、`/post-topic`，大量需要 token 或用户数据的页面未包 `LoginGuard`。
- 建议纳入保护：`/mine`、`/settings`、`/message/*`、`/export-data`、`/budget`、`/asset/*`、`/invoice/*`、`/fixed-expenses/*`、`/bill`、`/share`、`/record-calendar`、`/search-record`。
- 期望：统一定义需要登录的业务路由，避免未登录时出现空数据、接口 401 后跳转闪烁或页面运行时错误。

### P2 可排期完善

1. “敬请期待”入口需要收敛

- 位置：`src/pages/mine/index.tsx` 的我的徽章、我的积分、邀请好友；`src/pages/mine/components/BotomList/BottomList.tsx` 的意见反馈；`src/pages/Discovery/components/CommonFunctionCard.tsx` 的汇率换算器。
- 处理策略：有明确近期计划的改成可见禁用态并记录需求；无近期计划的从入口隐藏。

2. 社区分享交互是 console 占位

- 位置：`src/pages/community/ItemList.tsx`、`src/pages/TopicDetail/Main.tsx`。
- 期望：实现可用分享、复制链接、保存图片，或移除分享入口。

3. 社区导航关系不清晰

- 证据：底部导航中的社区项被注释，`/community` 页面仍使用 `TabBar active={3}` 高亮发现。
- 期望：明确“发现”和“社区”是同一个一级入口还是两个入口；如果社区保留，TabBar、路由、文案需要一致。

## 代码与文件组织问题

### 数据层

1. `request` 错误契约不稳定

- `src/utils/request.ts` 在非 timeout 且无 `response` 的网络错误场景会继续读取 `response.data.statusCode`。
- timeout 分支可能返回原始 `response`，与 API 函数声明的 `SuccessResponse<T>` 不一致。
- 建议：统一错误返回或统一 throw，保证 API 调用方只处理一种契约。

2. 社区/topic 领域没有完整接入 React Query mutation 体系

- 直接 API 调用集中在 `src/pages/community/ItemList.tsx`、`src/pages/TopicDetail/index.tsx`、`src/pages/PostTopic/index.tsx`、`src/pages/community/Personal.tsx`。
- 当前 `topicKeys` 只有 list/comment，缺少 detail/user profile 等 key。
- 建议：补 `useGetTopicDetailQuery`、`useGetTopicUserInfoQuery`、`usePostTopicMutation`、`usePutTopicLikeMutation`、`usePostTopicCommentMutation`，统一失效 `topicKeys.lists()`、detail、comment、user/follow 相关缓存。

3. Query hook 入参与导出不统一

- 部分 hook 把 options 声明为可选但内部使用 `options!`。
- `src/hooks/query/index.ts` 漏导出 `useGetRecordBillQuery`、`useGetTopicIdCommentQuery`，导致页面深路径导入。
- 建议：统一成 `{ params, queryOptions }`；必需参数不可标成可选；页面统一从 `@/hooks` 或 `@/hooks/query` 导入。

4. 类型边界松散

- `src/api/tools.ts`、`src/api/topic.ts`、`src/api/user.ts`、`src/api/user-email.ts` 仍有 `any`。
- store 自定义 `UserInfo` 与 `src/api/user.ts` 的 `UserInfo` 重复且字段不一致。
- 建议：优先替换 API 边界的 `any`，再清理页面内部 `any`。

### 页面和路由

1. `ROUTES_PATH` 覆盖不完整

- `src/constants/route.ts` 只覆盖账单、预算、资产、图表、固定支出。
- 许多导航仍散落字符串：`/message`、`/settings`、`/invoice`、`/search-record`、`/community` 等。
- 建议：先补齐常用业务路由常量，再分批替换跳转字符串。

2. 命名遗留

- `/cateGory` 和 `CateGory` 大小写异常。
- `Detail_editing` 使用下划线和大写混合。
- `BotomList` 拼写错误。
- 建议：低风险情况下新增兼容路由再迁移命名；避免一次性大范围改路径造成历史链接失效。

### 组件和工具

1. 存在两套近似基础组件

- `src/components/FixedPin` 与 `src/components/ui/fixed-pin`
- `src/components/icon` 与 `src/components/ui/icon`
- `src/components/Input` 与 `src/components/ui/input`
- 建议：选择一条主线，迁移引用后删除或隔离旧实现与 demo。

2. 工具函数重复

- `src/components/utils/index.ts` 和 `src/utils/component.ts` 都有 `composeExportComponent`。
- 建议：保留 `src/utils/component.ts` 或组件专用工具之一，统一导出入口。

### 工程卫生

1. 类型检查通过，lint 未通过

- `pnpm lint:type` 当前通过。
- `pnpm lint` 当前失败：636 个问题，491 个 error，145 个 warning，其中大量格式/import 问题可自动修复。
- 主要类别：import 排序、type-only import、格式缩进、React hooks 依赖、render purity、重复声明、`shims.axios.d.ts` 规则问题。

2. 测试体系缺失

- `package.json` 没有 `test` 脚本。
- 未发现 `*.test.*`、`*.spec.*`、`__tests__`。
- 虽有 `c8` 依赖，但没有测试入口。

3. 构建产物规则需要修正

- `package.tsbuildinfo` 已被 Git 跟踪。
- `.gitignore` 没有忽略 `*.tsbuildinfo`。
- `dist/`、`node_modules/`、`.env` 当前已被忽略且未跟踪，风险较低。

4. 文档入口偏薄

- `README.md` 只有安装和开发命令。
- 缺少环境变量说明、脚本说明、质量门禁、测试策略、发布/构建说明。

## 建议里程碑

### M0：确认整理口径和冻结新增债务

预计：0.5 天

目标：

- 明确哪些占位功能要补完，哪些入口要隐藏。
- 明确“发现”和“社区”的产品关系。
- 明确是否允许调整兼容路由，例如 `/cateGory` -> `/category-settings`。

交付物：

- 本文档中 P0/P1 功能的取舍结论。
- 一份短 checklist，要求新代码不得新增页面直调 API、不得新增裸路径字符串、不得新增无说明 `any`。

验收标准：

- P0/P1 每一项都有“实现/隐藏/延期”的处理结论。
- 后续 milestone 可以不再反复确认产品方向。

### M1：恢复工程质量门禁

预计：1 天

目标：

- 让 `pnpm lint` 回到可用状态。
- 清理会持续污染工作区或 CI 的产物规则。

任务：

- 执行 `pnpm lint:fix`，分批提交或分批 review 自动修复项。
- 人工处理剩余 lint：Hooks 依赖、render purity、重复声明、`shims.axios.d.ts`。
- 从 Git 跟踪中移除 `package.tsbuildinfo`，在 `.gitignore` 加入 `*.tsbuildinfo`。
- 保持 `pnpm lint:type` 通过。

验收标准：

- `pnpm lint` 通过。
- `pnpm lint:type` 通过。
- `git status` 不再因为 TypeScript build info 产生噪音。

风险：

- 自动格式化会造成大 diff。建议单独里程碑处理，不混入业务改动。

### M2：补齐高优先级用户功能

预计：3-5 天

目标：

- 消除用户可直接进入的纯占位/半成品页面。

任务：

- 实现 `/chart/category`：支持从排行榜进入分类统计详情。
- 改造 `/share`：使用真实数据，保存图片有错误处理；不能支持的分享按钮隐藏或替换为可用能力。
- 实现 `/message` 首页：新关注、评论、系统通知入口和空态。
- 处理类别设置：实现分类管理最小闭环，或隐藏入口并保留路由兼容。
- 梳理登录保护：为需要 token 的业务页面统一包 `LoginGuard`。

验收标准：

- 图表排行榜点击不再出现“敬请期待”。
- 分享页不再展示硬编码业务数据。
- 消息首页能进入三个子消息页。
- 未登录访问受保护页面时行为一致。
- `pnpm lint`、`pnpm lint:type` 通过。

### M3：收敛数据层和缓存一致性

预计：2-4 天

目标：

- 让社区、消息、用户设置等老模块接近资产/固定支出/发票新模块的数据层规范。

任务：

- 修正 `request` 错误契约，覆盖无 response、timeout、401/402/403、业务失败状态。
- 为 topic/community 补齐 query keys、query hooks、mutation hooks。
- 将社区发帖、点赞、评论、个人主页关注改为 mutation + invalidateQueries。
- 补齐 query barrel 导出，移除页面深路径导入。
- 统一必需参数 hook 的类型签名。
- 优先替换 API 边界 `any`：tools、topic user info、user 写接口、user-email params。

验收标准：

- 社区相关写操作不再直接在页面调用 API。
- topic list/detail/comment/profile 的缓存失效路径明确。
- 无参误调用必需参数 query hook 能在类型层被阻止。
- `pnpm lint:type` 通过。

### M4：路由、页面命名和入口一致性整理

预计：2-3 天

目标：

- 降低导航路径散落和命名遗留造成的维护成本。

任务：

- 补齐 `ROUTES_PATH`，覆盖认证、明细、记账、搜索、日历、发票、社区、消息、我的、设置等常用路由。
- 分批替换页面中的裸路径字符串。
- 为 `/cateGory` 增加规范路径兼容方案，例如新增 `/category-settings`，旧路径保留跳转或重定向。
- 规划 `Detail_editing`、`BotomList` 等命名迁移，不和业务功能改动混在同一批。
- 明确 TabBar 中发现/社区入口关系，并修正 active index。

验收标准：

- 新增导航优先使用 `ROUTES_PATH`。
- 主要页面不再散落核心路径字符串。
- 大小写异常路由不再作为主入口。

### M5：组件和工具归一

预计：2-4 天

目标：

- 保留现有视觉体系，但减少重复基础组件和工具函数。

任务：

- 选择 `src/components/ui/*` 或旧 `src/components/*` 中的主线组件。
- 迁移 `FixedPin`、`Icon`、`Input` 的引用。
- 清理或隔离 demo 文件，避免 demo 参与生产 lint/build 噪音。
- 合并 `composeExportComponent` 重复实现。
- 保留页面私有组件在页面目录，跨页面复用组件放 `src/components`。

验收标准：

- 重复基础组件有明确归属。
- `src/components/index.ts` 和 `src/components/ui/index.ts` 导出关系清晰。
- 不因为组件整理改变用户可见行为。

### M6：测试最小闭环

预计：3-5 天

目标：

- 建立前端可持续验证能力，不再只依赖手工点击。

任务：

- 增加测试脚本，建议优先 Vitest。
- 覆盖纯函数：金额、时间、导出数据、requestProcess。
- 覆盖 query key helper：record、budget、asset、topic、invoice、fixed-expense。
- 覆盖核心表单转换：记账、固定支出、发票、资产表单。
- 后续再考虑页面级组件测试或 e2e。

验收标准：

- `pnpm test` 可运行。
- 核心工具和 key helper 有基础断言。
- CI 或本地交付说明包含 `pnpm lint`、`pnpm lint:type`、`pnpm test`。

### M7：文档和维护说明补齐

预计：1-2 天

目标：

- 让新开发者能通过文档理解项目如何启动、验证、发布和扩展。

任务：

- 扩充 `README.md`：Node/pnpm 版本、安装、开发、构建、预览、lint、typecheck、test、环境变量。
- 新增或扩展 docs：数据层规范、路由规范、功能完成度清单、测试策略。
- 将已完成的里程碑回填到 `docs/flowcharts/feature-flows.md` 或拆分专题文档。

验收标准：

- README 能支持从零启动项目。
- docs 能解释主要功能流、质量门禁和新增功能约定。

## 推荐执行顺序

1. M0 先确认产品取舍。
2. M1 单独做质量门禁，避免后续每个 PR 都被旧 lint 噪音污染。
3. M2 处理用户可见的 P0/P1 半成品。
4. M3 修数据层，让后续功能不继续绕过缓存体系。
5. M4 和 M5 做组织整理，控制 diff 范围。
6. M6、M7 建立长期维护能力。

## 交付风险和注意事项

- 不建议在同一个 PR 中混合 lint 全量格式化和业务功能修复。
- 登录保护需要先确认哪些页面允许游客浏览，否则可能改变现有访问体验。
- 路由改名需要保留兼容入口，避免历史链接失效。
- 组件归一应以“迁移引用 + 保持视觉行为一致”为先，不在同批重设计 UI。
- 社区/topic 数据层改造要和后端返回结构对齐，优先补类型，再迁移页面。


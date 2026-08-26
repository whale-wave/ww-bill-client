# ww-bill-client 前端整理与里程碑计划（历史基线与当前收口）

更新时间：2026-07-16

## 文档状态

本文档的功能盘点和 M0-M7 原始拆分形成于 2026-06-26，保留为当时的审计基线。其 `src/api`、`src/hooks`、`src/store`、PascalCase 页面路径和“不重建分层体系”等描述已经被 2026-07-04 至 2026-07-05 完成的 FSD 迁移取代，不再作为当前目录规范。

当前工程规范以根目录 `AGENTS.md` 为准，FSD 迁移事实与偏差以 [`fsd-refactor-plan.md`](./fsd-refactor-plan.md) 为准；本文档后半部分的历史任务只用于解释决策来源，不能直接交给实现者执行。

## 当前执行状态

| 原里程碑 | 当前状态 | 结论 |
| --- | --- | --- |
| M0 产品取舍 | 已完成 | `/category`、登录保护和 P0/P1 入口边界已有明确实现 |
| M1 质量门禁 | 已恢复 | 2026-07-16 fresh gate 中 install、lint:type、lint、test、build 和 diff-check 均通过；ESLint 为 0 errors / 82 warnings |
| M2 用户功能 | 已完成 | 图表分类详情、消息入口、类别只读和登录保护已完成；记录详情 `/editing/:id` 已提供携带真实记录进入 `/share` 的分享入口，并完成认证端到端验证 |
| M3 数据层 | 主体完成、验证通过 | entity/query/mutation 和请求错误契约已迁移，`pnpm lint:type` 与 production build 已通过 |
| M4 路由命名 | 已完成 | 页面目录、路由树和懒加载已按 FSD 重组，并保留兼容路由 |
| M5 组件工具 | 主体完成、验证通过 | shared/entities/widgets 已重新分层，lint/type/build 均通过；保留 82 个非阻塞 warning 后续分类治理 |
| M6 测试 | 最小闭环完成 | 已接入 Vitest；2026-07-16 fresh gate 中 7/7 test files、18/18 tests 通过，覆盖导出/分享契约、query key、语言持久化与记账输入/提交回归 |
| M7 文档 | 进行中 | `AGENTS.md` 已更新，本文档和流程图正在回填当前路径 |

### 当前优先级

1. P9 已关闭：客户端 fresh gate 与核心冒烟通过，同级服务的 follow DTO whitelist、空评论查询和 system-notify 大数据量请求也已修复并完成认证回归。
2. M2 已关闭：记录详情 `/editing/:id` 的分享控件可把真实记录带入 `/share`，state/query 恢复、无数据空态、系统分享取消处理和测试数据清理均已完成认证回归。
3. 按 hook 依赖、纯度、数组 key 和遗留组件模式分类治理当前 82 个非阻塞 ESLint warning。

## 目标

本计划最初用于整理 `ww-bill-client` 在 2026-06-26 的实现状态。以下“功能地图”“代码与文件组织问题”和原始 M0-M7 是历史快照；当前实现已经迁移到 `app/pages/widgets/features/entities/shared` 分层。

## 2026-06-26 功能地图（历史）

已注册路由集中在 `src/router/index.tsx`，文档流程集中在 `docs/flowcharts/feature-flows.md`。

| 模块 | 已有页面/路由 | 当前状态 |
| --- | --- | --- |
| 启动与明细 | `/`, `/detail` | 已有首屏跳转、明细列表、金额展示配置等基础流程 |
| 记账与编辑 | `/bookkeeping`, `/editing/:id`, `/record-calendar`, `/search-record` | 已有新增、编辑、删除、日历、搜索等核心流程 |
| 账单与导出分享 | `/bill`, `/export-data`, `/share` | 账单和导出已有实现；记录详情可携带真实记录进入 `/share`，分享页支持 state/query 恢复与无数据空态，并已完成认证端到端验证 |
| 预算 | `/budget`, `/budget/category/:type` | 已有总预算、分类预算、增删改清等流程 |
| 资产 | `/asset`, `/asset/add-account`, `/asset/add-form/:id?`, `/asset/detail/:id`, `/asset/chart` | 新实现较完整，React Query/key/mutation 相对规范 |
| 图表 | `/chart`, `/chart/category` | 首页图表已有实现，分类详情已有排行榜进入后的首版明细页 |
| 发票助手 | `/invoice`, `/invoice/create`, `/invoice/:id`, `/invoice/:id/edit` | 新实现较完整，列表/详情/新增/编辑/删除闭环存在 |
| 固定支出 | `/fixed-expenses`, `/fixed-expenses/create`, `/fixed-expenses/:id`, `/fixed-expenses/:id/edit` | 新实现较完整，表单与缓存失效较规范 |
| 发现与社区 | `/discovery`, `/community`, `/community/personal/:id`, `/post-topic`, `/topic-detail/:id` | 社区基础浏览/发帖/评论存在，但数据层与分享交互未收敛 |
| 消息 | `/message`, `/message/new-follow`, `/message/comment-list`, `/message/system-notify` | 首页已有三个入口；子页服务端阻塞已修复并完成认证端到端验证，仍缺未读/摘要数据接口 |
| 我的与设置 | `/mine`, `/settings`, `/user-info`, `/password`, `/settings/email/change/*`, `/category` | 基础用户信息、签到、设置存在；类别设置已支持查看收入/支出分类，管理动作暂不暴露 |
| 认证 | `/login`, `/sign`, `/forget-password/*` | 登录、注册、找回密码基础流程存在 |

## 未完成和占位功能

### P0 必须优先处理

1. 图表分类详情页仍需后续验收打磨

- 当前进展：分类排行榜点击已进入 `/chart/category`，携带分类 ID、统计维度、收支类型和当前 tab 上下文；详情页已展示分类金额、占比、周期摘要和明细记录，并通过 `/chart` 查询作为刷新/直达兜底。
- 仍需确认：不同时间维度、空数据、接口返回被 `categoryId` 过滤时的端到端表现；工程质量门禁已恢复，这些场景仍需单独手动回归，不能视为视觉与异常态打磨完成。
- 期望：后续补充上述场景的手动回归，再完善必要的异常态或视觉细节。

2. 分享页真实数据与记录详情入口已完成

- 完成范围：记录详情 `/editing/:id` 的“分享”控件以 `location.state.record` 将真实记录带入 `/share`；分享页也支持 `location.state.shareData`、直接 state 字段或 URL query，并在核心字段缺失时展示明确空态。系统分享能力已替代不可用“微信”入口，环境不支持时保留复制链接兜底。
- 验证结果：真实支出记录 `0.12` / `餐饮` / `M2 分享验收` 可进入完整分享卡，返回同一详情、query-only 恢复、直接空态、原生分享取消提示、删除后搜索无结果和浏览器 console 0 errors 均已验证；fresh gate 的 lint:type、lint、test、build 与 diff-check 均通过。
- 图片下载验证：“保存图片”两次点击均生成 PNG 文件：`/Users/avanlan/Downloads/鲸浪账本.png`（278728 bytes，2026-07-16 17:02:58 +0800）与 `/Users/avanlan/Downloads/鲸浪账本 (1).png`（278728 bytes，2026-07-16 17:03:43 +0800）；两者均为 562×834、8-bit/color RGBA、non-interlaced PNG，且点击过程无 console error。

### P1 影响主流程体验

1. 消息首页缺未读/摘要数据接口

- 当前进展：`/message` 已提供新关注、评论、系统通知三个可点击入口；没有首页摘要接口时展示稳定说明。服务端 follow DTO whitelist、空话题 ID 评论查询和 system-notify 无界读取均已修复，认证端到端冒烟确认三个子页可加载，系统通知页稳定渲染最近 50 条记录。
- 后续期望：未读数或最近消息摘要接口仍为后续增强，不属于 P9。

2. 类别设置仍需接口确认和端到端验证

- 当前进展：`/category` 已不再是占位；设置页“类别设置”可进入该页，页面展示支出/收入两个分类列表，并使用 `GET /category?type=sub|add` 读取分类。
- 当前边界：新增/编辑/删除/隐藏等管理动作暂不暴露；页面提示“当前仅支持查看，新增/编辑/删除待接口能力确认后开放”。
- 仍需确认：服务端新增接口当前需要 multipart file 且 create 只取 name/file、未设置非空 `type`；删除也缺少引用检查。管理动作需要接口能力和风险策略明确后再开放，并补端到端验证。

3. 登录保护边界不足

- 进展：`/user-info`、`/password`、`/post-topic` 继续使用 `LoginGuard`；`/mine`、`/settings/*`、`/message/*`、`/export-data`、`/budget`、`/budget/category/:type`、`/asset/*`、`/invoice/*`、`/fixed-expenses/*`、`/bill`、`/share`、`/record-calendar`、`/search-record`、`/community/*`、`/topic-detail/:id`、`/category` 已纳入登录保护。
- 保留公开：`/`、`/login`、`/sign`、`/forget-password/*` 和 `*` 未命中页；`/detail`、`/bookkeeping`、`/editing/:id`、`/chart`、`/chart/category`、`/discovery`、`/cateGory` 兼容跳转及其余业务路由均包 `LoginGuard`。
- 后续期望：继续把受保护业务路由集中维护，避免未登录时出现空数据、接口 401 后跳转闪烁或页面运行时错误。

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

- `src/constants/route.ts` 已补入一批守卫和导航整理直接相关的常用路由：`/mine`、`/settings`、`/message`、`/export-data`、`/record-calendar`、`/search-record`、`/invoice`、`/community`、`/topic-detail/:id`、`/share`、`/category`。
- 许多导航仍散落字符串，后续仍需分批替换到 `ROUTES_PATH`。
- 建议：先补齐常用业务路由常量，再分批替换跳转字符串。

2. 命名遗留

- `/cateGory` 大小写异常；当前已新增规范 `/category` 并保留 `/cateGory` 到 `/category` 的 case-sensitive 兼容重定向。
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

1. 当前质量门禁被依赖校验阻塞

- 当前执行 `pnpm lint:type` 和 `pnpm lint` 时，pnpm 在进入 TypeScript/ESLint 前被依赖供应链策略阻塞。
- 当前阻塞错误：`ERR_PNPM_TRUST_DOWNGRADE`，涉及 `synckit@0.9.3`、`tailwind-merge@2.6.1`、`undici-types@6.21.0`。
- 历史审计结果：此前 `pnpm lint:type` 通过；此前 `pnpm lint` 失败：636 个问题，491 个 error，145 个 warning，其中大量格式/import 问题可自动修复。
- 历史 lint 主要类别：import 排序、type-only import、格式缩进、React hooks 依赖、render purity、重复声明、`shims.axios.d.ts` 规则问题。

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

## 2026-06-26 建议里程碑（历史）

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

- 完善 `/chart/category`：排行榜进入分类统计详情已有首版实现，后续补齐依赖校验恢复后的验证与细节打磨。
- 改造 `/share`：已支持 state/query 真实数据、无数据空态、保存图片错误处理、系统分享或复制链接；记录详情真实入口与认证端到端验证已闭合。
- 实现 `/message` 首页：新关注、评论、系统通知入口和空态。
- 处理类别设置：已完成可查看收入/支出分类的最小切片；新增/编辑/删除/隐藏暂不暴露，后续待接口能力和风险策略确认。
- 继续梳理登录保护：本轮已覆盖 token 依赖的主要业务路由，后续新增业务页需同步确认是否包 `LoginGuard`。

验收标准：

- 图表排行榜点击进入 `/chart/category`，并能展示分类金额、占比、周期摘要和明细记录。
- 分享页不再展示硬编码业务数据；从业务入口传入真实 state/query 时可渲染分享卡，直达无数据时展示空态。
- 消息首页能进入三个子消息页。
- 设置页“类别设置”能进入 `/category`，并可查看支出/收入分类；页面不出现不可用管理动作。
- 未登录访问受保护页面时行为一致。
- 类别设置的新增/编辑/删除仍需接口能力确认和端到端验证后再纳入验收。
- `pnpm lint`、`pnpm lint:type`、`pnpm test` 和 `pnpm build` 均通过。

#### M2 验证日志 — 2026-07-16

- fresh gate：`CI=true pnpm install --frozen-lockfile`、`pnpm lint:type`、`pnpm lint`、`pnpm test`、`pnpm build` 和 `git diff --check` 均 exit 0；ESLint 为 0 errors / 82 warnings，Vitest 为 7/7 test files、18/18 tests，`git ls-files 'dist/**' '*.tsbuildinfo' 'coverage/**'` 无输出。
- 真实记录入口：在认证会话创建 ID `9` 的支出记录（`0.12`、`餐饮`、`M2 分享验收`、2026-07-16），详情地址为 `/#/editing/9`；详情显示完整字段且只有一个“分享”入口，点击后进入 `/#/share`，卡片显示 `2026年07月16日`、`餐饮`、`M2 分享验收`、`支出` 和 `0.12`。
- 返回与分享：分享页返回精确回到 `/#/editing/9`，再次进入分享页后，“分享账单”调用原生分享；环境取消后页面显示“已取消分享”，验证 Abort/NotAllowed 取消分支。由于走原生分享分支，剪贴板为空，不把复制兜底记为本次已验证。
- 图片下载：“保存图片”两次点击分别生成 `/Users/avanlan/Downloads/鲸浪账本.png`（278728 bytes，2026-07-16 17:02:58 +0800）和 `/Users/avanlan/Downloads/鲸浪账本 (1).png`（278728 bytes，2026-07-16 17:03:43 +0800）；文件检查确认两者均为 562×834、8-bit/color RGBA、non-interlaced PNG。该证据只确认格式、尺寸、大小与时间戳，不延伸为图片内容断言。
- query 与空态：按页面契约直接打开 `/#/share?amount=0.12&type=sub&categoryName=%E9%A4%90%E9%A5%AE&dateText=2026%E5%B9%B407%E6%9C%8816%E6%97%A5&remark=M2+%E5%88%86%E4%BA%AB%E9%AA%8C%E6%94%B6`，无 route state 时恢复相同完整卡片；直接打开无 state/query 的 `/#/share` 显示“暂无可分享账单”和“请从账单、明细等业务入口进入分享页。”
- 清理与 console：删除 ID `9` 后搜索 `M2 分享验收` 返回无结果并显示“删除成功”；同时删除本轮浏览器尝试遗留的 ID `8`（`0.12` / `购物`），最终列表回到测试前可见记录 `953 汽车`、`555 书籍`。最终浏览器 console errors 为 0，服务端口 3001 和客户端端口 3231 随后均已关闭。
- 范围边界：M2 的记录分享闭环已关闭；类别新增/编辑/删除、消息未读/摘要接口和社区分享仍是后续工作，本日志不把它们标记为完成。

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

- 继续补齐 `ROUTES_PATH`，覆盖认证、明细、记账等剩余常用路由，并替换页面中的裸路径字符串。
- 分批替换页面中的裸路径字符串。
- 保持 `/category` 为分类设置主路径，`/cateGory` 仅作为兼容重定向保留。
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

## 2026-06-26 推荐执行顺序（历史）

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

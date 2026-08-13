# 前端功能流程图

本文档按前端用户功能组织流程图，重点说明页面跳转、状态来源、API 调用和成功后的页面行为。后端处理细节见 `ww-bill-service/docs/flowcharts/module-flows.md`。

## 文件组织

```text
ww-bill-client/
├── README.md
├── docs/
│   ├── README.md
│   └── flowcharts/
│       └── feature-flows.md
└── src/
```

采用项目级 `docs/flowcharts/` 的原因：

- 流程图是跨页面、跨 Hook、跨 API 的说明，不适合塞进单个页面目录。
- Mermaid 放在 Markdown 中可直接渲染，也便于代码评审时查看差异。
- 后续如果某个功能过大，可从本文档拆成 `docs/flowcharts/<feature>.md`。

## 功能索引

| 功能 | 主要页面 | 主要 API |
| --- | --- | --- |
| 启动与导航 | `src/pages/first-screen`, `src/app/router.tsx`, `src/pages/record/detail` | `/record`, `/user-app-config` |
| 登录注册与找回密码 | `src/pages/auth/login`, `src/pages/auth/sign`, `src/pages/auth/forget-password` | `/tools/email`, `/auth/*` |
| 记账与流水 | `src/pages/record/bookkeeping`, `src/pages/record/detail`, `src/pages/record/editing`, `src/pages/record/record-calendar`, `src/pages/record/search-record` | `/record`, `/category` |
| 账单与导出分享 | `src/pages/bill`, `src/pages/export-data`, `src/pages/share` | `/record/bill`, `/record` |
| 预算 | `src/pages/budget`, `src/pages/create-budget-category` | `/budget/*`, `/category` |
| 资产 | `src/pages/asset/*` | `/asset/*` |
| 图表 | `src/pages/chart/*` | `/chart` |
| 发票助手 | `src/pages/invoice/*` | `/invoice/*` |
| 固定支出 | `src/pages/fixed-expense/*` | `/fixed-expense/*` |
| 社区 | `src/pages/community`, `src/pages/topic-detail`, `src/pages/post-topic` | `/topic/*`, `/follow/*`, `/upload` |
| 消息 | `src/pages/message`, `src/pages/new-follow`, `src/pages/comment-list`, `src/pages/system-notify` | `/follow/*`, `/topic/:id/comment`, `/system_notify` |
| 我的与设置 | `src/pages/mine`, `src/pages/user/user-info`, `src/pages/user/password`, `src/pages/settings`, `src/pages/user/email-change`, `src/pages/category-settings` | `/user/*`, `/check_in`, `/user-app-config`, `/user-email/*`, `/category` |

## 应用启动与路由

```mermaid
flowchart TD
  Start["打开应用"] --> Router["createHashRouter 加载 RootLayout"]
  Router --> First["/ 首屏 FirstScreen"]
  First --> Detail["跳转 /detail 明细首页"]
  Detail --> Top["Top 查询用户配置与快捷入口"]
  Detail --> List["List 查询 /record 并按日期展示流水"]
  Top --> Feature{"用户选择功能"}
  Feature --> PublicRoute["公开路由: /bookkeeping、/detail、/chart、/discovery"]
  Feature --> ProtectedRoute["LoginGuard 保护路由"]
  PublicRoute --> Bookkeeping["/bookkeeping 记账"]
  ProtectedRoute --> HasToken{"本地有 token?"}
  HasToken -->|否| LoginRedirect["跳转 /login"]
  HasToken -->|是| Budget["/budget 预算"]
  HasToken -->|是| Asset["/asset 资产"]
  HasToken -->|是| Bill["/bill 账单"]
  HasToken -->|是| Calendar["/record-calendar 日历"]
  HasToken -->|是| Search["/search-record 搜索"]
  HasToken -->|是| Mine["/mine 我的"]
  HasToken -->|是| MoreProtected["/invoice、/message、/settings、/fixed-expenses、/community 等"]
```

源码入口：`src/app/router.tsx`, `src/pages/first-screen/FirstScreenPage.tsx`, `src/pages/record/detail/*`, `src/widgets/layout/*`。

路由保护说明：`/user-info`、`/password`、`/post-topic` 继续由 `LoginGuard` 保护；预算、发票、社区、消息、设置、资产、固定支出等父级/index 与子路由，以及 `/mine`、`/share`、`/export-data`、`/bill`、`/record-calendar`、`/search-record`、`/topic-detail/:id`、`/category` 均按 token 登录态访问。`/login`、`/sign`、`/forget-password/*`、`/detail`、`/bookkeeping`、`/editing/:id`、`/chart/*`、`/discovery` 与未命中页保持公开；`/cateGory` 是未包 `LoginGuard` 的兼容重定向，最终进入受保护的 `/category`。

## 登录、注册与找回密码

```mermaid
flowchart TD
  Entry["进入 /login"] --> Mode{"登录方式"}
  Mode --> PasswordLogin["账号密码登录"]
  Mode --> EmailLogin["邮箱验证码登录"]
  EmailLogin --> SendLoginEmail["请求 /auth/login/email/captcha"]
  PasswordLogin --> SubmitLogin["提交 /auth/login"]
  SendLoginEmail --> SubmitLogin
  SubmitLogin --> LoginOk{"登录成功?"}
  LoginOk -->|是| StoreToken["保存 token 并预填用户 Query 缓存"]
  StoreToken --> Back["返回上一页或首页"]
  LoginOk -->|否| ShowError["Toast 提示错误"]

  Entry --> Sign["跳转 /sign 注册"]
  Sign --> SendEmail["请求 /tools/email 发送注册验证码"]
  SendEmail --> SubmitSign["提交 /auth/sign"]
  SubmitSign --> SignOk["注册成功后创建默认分类并回首页"]

  Entry --> Forget["跳转 /forget-password"]
  Forget --> SendForgetEmail["请求 /auth/forget-password-email"]
  SendForgetEmail --> VerifyCode["/forget-password/verify-code 校验 /auth/forget-password-email/verify-code"]
  VerifyCode --> Reset["/forget-password/reset 提交 /auth/password/forget/reset"]
  Reset --> Done["重置成功后返回我的页"]
```

源码入口：`src/pages/auth/login/LoginPage.tsx`, `src/pages/auth/sign/SignPage.tsx`, `src/pages/auth/forget-password/*`, `src/entities/auth`, `src/entities/tools`, `src/features/auth`, `src/features/email-captcha`。

## 记账、明细、编辑与搜索

```mermaid
flowchart TD
  Detail["/detail 明细首页"] --> QueryRecord["useGetRecordQuery -> GET /record"]
  QueryRecord --> RenderList["按日期渲染流水列表与收支汇总"]
  RenderList --> ClickRecord["点击某条流水"]
  ClickRecord --> Editing["/editing/:id"]
  Editing --> QueryOne["useGetRecordByIdQuery -> GET /record/:id"]
  QueryOne --> EditChoice{"用户操作"}
  EditChoice --> Edit["编辑"]
  Edit --> BookkeepingEdit["带 state 进入 /bookkeeping"]
  BookkeepingEdit --> LoadCategories["GET /category 加载收入/支出分类"]
  LoadCategories --> SubmitUpdate["usePutRecordMutation -> PUT /record/:id"]
  SubmitUpdate --> BackEditing["回到 /editing/:id"]
  EditChoice --> Delete["删除"]
  Delete --> Confirm["Popup 二次确认"]
  Confirm --> DeleteApi["useDeleteRecordMutation -> DELETE /record/:id"]
  DeleteApi --> BackDetail["返回 /detail"]

  Detail --> Add["进入 /bookkeeping 新增"]
  Add --> LoadCategories
  LoadCategories --> Input["选择类型、分类、日期、金额、备注"]
  Input --> SubmitCreate["usePostRecordMutation -> POST /record"]
  SubmitCreate --> BackBySource{"来源页面"}
  BackBySource --> CalendarBack["日历来源: 回 /record-calendar"]
  BackBySource --> NormalBack["普通来源: 返回上一页"]

  Detail --> Calendar["/record-calendar"]
  Calendar --> CalendarQuery["按月份 GET /record"]
  Detail --> Search["/search-record"]
  Search --> SearchQuery["按 keyword GET /record"]
```

源码入口：`src/pages/record/detail/*`, `src/pages/record/bookkeeping/*`, `src/pages/record/editing/*`, `src/pages/record/record-calendar/*`, `src/pages/record/search-record/*`, `src/entities/record`。

## 账单、导出与分享

```mermaid
flowchart TD
  Detail["/detail"] --> Bill["/bill"]
  Bill --> SelectType["选择年份或月份维度"]
  SelectType --> BillApi["useGetRecordBillQuery -> GET /record/bill"]
  BillApi --> BillTabs["展示收支、结余与分组账单"]

  Detail --> Export["/export-data"]
  Export --> PickRange["选择开始和结束日期"]
  PickRange --> ExportApi["GET /record 获取范围内流水"]
  ExportApi --> BuildFile["exportData 生成导出数据"]
  BuildFile --> ExportDone["Toast 提示导出成功"]

  Detail -. 待接入 .-> ShareEntry["账单/明细等业务入口准备真实分享数据"]
  ShareEntry --> Share["/share 携带 location.state 或 URL query"]
  Share --> NormalizeShare["规范化 amount、type、categoryName、remark、time/date"]
  NormalizeShare --> ShareValid{"核心字段完整?"}
  ShareValid -->|是| Canvas["ShareCanvas 渲染真实分享卡片"]
  Canvas --> SaveShare["保存图片: html2canvas -> downloadCanvas"]
  Canvas --> SystemShare["系统分享 navigator.share"]
  Canvas --> CopyShare["不支持系统分享时复制当前链接"]
  ShareValid -->|否| ShareEmpty["空态: 提示从账单/明细入口进入"]
```

源码入口：`src/pages/bill/*`, `src/pages/export-data/ExportDataPage.tsx`, `src/pages/share/*`, `src/entities/record`, `src/shared/lib/export-data.ts`。

当前缺口：截至 2026-07-16，源码中未发现账单、图表或明细主动跳转 `/share` 的调用方；流程图中的分享入口仍是计划链路，不代表端到端已完成。

## 预算

```mermaid
flowchart TD
  Entry["/budget"] --> ReadType["读取 query 或默认预算类型"]
  ReadType --> QueryBudget["useGetBudgetInfoQuery -> GET /budget/info"]
  QueryBudget --> RenderBudget["展示总预算、分类预算、剩余与进度"]
  RenderBudget --> Action{"用户操作"}
  Action --> CreateSummary["创建或更新总预算"]
  CreateSummary --> SummaryApi["POST /budget/summary"]
  SummaryApi --> Refresh["刷新预算信息"]
  Action --> AddCategory["添加分类预算"]
  AddCategory --> CategoryPage["/budget/category/:type"]
  CategoryPage --> QueryCategory["GET /category?type=sub"]
  QueryCategory --> CreateCategory["选择分类和金额 -> POST /budget/category"]
  CreateCategory --> Refresh
  Action --> PatchAmount["修改预算金额"]
  PatchAmount --> PatchApi["PATCH /budget/:budgetId/amount"]
  PatchApi --> Refresh
  Action --> ClearBudget["清空预算"]
  ClearBudget --> ClearApi["POST /budget/clear"]
  ClearApi --> Refresh
  Action --> DeleteCategory["删除分类预算"]
  DeleteCategory --> DeleteApi["DELETE /budget/category/:budgetId"]
  DeleteApi --> Refresh
```

源码入口：`src/pages/budget/*`, `src/pages/create-budget-category/CreateBudgetCategoryPage.tsx`, `src/entities/budget`。

## 资产

```mermaid
flowchart TD
  AssetHome["/asset 资产首页"] --> QueryAsset["GET /asset 与 GET /asset/group"]
  QueryAsset --> Summary["按资产组展示余额、负债与净资产"]
  Summary --> Action{"用户操作"}
  Action --> AddAccount["/asset/add-account 选择资产组"]
  AddAccount --> AddForm["/asset/add-form?groupId=..."]
  AddForm --> GroupInfo["GET /asset/group/:assetGroupId"]
  GroupInfo --> SaveAsset["填写名称、卡号、金额 -> POST /asset"]
  SaveAsset --> HomeRefresh["返回并刷新资产列表"]

  Action --> Detail["/asset/detail/:id"]
  Detail --> AssetDetailQuery["GET /asset/:id 与 GET /asset/record"]
  AssetDetailQuery --> DetailView["展示资产信息与调整记录"]
  DetailView --> Adjust["进入 /asset/add-form/:id"]
  Adjust --> LoadAsset["GET /asset/:id 回填表单"]
  LoadAsset --> PatchAdjust["PATCH /asset/adjust/:id"]
  PatchAdjust --> DetailRefresh["生成调整记录并刷新统计"]

  Action --> Chart["/asset/chart"]
  Chart --> Statistical["GET /asset/statistical"]
  Statistical --> RenderChart["展示资产趋势图"]
```

源码入口：`src/pages/asset/*`, `src/entities/asset`。

## 图表

```mermaid
flowchart TD
  ChartHome["/chart"] --> PickRange["选择统计范围与收支类型"]
  PickRange --> ChartApi["useGetChartQuery -> GET /chart"]
  ChartApi --> ChartView["展示总额、分类占比和趋势"]
  ChartView --> RankingClick["点击分类排行榜项"]
  RankingClick --> CategoryDetail["/chart/category?categoryId&type&category&tabKey 作为规范上下文"]
  RankingClick --> RouteState["route state 携带 rankingItem、当前 tab、收支类型和时间维度"]
  CategoryDetail --> SameApi["useGetChartQuery 携带 categoryId 再次 GET /chart"]
  RouteState --> MatchState{"route state 与 URL 参数匹配?"}
  MatchState -->|是| CategorySummary["作为缓存/展示提示渲染分类金额、占比、周期摘要和明细记录"]
  MatchState -->|否| SameApi
  SameApi --> CategorySummary
```

源码入口：`src/pages/chart/*`, `src/entities/chart`。

## 发票助手

```mermaid
flowchart TD
  List["/invoice"] --> QueryList["useGetInvoiceQuery -> GET /invoice"]
  QueryList --> Render["展示发票抬头列表"]
  Render --> Create["/invoice/create"]
  Create --> FormCreate["填写名称、税号等信息"]
  FormCreate --> Post["POST /invoice"]
  Post --> BackList["返回列表"]
  Render --> Detail["/invoice/:id"]
  Detail --> QueryOne["GET /invoice/:id"]
  QueryOne --> Copy["复制发票字段"]
  QueryOne --> Edit["/invoice/:id/edit"]
  Edit --> Patch["PATCH /invoice/:id"]
  Patch --> BackDetail["返回详情"]
  QueryOne --> Delete["DELETE /invoice/:id"]
  Delete --> BackList
```

源码入口：`src/pages/invoice/*`, `src/entities/invoice`。

## 固定支出

```mermaid
flowchart TD
  List["/fixed-expenses"] --> Query["useGetFixedExpenseQuery -> GET /fixed-expense"]
  Query --> Summary["展示月/年支出汇总与即将到期列表"]
  Summary --> Create["/fixed-expenses/create"]
  Create --> CreateForm["填写必填信息、周期、提醒、支付信息"]
  CreateForm --> Post["POST /fixed-expense"]
  Post --> BackList["返回列表并刷新"]
  Summary --> Detail["/fixed-expenses/:id"]
  Detail --> QueryOne["GET /fixed-expense/:id"]
  QueryOne --> Edit["/fixed-expenses/:id/edit"]
  Edit --> Patch["PATCH /fixed-expense/:id"]
  Patch --> BackList
  Summary --> SwipeDelete["列表左滑删除"]
  SwipeDelete --> Confirm["Dialog 确认"]
  Confirm --> Delete["DELETE /fixed-expense/:id"]
  Delete --> BackList
```

源码入口：`src/pages/fixed-expense/*`, `src/entities/fixed-expense`。

## 社区、关注与评论

```mermaid
flowchart TD
  Community["/community"] --> QueryTopics["GET /topic 获取推荐或关注动态"]
  QueryTopics --> TopicList["展示话题列表"]
  TopicList --> TopicDetail["/topic-detail/:id"]
  TopicDetail --> QueryDetail["GET /topic/:id 与 GET /topic/:id/comment"]
  QueryDetail --> UserAction{"用户操作"}
  UserAction --> Like["PUT /topic/like/:id 点赞或取消点赞"]
  UserAction --> Comment["POST /topic/:id/comment 发表评论"]
  UserAction --> Personal["/community/personal/:id"]
  Personal --> UserInfo["GET /topic/user/:id"]
  Personal --> FollowAction{"关注状态"}
  FollowAction --> Follow["POST /follow/:id"]
  FollowAction --> Unfollow["DELETE /follow/:id"]
  Community --> PostTopic["/post-topic"]
  PostTopic --> Upload["上传图片 -> /upload"]
  Upload --> SubmitTopic["POST /topic 发布内容"]
```

源码入口：`src/pages/community/*`, `src/pages/topic-detail/*`, `src/pages/post-topic/PostTopicPage.tsx`, `src/entities/topic`, `src/entities/follow`。

## 消息

```mermaid
flowchart TD
  Message["/message 首页"] --> EmptySummary["无首页摘要数据时展示稳定说明"]
  Message --> NewFollowEntry["入口：新关注"]
  Message --> CommentEntry["入口：评论"]
  Message --> NotifyEntry["入口：系统通知"]
  NewFollowEntry --> NewFollow["/message/new-follow"]
  NewFollow --> FollowList["GET /follow/:id?type=fans 查看粉丝或关注"]
  FollowList --> FollowToggle["POST/DELETE /follow/:id"]
  CommentEntry --> CommentList["/message/comment-list"]
  CommentList --> CommentApi["GET /topic/:id/comment"]
  CommentApi --> TopicDetail["点击进入 /topic-detail/:id"]
  NotifyEntry --> SystemNotify["/message/system-notify"]
  SystemNotify --> NotifyApi["GET /system_notify"]
  NotifyApi --> RenderNotify["展示系统通知"]
```

源码入口：`src/pages/message/MessagePage.tsx`, `src/pages/new-follow/NewFollowPage.tsx`, `src/pages/comment-list/CommentListPage.tsx`, `src/pages/system-notify/SystemNotifyPage.tsx`。

## 我的、用户信息与设置

```mermaid
flowchart TD
  Mine["/mine"] --> UserInfoApi["useGetUserUserInfoQuery -> GET /user/userInfo"]
  Mine --> CheckIn["点击签到"]
  CheckIn --> CheckInApi["POST /check_in"]
  CheckInApi --> RefreshUser["刷新用户信息或提示结果"]
  Mine --> UserInfo["/user-info"]
  UserInfo --> EditName["修改昵称"]
  EditName --> PutUser["PUT /user/userInfo"]
  UserInfo --> Password["/password"]
  Password --> ChangePassword["PUT /user/password"]
  UserInfo --> EmailChange["/settings/email/change/captcha"]

  Mine --> Settings["/settings"]
  Settings --> QueryConfig["GET /user-app-config"]
  QueryConfig --> ToggleConfig["切换配置项"]
  ToggleConfig --> PatchConfig["PATCH /user-app-config"]
  Settings --> ClearCache["清除本地缓存"]
  Settings --> CategorySettings["类别设置 -> /category"]
  CategorySettings --> CategoryType{"选择分类类型"}
  CategoryType --> SubCategory["支出列表: GET /category?type=sub"]
  CategoryType --> AddCategory["收入列表: GET /category?type=add"]
  SubCategory --> CategoryList["展示分类图标和名称"]
  AddCategory --> CategoryList
  CategoryList --> Unsupported["新增/编辑/删除/隐藏动作不展示；页面说明待接口能力确认后开放"]

  EmailChange --> VerifyOld["GET /user-email/change-email/captcha 与 verify"]
  VerifyOld --> InputNew["输入新邮箱"]
  InputNew --> SendNew["GET /user-email/change-email/captcha/new-email"]
  SendNew --> SubmitNew["POST /user-email/change-email"]
```

源码入口：`src/pages/mine/*`, `src/pages/user/user-info/UserInfoPage.tsx`, `src/pages/user/password/PasswordPage.tsx`, `src/pages/settings/SettingsPage.tsx`, `src/pages/user/email-change/*`, `src/pages/category-settings/CategorySettingsPage.tsx`, `src/entities/user`, `src/entities/user-app-config`, `src/entities/user-email`, `src/entities/category`。

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
| 启动与导航 | `src/pages/FirstScreen`, `src/router/index.tsx`, `src/pages/detail` | `/record`, `/user-app-config` |
| 登录注册与找回密码 | `src/pages/Login`, `src/pages/Sign`, `src/pages/ForgetPassword` | `/tools/captcha`, `/tools/email`, `/auth/*` |
| 记账与流水 | `src/pages/bookkeeping`, `src/pages/detail`, `src/pages/Detail_editing`, `src/pages/RecordCalendar`, `src/pages/SearchRecord` | `/record`, `/category` |
| 账单与导出分享 | `src/pages/Bill`, `src/pages/export-data`, `src/pages/Share` | `/record/bill`, `/record` |
| 预算 | `src/pages/Budget`, `src/pages/CreateBudgetCategory` | `/budget/*`, `/category` |
| 资产 | `src/pages/Asset/*` | `/asset/*` |
| 图表 | `src/pages/Chart/*` | `/chart` |
| 发票助手 | `src/pages/Invoice/*` | `/invoice/*` |
| 固定支出 | `src/pages/FixedExpenses/*` | `/fixed-expense/*` |
| 社区 | `src/pages/community`, `src/pages/TopicDetail`, `src/pages/PostTopic` | `/topic/*`, `/follow/*`, `/upload` |
| 消息 | `src/pages/Message`, `src/pages/new-follow`, `src/pages/comment-list`, `src/pages/system-notify` | `/follow/*`, `/topic/:id/comment`, `/system_notify` |
| 我的与设置 | `src/pages/mine`, `src/pages/UserInfo`, `src/pages/Password`, `src/pages/settings`, `src/pages/EmailChange` | `/user/*`, `/check_in`, `/user-app-config`, `/user-email/*` |

## 应用启动与路由

```mermaid
flowchart TD
  Start["打开应用"] --> Router["createHashRouter 加载 Root"]
  Router --> First["/ 首屏 FirstScreen"]
  First --> Detail["跳转 /detail 明细首页"]
  Detail --> Top["Top 查询用户配置与快捷入口"]
  Detail --> List["List 查询 /record 并按日期展示流水"]
  Top --> Feature{"用户选择功能"}
  Feature --> Bookkeeping["/bookkeeping 记账"]
  Feature --> Budget["/budget 预算"]
  Feature --> Asset["/asset 资产"]
  Feature --> Bill["/bill 账单"]
  Feature --> Calendar["/record-calendar 日历"]
  Feature --> Search["/search-record 搜索"]
  Feature --> Mine["/mine 我的"]
```

源码入口：`src/router/index.tsx`, `src/pages/FirstScreen/index.tsx`, `src/pages/detail/*`。

## 登录、注册与找回密码

```mermaid
flowchart TD
  Entry["进入 /login"] --> Captcha["请求 /tools/captcha 获取图片验证码"]
  Captcha --> Mode{"登录方式"}
  Mode --> PasswordLogin["账号密码 + 图片验证码"]
  Mode --> EmailLogin["邮箱验证码登录"]
  EmailLogin --> SendLoginEmail["请求 /auth/login/email/captcha"]
  PasswordLogin --> SubmitLogin["提交 /auth/login"]
  SendLoginEmail --> SubmitLogin
  SubmitLogin --> LoginOk{"登录成功?"}
  LoginOk -->|是| StoreToken["保存 token 与用户信息"]
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

源码入口：`src/pages/Login/index.tsx`, `src/pages/Sign/index.tsx`, `src/pages/ForgetPassword/*`, `src/api/auth.ts`, `src/api/tools.ts`。

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

源码入口：`src/pages/detail/*`, `src/pages/bookkeeping/*`, `src/pages/Detail_editing/*`, `src/pages/RecordCalendar/index.tsx`, `src/pages/SearchRecord/*`, `src/api/record.ts`。

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

  Detail --> Share["/share"]
  Share --> Canvas["ShareCanvas 读取页面数据并绘制分享图"]
  Canvas --> SaveShare["ShareBtn 触发保存或分享"]
```

源码入口：`src/pages/Bill/*`, `src/pages/export-data/index.tsx`, `src/pages/Share/*`, `src/api/record.ts`, `src/utils/exportData.ts`。

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

源码入口：`src/pages/Budget/*`, `src/pages/CreateBudgetCategory/index.tsx`, `src/api/budget.ts`。

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

源码入口：`src/pages/Asset/*`, `src/api/asset.ts`, `src/hooks/useAssetSummaryInfo.ts`, `src/hooks/useAssetStatisticalRecord.ts`。

## 图表

```mermaid
flowchart TD
  ChartHome["/chart"] --> PickRange["选择统计范围与收支类型"]
  PickRange --> ChartApi["useGetChartQuery -> GET /chart"]
  ChartApi --> ChartView["展示总额、分类占比和趋势"]
  ChartView --> CategoryDetail["/chart/category"]
  CategoryDetail --> SameApi["携带分类或时间条件再次 GET /chart"]
  SameApi --> CategoryList["展示分类下的明细统计"]
```

源码入口：`src/pages/Chart/*`, `src/hooks/useChart.ts`, `src/api/chart.ts`。

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

源码入口：`src/pages/Invoice/*`, `src/api/invoice.ts`。

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

源码入口：`src/pages/FixedExpenses/*`, `src/api/fixed-expense.ts`。

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

源码入口：`src/pages/community/*`, `src/pages/TopicDetail/*`, `src/pages/PostTopic/index.tsx`, `src/api/topic.ts`, `src/api/follow.ts`, `src/api/index.ts`。

## 消息

```mermaid
flowchart TD
  Message["/message"] --> Type{"消息类型"}
  Type --> NewFollow["/message/new-follow"]
  NewFollow --> FollowList["GET /follow/:id?type=fans 查看粉丝或关注"]
  FollowList --> FollowToggle["POST/DELETE /follow/:id"]
  Type --> CommentList["/message/comment-list"]
  CommentList --> CommentApi["GET /topic/:id/comment"]
  CommentApi --> TopicDetail["点击进入 /topic-detail/:id"]
  Type --> SystemNotify["/message/system-notify"]
  SystemNotify --> NotifyApi["GET /system_notify"]
  NotifyApi --> RenderNotify["展示系统通知"]
```

源码入口：`src/pages/Message/index.tsx`, `src/pages/new-follow/index.tsx`, `src/pages/comment-list/index.tsx`, `src/pages/system-notify/index.tsx`。

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

  EmailChange --> VerifyOld["GET /user-email/change-email/captcha 与 verify"]
  VerifyOld --> InputNew["输入新邮箱"]
  InputNew --> SendNew["GET /user-email/change-email/captcha/new-email"]
  SendNew --> SubmitNew["POST /user-email/change-email"]
```

源码入口：`src/pages/mine/*`, `src/pages/UserInfo/index.tsx`, `src/pages/Password/index.tsx`, `src/pages/settings/index.tsx`, `src/pages/EmailChange/*`, `src/api/user.ts`, `src/api/user-app-config.ts`, `src/api/user-email.ts`。

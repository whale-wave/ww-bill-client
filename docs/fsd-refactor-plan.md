# ww-bill-client FSD 重构方案

> 本文件是 ww-bill-client 从当前技术分层架构迁移到 Feature-Sliced Design(FSD)的权威方案,对齐 `ww-bill-admin` 的 FSD 落地形态。包含:目标结构、命名与导出规范、状态管理规范、迁移映射、阶段计划、验收清单。
>
> 本方案**忽略现有组织规范**,以通用前端工程最佳实践为基准。状态管理部分不考虑迁移成本,严格按最佳实践重写。
>
> 创建日期:2026-07-04。基准 commit:`f27c9ff`。

---

## 1. 背景与目标

### 1.1 现状核心问题

| # | 问题 | 影响 |
|---|------|------|
| 1 | 按技术层切分(api/hooks/store/types/components 分散),非按领域切分 | 改一个功能跳 7 个目录 |
| 2 | 组件三套并存且重复(`components/` + `components/ui/` + 散文件 `WwButton.tsx`) | `NavBar`/`Input`/`Icon`/`FixedPin` 各有两份,归属不清 |
| 3 | pages 命名三种规则混用(PascalCase / kebab-case / snake_case `Detail_editing`) | 大小写敏感文件系统隐患(已踩过 `cateGory`) |
| 4 | 子目录单复数不一致(`component/` 2 处 vs `components/` 17 处) | 无谓分歧 |
| 5 | hooks 长命名扁平列表(25 query + 25 mutation),3 个孤儿 hook 在根目录 | 文件名 47 字符,难以浏览 |
| 6 | store 三套机制并存(全局 zustand + 页面 zustand + 页面 React Context),且 `useChartStore` 把服务端数据存进 store,`useSystemStore` 重复服务端偏好,`store/record.ts` 的 persist 返回 `{}` | 派生不存储原则被违反,状态归属混乱 |
| 7 | `SuccessResponse<T>` 是 ambient 全局类型(`api/api.d.ts` 用 `declare`) | 依赖关系模糊,IDE 跳转找不到来源 |
| 8 | 零碎单文件目录(`types/` 2 文件、`constants/` 3 文件、`components/utils/` 1 文件) | 不够撑顶层目录 |
| 9 | `modules/` 命名含糊(AudioWeb/echarts/playSound 是第三方封装) | 应叫 `lib/` |
| 10 | barrel 导出风格混乱(`export *`、named、default 三种混用) | 树摇与循环依赖风险 |
| 11 | router 单文件 30+ 路由 + 手动 `withLoginGuard(withSuspense(...))` 双层包裹 + 遗留 `cateGory` 重定向 | 可读性到上限 |
| 12 | client 与 admin 架构分叉(admin 用 FSD,client 用技术分层) | 同一人维护两套心智模型 |

### 1.2 目标

- 严格 FSD 分层 + 导入方向规则
- 对齐 admin 的 FSD 形态(app 扁平、shared 分段、pages kebab-case + `*Page.tsx`、features 保守)
- 状态管理严格遵循"服务端状态归 React Query、客户端状态归 store/Context、派生数据用 useMemo、用户偏好归服务端"原则
- 命名单一规则、barrel 单一风格
- 每阶段独立可验证,不破坏运行时行为

---

## 2. FSD 总则

### 2.1 层级与导入方向(硬性规则)

```
app → pages → widgets → features → entities → shared
└──────── 只能向右导入,不得反向 ────────┘
```

- 上层可导入下层,**同层 slice 之间禁止互相导入**(`features/record-form` 不得 import `features/share`)
- 跨 slice 复用 → 下沉到 `entities/` 或 `shared/`
- 每个 slice 通过 `index.ts` 暴露 **public API**,外部不得深路径导入
- `shared/` 内部 segments(`api/` `lib/` `ui/` `config/`)可互相导入,但 `ui/` 不应导入 `api/`(UI 不持有请求逻辑)

### 2.2 层级状态

| 层 | 状态 | 说明 |
|----|------|------|
| `app/` | ✅ 采用 | 扁平文件,对齐 admin |
| `pages/` | ✅ 采用 | 路由页面,薄编排 |
| `widgets/` | ⚠️ 按需采用 | 默认不创建;重构中遇到明确的页面级跨页复用组合时再加。当前规划仅 `widgets/layout/`(Root + LoginGuard + TabBar) |
| `features/` | ✅ 采用 | 跨页面可复用用户能力,保守准入 |
| `entities/` | ✅ 采用 | 业务实体,本项目最厚的层 |
| `shared/` | ✅ 采用 | 跨切面共享 |
| `processes/` | ❌ 不采用 | FSD 已 deprecated,admin 也无此层 |
| `mocks/` | ⏸️ 搁置 | 随测试体系(roadmap M6)一起引入 |

### 2.3 与 admin 的对齐与分叉

| 维度 | admin | client 目标 | 说明 |
|------|-------|-------------|------|
| `app/` 形态 | 扁平文件(App.tsx, router.tsx, lazy-pages.tsx, query-client.ts) | 同 ✅ | |
| `main.tsx` | `src/main.tsx` | `src/main.tsx` ✅ | 入口在根 |
| `pages/` 命名 | kebab-case 目录 + `*Page.tsx` | 同 ✅ | |
| `shared/` 段 | `api/` `lib/` `ui/` | `api/` `lib/` `ui/` `config/` ⚠️ | client 多 `config/`(env + 路由常量) |
| `entities/` 厚度 | 极薄(仅生成类型) | **较厚**(api+keys+hooks+ui) | 合理分叉:client 无 OpenAPI 生成,手写 api 必须按实体聚合 |
| `features/` 数量 | 2(auth, permission) | 5 左右 | 保守原则,见 §4.3 |
| `widgets/` | layout + dashboard | 仅 layout | |

---

## 3. 目标目录树

```
src/
├── main.tsx                          # createRoot 入口(对齐 admin)
├── i18n.ts                           # i18n 初始化(留根)
├── vite-env.d.ts                     # Vite 类型(留根)
│
├── app/                              # 应用初始化(扁平文件,对齐 admin)
│   ├── App.tsx                       # Provider 装配 + Root 布局初始化
│   ├── router.tsx                    # createHashRouter 路由树装配
│   ├── lazy-pages.tsx                # 所有 lazy import 集中
│   ├── query-client.ts               # QueryClient 实例 + 默认配置
│   └── theme.ts                      # 主题 token / CSS 变量(DESIGN.md 落地点)
│
├── pages/                            # 路由页面(薄编排层)
│   ├── first-screen/FirstScreenPage.tsx
│   ├── record/
│   │   ├── bookkeeping/
│   │   │   ├── BookkeepingPage.tsx
│   │   │   ├── ui/                   # 页面私有组件(keyboard, main, navbar)
│   │   │   └── model/                # 页面私有状态(若有)
│   │   ├── editing/EditingPage.tsx
│   │   │   └── ui/
│   │   ├── detail/DetailPage.tsx
│   │   │   └── ui/
│   │   ├── record-calendar/RecordCalendarPage.tsx
│   │   └── search-record/SearchRecordPage.tsx
│   ├── bill/BillPage.tsx
│   ├── budget/
│   │   ├── BudgetPage.tsx
│   │   └── create-category/CreateBudgetCategoryPage.tsx
│   ├── asset/
│   │   ├── asset-manager/AssetManagerPage.tsx
│   │   ├── asset-detail/AssetDetailPage.tsx
│   │   ├── asset-chart/AssetChartPage.tsx
│   │   ├── asset-form-info/AssetFormInfoPage.tsx
│   │   └── add-asset-account/AddAssetAccountPage.tsx
│   ├── invoice/{InvoicePage,InvoiceCreatePage,InvoiceDetailPage,InvoiceEditPage}.tsx
│   ├── fixed-expense/{FixedExpensePage,FixedExpenseCreatePage,FixedExpenseDetailPage,FixedExpenseEditPage}.tsx
│   ├── chart/{ChartHomePage,ChartCategoryPage}.tsx
│   ├── community/{CommunityPage,PersonalPage,FollowListPage}.tsx
│   ├── topic/{PostTopicPage,TopicDetailPage}.tsx
│   ├── message/MessagePage.tsx
│   ├── auth/
│   │   ├── login/LoginPage.tsx
│   │   ├── sign/SignPage.tsx
│   │   └── forget-password/{ForgetPasswordPage,VerifyCodePage,ResetPage}.tsx
│   ├── user/
│   │   ├── user-info/UserInfoPage.tsx
│   │   ├── password/PasswordPage.tsx
│   │   └── email-change/{EmailChangePage,EmailChangeCaptchaPage}.tsx
│   ├── settings/SettingsPage.tsx
│   ├── mine/MinePage.tsx
│   ├── category-settings/CategorySettingsPage.tsx
│   ├── discovery/DiscoveryPage.tsx
│   ├── share/SharePage.tsx
│   ├── export-data/ExportDataPage.tsx
│   ├── system-notify/SystemNotifyPage.tsx
│   ├── new-follow/NewFollowPage.tsx
│   ├── comment-list/CommentListPage.tsx
│   └── NotFoundPage.tsx
│
├── widgets/                          # 按需创建,当前仅 layout
│   └── layout/
│       ├── root-layout.tsx           # 原 Root.tsx(Outlet + 初始化)
│       ├── login-guard.tsx           # 原 components/LoginGuard
│       └── tab-bar.tsx               # 原 components/tab-bar
│
├── features/                         # 跨页面可复用用户能力(保守)
│   ├── auth/                         # 会话状态(token only)
│   │   ├── store.ts
│   │   └── index.ts
│   ├── email-captcha/                # 验证码输入(forget-password + email-change)
│   │   ├── ui/email-captcha-input.tsx
│   │   └── index.ts
│   ├── share/                        # 分享面板(topic-detail / bill / asset-chart 复用)
│   │   ├── ui/
│   │   ├── lib/
│   │   └── index.ts
│   ├── record-form/                  # 记账/编辑共用表单逻辑(P4 视情况抽取)
│   │   ├── model/
│   │   ├── lib/
│   │   └── index.ts
│   └── check-in/                     # 签到能力
│       ├── model/
│       └── index.ts
│
├── entities/                         # 业务实体:api + keys + hooks + types + ui
│   ├── record/
│   │   ├── api.ts                    # 接口函数 + 请求/响应类型
│   │   ├── keys.ts                   # query key factory
│   │   ├── hooks.ts                  # useGetRecord* + usePost/usePut/useDeleteRecord*
│   │   ├── types.ts                  # RecordEntry 等领域类型(含原 detail/List 的 recordChildren)
│   │   ├── ui/                       # 实体级展示原语
│   │   │   ├── RecordListItem.tsx
│   │   │   ├── RecordList.tsx
│   │   │   └── CurrentMonthBillCard.tsx
│   │   └── index.ts
│   ├── budget/{api,keys,hooks,types,ui,index}.ts
│   │   └── ui/{BudgetItem,BudgetItemContent,CurMonthBudgetCard}.tsx
│   ├── asset/{api,keys,hooks,types,ui,index}.ts
│   │   └── lib/{use-asset-summary,use-asset-statistical-record}.ts
│   ├── invoice/{api,keys,hooks,types,ui,index}.ts
│   ├── fixed-expense/{api,keys,hooks,types,ui,index}.ts
│   ├── topic/{api,keys,hooks,types,ui,index}.ts
│   ├── category/{api,keys,hooks,types,index}.ts
│   ├── user/{api,keys,hooks,types,index}.ts
│   ├── follow/{api,keys,hooks,types,index}.ts
│   ├── system-notify/{api,keys,hooks,types,index}.ts
│   ├── user-app-config/{api,keys,hooks,types,index}.ts
│   └── chart/{api,keys,hooks,types,index}.ts
│
├── shared/                           # 跨切面共享
│   ├── api/
│   │   ├── http.ts                   # axios 实例 + 拦截器(原 utils/request.ts)
│   │   ├── types.ts                  # SuccessResponse<T>(显式 export,替代 ambient)
│   │   ├── upload.ts                 # uploadFile(原 api/index.ts)
│   │   ├── request-process.ts        # 原 utils/requestProcess.ts
│   │   └── axios-shim.d.ts           # 原 shims.axios.d.ts(loading 字段扩展)
│   ├── ui/                           # 设计系统(原 components/ui/,保留 .md + demos)
│   │   ├── button/{button.tsx,button.scss,button.md,demos/,index.ts}
│   │   ├── input/
│   │   ├── icon/
│   │   ├── modal/
│   │   ├── nav-bar/
│   │   ├── fixed-pin/
│   │   ├── mask/
│   │   ├── list/
│   │   ├── progress-bar/
│   │   ├── progress-circle/
│   │   ├── switch/
│   │   ├── comment/
│   │   ├── gap/
│   │   ├── share/
│   │   ├── image-preview/
│   │   └── index.ts
│   ├── lib/                          # 纯工具 + 第三方封装
│   │   ├── format.ts                 # 原 utils/amount.ts + time.ts + DataTime.ts
│   │   ├── math.ts                   # 原 utils/math.ts
│   │   ├── class-name.ts             # 原 utils/className.ts
│   │   ├── regular.ts                # 原 utils/regular.ts
│   │   ├── component.ts              # 原 utils/component.ts(composeExportComponent + baseProps 合并)
│   │   ├── chose-file.ts             # 原 utils/choseFile.ts
│   │   ├── export-data.ts            # 原 utils/exportData.ts
│   │   ├── system.ts                 # 原 utils/system.ts(localStorage 工具)
│   │   ├── echarts.ts                # 原 modules/echarts.ts
│   │   ├── sound.ts                  # 原 modules/AudioWeb.ts + playSound.ts
│   │   └── use-chart.ts              # 原 hooks/useChart.ts(echarts 生命周期 hook)
│   └── config/
│       ├── index.ts                  # 原 config/index.ts(env + appName)
│       └── routes.ts                 # 原 constants/route.ts(ROUTES_PATH)
│
└── assets/                           # 静态资源、全局样式(保留)
    ├── images/
    └── styles/
        ├── index.scss
        ├── reset.ts                  # 原 components/reset.scss + initResetStyle
        └── mixins.scss
```

---

## 4. 各层职责详解

### 4.1 `app/`(扁平,对齐 admin)

| 文件 | 职责 | 来源 |
|------|------|------|
| `main.tsx`(根) | `createRoot` + 装配 `<App/>` | 原 `src/main.tsx` 瘦身 |
| `app/App.tsx` | `QueryClientProvider` + `ReactQueryDevtools` + `Router` + `StrictMode` + sound/session 初始化 | 原 `main.tsx` provider 部分 + 原 `Root.tsx` |
| `app/router.tsx` | `createHashRouter` 路由树 | 原 `router/index.tsx` |
| `app/lazy-pages.tsx` | 所有 `lazy(() => import(...))` 集中 | 从原 router 抽出 |
| `app/query-client.ts` | `QueryClient` 实例 + `defaultOptions`(staleTime / retry / refetchOnWindowFocus) | 原 `main.tsx` 内联,补默认配置 |
| `app/theme.ts` | 主题 token、CSS 变量(DESIGN.md 落地) | 新建预留 |

### 4.2 `pages/`

- **命名**:目录全 kebab-case,文件 PascalCase + `Page` 后缀
- **结构**:每 page 一目录,内含 `*Page.tsx` + 可选 `ui/`(私有组件) + `model/`(私有状态/hook)
- **薄编排**:`*Page.tsx` 只做:路由参数解析 → 调 entities/features 的 hook → 组装 UI;**不持有业务请求逻辑、不持有跨页状态**
- **私有组件**:留 `pages/<page>/ui/`,不进 `shared/`(三次原则)
- **页面级状态**:优先 URL search params(可分享、支持浏览器后退);其次 `pages/<page>/model/store.ts`;组件本地 state 优先

### 4.3 `features/`(保守,对齐 admin 数量级)

**准入标准**(同时满足):
1. 跨 ≥2 个 page 复用,且
2. 代表独立"用户场景"带自身状态机

不满足 → 留 page 或 entities。

| feature | 复用点 | 来源 |
|---------|--------|------|
| `auth` | token 全局会话 + LoginGuard 跨多数路由 | `store/user.ts`(瘦身)+ `components/LoginGuard` |
| `email-captcha` | forget-password + email-change | `components/EmailCaptchaInput` |
| `share` | topic-detail / bill / asset-chart 等 | `pages/Share` + `components/ui/share` |
| `record-form` | bookkeeping(create)+ editing(edit)共用 | P4 视情况抽取 |
| `check-in` | mine 页调用,独立用户动作 | `hooks/mutation/usePostCheckInMutation` |

### 4.4 `entities/`(本项目最厚的层)

**每个 entity slice 的 segments**:
```
entities/record/
├── api.ts        # 接口函数 + 请求/响应类型
├── keys.ts       # query key factory
├── hooks.ts      # useGet/usePost/usePut/useDelete hooks(聚合,不分 query/mutation 子目录)
├── types.ts      # 实体领域类型(从 api.ts 拆出)
├── ui/           # 实体级展示原语(RecordListItem、RecordList、CurrentMonthBillCard)
├── lib/          # 实体级派生计算(可选,如 asset 的 useAssetSummaryInfo)
└── index.ts      # public API
```

**hooks 归属决策**(关键):query hook + key + api 函数是强耦合三件套,合并到同一 slice 的 `hooks.ts` / `keys.ts` / `api.ts`,**不再分 `hooks/query/` + `hooks/query/keys/` + `api/` 三处**。

**实体清单**:record、budget、asset、invoice、fixed-expense、topic、category、user、follow、system-notify、user-app-config、chart(聚合数据视作实体)

### 4.5 `shared/`

| 段 | 内容 | 来源 |
|----|------|------|
| `shared/api/` | `http.ts`(request 实例)、`types.ts`(SuccessResponse)、`upload.ts`、`request-process.ts`、`axios-shim.d.ts` | `utils/request.ts` + `api/index.ts` + `utils/requestProcess.ts` + `api/api.d.ts` + `shims.axios.d.ts` |
| `shared/ui/` | 设计系统(15 个组件,带 .md + demos) | `components/ui/` 整体迁入 |
| `shared/lib/` | 纯工具 + 第三方封装 + 通用 hook | `utils/*` + `modules/*` + `hooks/useChart.ts` |
| `shared/config/` | env 配置 + 路由常量 | `config/` + `constants/route.ts` |

**`shared/api/types.ts`**:
```ts
// 替代 api/api.d.ts 的 ambient declare
export interface SuccessResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
```
所有引用处改为 `import type { SuccessResponse } from '@/shared/api'`。

---

## 5. Slice 内部结构规范

### 5.1 Segments(FSD 标准段名)

| segment | 用途 | 文件命名 |
|---------|------|----------|
| `ui/` | React 组件 | PascalCase |
| `api.ts` / `api/` | 接口函数 + 请求/响应类型 | kebab-case |
| `model/` | 状态、store、Context | kebab-case |
| `hooks.ts` | React Query hooks 聚合 | `hooks.ts` |
| `keys.ts` | query key factory | `keys.ts` |
| `types.ts` | 领域类型 | `types.ts` |
| `lib/` | slice 内工具 / 派生计算 hook | kebab-case |
| `config/` | slice 内常量配置 | kebab-case |

> ⚠️ **`components/` 不是 FSD 标准段名**。slice 内的 React 组件一律放 `ui/` 段。`shared/components/` 不存在;原 `components/` 顶层业务组件按归属重分布到 `entities/*/ui/` 或 `shared/ui/` 或 `widgets/layout/`。

小 slice 单文件即可(`api.ts`),大 slice 拆目录(`ui/`、`model/`)。**不强制目录**。

### 5.2 Public API(barrel)

- 每个 slice 根 `index.ts` 只导出"外部该用的"
- **禁止** `export *`(除 `shared/ui/` 这种纯 UI 库可酌情),逐项具名导出
- 外部导入一律走 slice 根:`import { useGetRecordQuery } from '@/entities/record'`,**不得** `from '@/entities/record/hooks'`

### 5.3 默认导出策略

| 对象 | 导出方式 |
|------|----------|
| `shared/ui/*` 设计系统组件 | 保留 `default` export |
| 业务 hook、api、types | 一律**具名导出** |
| `*Page.tsx` | 具名导出(`export const BookkeepingPage = ...`),`lazy-pages.tsx` 具名导入 |

---

## 6. 命名与导出规范(权威表)

| 对象 | 规则 | 示例 |
|------|------|------|
| 层目录 | 小写 | `app/ pages/ widgets/ features/ entities/ shared/` |
| slice 目录 | kebab-case | `fixed-expense/` `record-form/` |
| 页面文件 | PascalCase + `Page` 后缀 | `BookkeepingPage.tsx` |
| 组件文件 | PascalCase | `RecordListItem.tsx` |
| hook 文件 | kebab-case,聚合到 `hooks.ts` | `hooks.ts` 或 `use-asset-summary.ts` |
| api/keys/types 文件 | 固定名 | `api.ts` `keys.ts` `types.ts` |
| 工具文件 | kebab-case | `format.ts` `export-data.ts` |
| 路由路径常量 | UPPER_SNAKE | `ROUTES_PATH.RECORD_BOOKKEEPING` |
| query key factory | camelCase + `Keys` | `recordKeys` |
| 页面 URL | kebab-case | `/fixed-expense/:id/edit` |
| Zustand store hook | `use<Concern>Store` | `useAuthStore` |
| 页面级 store | `use<Page>PageStore` | `useBillPageStore` |

---

## 7. 状态管理规范(严格最佳实践)

> 本节不考虑迁移成本,按 React + React Query 时代的最佳实践重写。

### 7.1 总原则

| 状态类型 | 归属 | 说明 |
|---------|------|------|
| 服务端数据(record/budget/asset/invoice/topic 等) | **React Query** | 不进 Zustand,不进 Context |
| 用户偏好(声音开关、金额可见性等) | **服务端 + RQ**(`entities/user-app-config`) | 不本地复制 |
| 派生数据(tabs、汇总、百分比) | **`useMemo`** | 不存进 store 再 set |
| 鉴权凭证(token) | **Zustand persist**(`features/auth/store.ts`) | 只持久化 token |
| 全局 UI 偏好(主题、语言) | **Zustand 或 Context** | 跨页且高频读 |
| 路由驱动状态(筛选、搜索词、tab) | **URL search params** | 可分享、支持后退 |
| 页面内共享状态(跨组件) | **页面级 store 或 Context** | 仅页内,不全局 |
| 组件私有状态 | **`useState`** | 不上提 |

### 7.2 当前 store 逐个裁决

| 当前 store | 裁决 | 目标 | 理由 |
|-----------|------|------|------|
| `store/user.ts` | **瘦身** | `features/auth/store.ts`,只保留 `token` + `setToken` + `logOut` | userInfo 是服务端状态,应由 RQ `useGetUserUserInfoQuery` 拥有;持久化 userInfo 风险 staleness;`logOut` 内 `queryClient.clear()` + `useChartStore.reset()` 是跨 store 耦合,改为 `queryClient.clear()` 一项即可;`updateUserInfo` 改走 `usePutUserUserInfoMutation` + invalidation |
| `store/system.ts` | **删除** | 偏好归 `entities/user-app-config`(RQ);`audioWeb` 生命周期归 `shared/lib/sound.ts` 单例,在 `app/App.tsx` 初始化;`localStorageSize` 改 `pages/settings/` 组件本地计算 | `canPlay`/`visibleAmount`/`visibleAmountSwitch` 全是服务端 `user-app-config` 字段的本地副本(`isOpenSoundEffect`/`isDisplayAmount`/`isDisplayAmountSwitch`),重复存储;`hasAudioCache` 可由 `audioWeb.hasCache()` 实时计算,无需存储 |
| `store/chart.ts` | **删除** | `timeRangeCategory`/`amountType`/`activeTab` 改 URL search params 或 `pages/chart/model/` 页内 store;`tabs` 改 `useMemo` 从 RQ 数据派生 | `setTabsByWeek/Month/Year` 把 API 响应存进 store,违反"派生不存储";`reset()` 仅因 store 持有派生数据才需要,改 useMemo 后自动失效 |
| `store/record.ts` | **删除** | `searchRecordKeyword` 改 URL search params(`?q=`) | 搜索词应可分享、支持后退;当前 `partialize` 返回 `{}` 是死代码(persist 包了个寂寞) |
| `pages/Bill/store/billPage.ts` | **保留/优化** | `pages/bill/model/store.ts`,或改 URL params(`/bill?date=...&tab=...`) | 页面级 UI 状态(日期 + tab),跨 BillTabs/Content/BillRecordCard 共享;推荐 URL params 以便分享 |
| `pages/Budget/store/budgetPageContext.ts` | **保留** | `pages/budget/model/context.ts` | Context 适合低频变更值注入,BudgetEntityType 选择符合;不强制改 store |

### 7.3 重新设计后的 `features/auth/store.ts`(示范)

```ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  token: string;
  setToken: (token: string) => void;
  logOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: '',
      setToken: token => set({ token }),
      logOut: () => {
        set({ token: '' });
        // queryClient.clear() 在 app/App.tsx 的 logOut 编排中调用,
        // 不在此处跨 store 耦合
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ token: state.token }), // 只持久化 token
    },
  ),
);
```

userInfo 通过 `entities/user` 的 RQ query 获取,启用条件为 `token` 非空:

```ts
// entities/user/hooks.ts
export function useGetCurrentUserQuery() {
  const token = useAuthStore(s => s.token);
  return useQuery({
    enabled: Boolean(token),
    queryKey: userKeys.current(),
    queryFn: getUserUserInfoApi,
  });
}
```

### 7.4 重新设计后的 chart 派生(示范)

```ts
// pages/chart/model/use-chart-tabs.ts
export function useChartTabs(timeRange: TimeRangeCategory) {
  const { data } = useGetChartQuery({ params: { type: timeRange } });
  return useMemo(() => {
    if (!data)
      return [];
    switch (timeRange) {
      case 'week': return deriveWeekTabs(data.weekData);
      case 'month': return deriveMonthTabs(data.monthData);
      case 'year': return deriveYearTabs(data.yearData);
    }
  }, [data, timeRange]);
}
```

原 `setTabsByWeek/Month/Year` 三个 reducer → 一个 `useMemo` + 三个纯函数。

---

## 8. 当前 → 目标 映射表

### 8.1 顶层目录

| 当前 | 目标 | 动作 |
|------|------|------|
| `src/main.tsx` | `src/main.tsx` + `src/app/App.tsx` | 拆分 |
| `src/Root.tsx` | `src/widgets/layout/root-layout.tsx` | 迁入 + 改名 |
| `src/router/index.tsx` | `src/app/router.tsx` + `src/app/lazy-pages.tsx` | 拆分 |
| `src/i18n.ts` | `src/i18n.ts` | 留根 |
| `src/api/` | 按实体拆入 `entities/*/api.ts`;`index.ts` uploadFile → `shared/api/upload.ts`;`api.d.ts` → `shared/api/types.ts` | 拆分 |
| `src/hooks/query/` | `entities/*/hooks.ts` + `entities/*/keys.ts` | 重分布 |
| `src/hooks/mutation/` | `entities/*/hooks.ts` | 重分布 |
| `src/hooks/{useChart,useAsset*}.ts` | `shared/lib/use-chart.ts` / `entities/asset/lib/` | 迁入 |
| `src/components/ui/` | `src/shared/ui/` | 整体迁 |
| `src/components/`(顶层) | 去重后:设计系统项入 `shared/ui/`;实体级入 `entities/*/ui/`;layout 入 `widgets/layout/` | 分类迁 |
| `src/components/utils/baseProps.ts` | `src/shared/lib/component.ts`(合并) | 合并 |
| `src/components/reset.scss` | `src/assets/styles/reset.ts` | 迁 |
| `src/components/WwButton.tsx` | **保留**(非 `ui/button` 重复,是 antd-mobile Button 样式封装,EmailChange 仍用) | 保留 |
| `src/components/{LoginGuard,tab-bar}` | `src/widgets/layout/{login-guard,tab-bar}.tsx` | 迁 |
| `src/components/{NavBar,Input,FixedPin,icon}`(顶层) | **删除**(与 `ui/` 重复,迁引用后删旧) | 删 |
| `src/store/` | `features/auth/store.ts`(user 瘦身)+ 删除(system/chart/record) | 拆分 + 删 |
| `src/types/` | `entities/*/types.ts` | 重分布 |
| `src/constants/` | `shared/config/`(route)+ `entities/*/` | 拆分 |
| `src/config/` | `src/shared/config/index.ts` | 迁 |
| `src/modules/` | `src/shared/lib/{echarts,sound}.ts` | 迁 + 改名 |
| `src/utils/` | `src/shared/lib/*`(request 类 → `shared/api/`) | 拆分 |
| `src/shims.axios.d.ts` | `src/shared/api/axios-shim.d.ts` | 迁 |
| `src/vite-env.d.ts` | 留根 | 不动 |

### 8.2 pages 重命名全表(kebab-case 化)

| 当前 | 目标 |
|------|------|
| `pages/Asset/` | `pages/asset/{asset-manager,asset-detail,asset-chart,asset-form-info,add-asset-account}/` |
| `pages/Bill/` | `pages/bill/` |
| `pages/Budget/` | `pages/budget/{,create-category/}` |
| `pages/Chart/` | `pages/chart/{,chart-category/}` |
| `pages/CreateBudgetCategory/` | `pages/budget/create-category/` |
| `pages/Detail_editing/` | `pages/record/editing/` |
| `pages/detail/` | `pages/record/detail/` |
| `pages/Discovery/` | `pages/discovery/` |
| `pages/EmailChange/` | `pages/user/email-change/` |
| `pages/FirstScreen/` | `pages/first-screen/` |
| `pages/FixedExpenses/` | `pages/fixed-expense/{,create,detail,edit}/` |
| `pages/ForgetPassword/` | `pages/auth/forget-password/{,verify-code,reset}/` |
| `pages/Invoice/` | `pages/invoice/{,create,detail,edit}/` |
| `pages/Login/` | `pages/auth/login/` |
| `pages/Message/` | `pages/message/` |
| `pages/NotFound/` | `pages/NotFoundPage.tsx`(单文件) |
| `pages/Password/` | `pages/user/password/` |
| `pages/PostTopic/` | `pages/topic/post-topic/` |
| `pages/RecordCalendar/` | `pages/record/record-calendar/` |
| `pages/SearchRecord/` | `pages/record/search-record/` |
| `pages/Share/` | `pages/share/`(UI 逻辑同时入 `features/share/`) |
| `pages/Sign/` | `pages/auth/sign/` |
| `pages/TopicDetail/` | `pages/topic/topic-detail/` |
| `pages/UserInfo/` | `pages/user/user-info/` |
| `pages/bookkeeping/` | `pages/record/bookkeeping/` |
| `pages/comment-list/` | `pages/comment-list/` |
| `pages/community/` | `pages/community/{,personal,follow-list}/` |
| `pages/export-data/` | `pages/export-data/` |
| `pages/mine/` | `pages/mine/` |
| `pages/new-follow/` | `pages/new-follow/` |
| `pages/settings/` | `pages/settings/` |
| `pages/system-notify/` | `pages/system-notify/` |
| `pages/**/component/`(单数) | `pages/**/ui/`(统一为 FSD 标准段名) |

### 8.3 跨页类型下沉

| 当前 | 目标 | 理由 |
|------|------|------|
| `pages/detail/List.tsx` 导出的 `recordChildren` 类型,被 `pages/Detail_editing/index.tsx` 跨页 import | `entities/record/types.ts` | 跨页共享类型应下沉到 entity;消除 page 间直接依赖 |

---

## 9. 迁移阶段(增量,每阶段独立可验证)

> 每阶段产出独立 PR,完成后跑 `pnpm lint:type`(待 pnpm trust 阻塞解除)+ 路由冒烟。**每阶段都不破坏运行时行为**(除明确标注的状态管理重写)。

| 阶段 | 内容 | 风险 | 预计 |
|------|------|------|------|
| **P1 卫生修复** ✅ 已完成 | 实际执行:删 `store/record.ts` 死 persist(partialize 返回 `{}`,persist 无操作,store 本体保留待 P5 改 URL params);合并 `components/utils/`(baseProps + 重复的 composeExportComponent/mergerProps)入 `utils/component.ts`,删 `components/utils/` 目录,5 个 `ui/` 组件 import 改 `@/utils`。**未执行(已修正判断)**:`WwButton` 不是 `ui/button` 的重复(它是 antd-mobile Button 样式封装,仍被 EmailChange 使用),保留;`SuccessResponse` 显式 export 与 `shims.axios.d.ts` 迁移属结构性改动,并入 P2 | 低 | 0.5d |
| **P2 shared/ 落地** ✅ 已完成 | 新建 `shared/{api,lib,ui,config}`;迁 `utils/` `modules/` `config/` `constants/route.ts` `components/ui/`;迁 `hooks/useChart.ts` → `shared/lib/`;更新 `@/` import。详见 §14 P2 日志 | 中 | 2d |
| **P3 entities/ 落地** | 按实体拆 `api/` + `hooks/query/` + `hooks/query/keys/` + `types/` → `entities/<x>/{api,keys,hooks,types,ui}`;`recordChildren` 下沉 `entities/record/types.ts`;逐实体迁移(asset → invoice → fixed-expense → record → budget → topic → 余下);**query key 工厂逻辑零改动**(只改文件位置,避免缓存失效) | 中高 | 3-4d |
| **P4 features/ 落地** | 抽 `features/auth`(store 瘦身 + login-guard)、`features/email-captcha`、`features/share`、`features/check-in`;`features/record-form` 视 bookkeeping/editing 表单重合度决定是否抽;更新 pages 引用 | 中 | 1-2d |
| **P5 状态管理重写** | 删 `useSystemStore`(偏好归 RQ + sound 单例);删 `useChartStore`(改 useMemo + URL params);`useUserStore` 瘦身为 `useAuthStore`(只留 token);`userInfo` 改 RQ query;`searchRecordKeyword` 改 URL params;bill 页 store 改 URL params 或保留 | **高**(行为变化) | 2d |
| **P6 app/ + widgets/ 落地** | `main.tsx` 拆 `App.tsx` + `query-client.ts`;`router/index.tsx` 拆 `router.tsx` + `lazy-pages.tsx`;`Root.tsx` → `widgets/layout/root-layout.tsx`;`LoginGuard` + `tab-bar` → `widgets/layout/`;引入 `ROUTES_PATH` 替换裸字符串(roadmap M4);保留 `/cateGory` 兼容重定向 | 中 | 1d |
| **P7 pages 重命名 + 收尾** | 全量 pages kebab-case 化 + `*Page.tsx` 化;`Detail_editing`→`record/editing`;`detail`→`record/detail`;`component/`→`ui/`;删空目录(`api/` `hooks/` `components/` `store/` `types/` `constants/` `modules/` `utils/` `router/` `config/`);更新 AGENTS.md client 目录职责段 | 中(改 import 多) | 1-2d |

**总预计:10.5-13.5 工作日**。P3、P5 是关键风险点:P3 体量大(建议 per-entity 子 PR),P5 改变运行时行为(需充分冒烟)。

### 9.1 P5 状态管理重写的风险缓解

- `useAuthStore` 瘦身后,所有读 `useUserStore(s => s.userInfo)` 处改 `useGetCurrentUserQuery()` —— 全局搜索替换,逐处验证
- `useChartStore` 删除后,chart 页 tabs 改 useMemo —— 验证 tab 切换、数据刷新、登出后无残留
- `useSystemStore` 删除后,settings 页的"声音开关/金额可见"改读写 `usePatchUserAppConfigMutation` —— 验证服务端持久化生效
- 每个改动单独 commit,出问题精确 revert

---

## 10. 验收清单

### 10.1 结构合规
- [ ] `src/` 顶层仅剩:`app/ pages/ widgets/ features/ entities/ shared/ assets/` + `main.tsx` + `i18n.ts` + `vite-env.d.ts`
- [ ] 无同层 slice 互相导入(eslint `import/no-cycle` + 路径限制规则)
- [ ] 所有 slice 外部导入走 `index.ts` public API,无深路径
- [ ] `SuccessResponse` 显式 import,无 ambient global
- [ ] pages 全 kebab-case + `*Page.tsx`,无 `Detail_editing`、无 `component/` 单数
- [ ] slice 内组件在 `ui/` 段,无 `components/` 段
- [ ] 无 `export *`(除 `shared/ui/index.ts`)

### 10.2 状态管理合规
- [ ] 无 store 持有服务端数据(record/budget/asset 等只在 RQ)
- [ ] 无 store 持有派生数据(tabs/summary/percent 等用 useMemo)
- [ ] 无 store 复制服务端偏好(sound/visible 等走 user-app-config)
- [ ] `useAuthStore` 只持有 token,userInfo 走 RQ
- [ ] 搜索/筛选状态走 URL params
- [ ] Zustand store 都有显式 `partialize`(若用 persist)

### 10.3 行为不变(P5 除外)
- [ ] 所有路由路径不变(含 `/cateGory` 兼容重定向保留)
- [ ] React Query key 结构不变(P3 迁移不改 key 层级)
- [ ] 设计系统组件 API 不变
- [ ] P5 后:登录态、签到、声音、金额可见性、chart tab 切换、搜索词持久化 行为符合预期

### 10.4 工程门禁
- [ ] `pnpm lint:type` 通过
- [ ] `pnpm lint` 通过(待 pnpm trust 阻塞解除,roadmap M1)
- [ ] `pnpm build` 通过
- [ ] 核心路径冒烟:记账、编辑、预算、资产、发票、固定支出、社区发帖、登录、签到、声音开关、金额隐藏

---

## 11. 风险与回滚

| 风险 | 缓解 |
|------|------|
| React Query key 路径变了导致缓存失效 | P3 迁移时 **key 工厂逻辑零改动**,只改文件位置 |
| barrel 改动引发循环依赖 | 每阶段后跑 `pnpm lint:type` + `madge --circular src` |
| pages 重命名打断 git history | 用 `git mv` 保留 rename,PR 描述附 rename map |
| pnpm trust 阻塞 lint | P1-P7 不依赖 lint 通过,只依赖 typecheck;lint 修复并行进行(roadmap M1) |
| P5 状态重写改变运行时行为 | 单独 PR,充分冒烟,每个 store 删除单独 commit 便于精确 revert |
| 范围蔓延 | 严格按 P1-P7 顺序,每阶段 PR 不混入下一阶段内容 |

**回滚策略**:每阶段独立 PR,出问题 revert 单个 PR 即可回退到上一稳定态。P3(entities)建议拆 per-entity 子 PR。P5(状态重写)建议每 store 独立 PR。

---

## 12. 附录:已审计的稳定约定(保留项)

> 以下约定在当前代码中已稳定且符合最佳实践,重构中**保留不变**。

| 约定 | 说明 |
|------|------|
| `@/` 路径别名 | tsconfig + vite 已配,保留 |
| TS strict + `isolatedModules` + `noUnusedLocals/Parameters` | 保留 |
| React Query v4 + query key factory 模式 | 保留(key 工厂逻辑零改动) |
| `SuccessResponse<T>` 响应契约 | 保留结构,仅改声明方式(ambient → 显式 export) |
| hash router(`createHashRouter`) | 保留(移动端兼容) |
| 路由全 lazy + Suspense | 保留 |
| 设计系统 `.md` + `demos/` 文档结构 | 保留(`shared/ui/` 下) |
| Sass + Tailwind 共用 | 保留(全局 Tailwind + 局部 .module.scss) |
| `mathjs` 用于金额计算 | 保留(避免浮点误差) |
| `dayjs` + `date-fns` 共存 | 保留(已有混用,不强求统一) |
| antd-mobile 作为基础组件库 | 保留 |
| i18n(i18next + react-i18next) | 保留 |
| axios 单实例 + 拦截器 | 保留(迁 `shared/api/http.ts`) |
| commitizen + husky + lint-staged | 保留 |
| `@antfu/eslint-config` + 分号 | 保留 |

### 12.1 需同步更新的文档

| 文档 | 更新时机 | 更新内容 |
|------|----------|----------|
| `AGENTS.md` | P7 收尾 | client 目录职责段改为 FSD 结构;状态管理规范段补充"派生不存储/服务端偏好归 RQ"原则 |
| `DESIGN.md` | 不动 | 视觉规则与结构无关 |
| `docs/frontend-audit-roadmap.md` | P7 收尾 | 标注 M4(ROUTES_PATH)/ M5(组件归一)与本方案 P6/P2-P3 的对应关系,避免重复执行 |
| `docs/flowcharts/feature-flows.md` | 不动 | 业务流程文档与结构无关 |

### 12.2 `shared/ui` 清理规则(antd-mobile 替代)

`shared/ui/`(原 `components/ui/`)是早期参考 antd-mobile 封装的组件库,后因维护成本已整体迁回 antd-mobile。重构中按以下规则清理:

- **发现页面已用 antd-mobile 同类组件** → 删除 `shared/ui/` 对应组件(迁移引用后删)
- **无 antd-mobile 替代** → 保留 `shared/ui/` 组件

`shared/ui/` 现有组件与 antd-mobile 对应关系(待逐个核查页面实际用法):

| shared/ui 组件 | antd-mobile 对应 | 处理倾向 |
|---------------|-----------------|----------|
| button | `Button` | 核查后删 |
| input | `Input` | 核查后删 |
| list | `List` + `ListItem` | 核查后删 |
| mask | `Mask` | 核查后删 |
| modal | `Dialog` / `Modal` | 核查后删 |
| nav-bar | `NavBar` | 核查后删 |
| progress-bar | `ProgressBar` | 核查后删 |
| progress-circle | `ProgressCircle` | 核查后删 |
| switch | `Switch` | 核查后删 |
| image-preview | `ImageViewer` | 核查后删 |
| icon | (无直接对应,有 `antd-mobile-icons`) | 保留 |
| comment | (无) | 保留 |
| fixed-pin | (无) | 保留 |
| gap | (无) | 保留 |
| share | (无) | 保留 |

执行时机:P3 接触页面时顺带核查;或单独一个清理 PR。不盲删 — 必须确认页面已切到 antd-mobile 再删。

---

## 13. 决策记录(本次方案裁决)

| 议题 | 裁决 | 理由 |
|------|------|------|
| `store/system.ts` 去留 | 删除 | 全部状态有更合适的归属(服务端偏好归 RQ,sound 归单例,localStorageSize 归组件) |
| `store/record.ts` 去留 | 删除 | `searchRecordKeyword` 改 URL params;当前 persist 返回 `{}` 是死代码 |
| `store/chart.ts` 去留 | 删除 | `tabs` 是派生数据应改 useMemo;UI 状态改 URL params |
| `store/user.ts` 去留 | 瘦身 | 只留 token;userInfo 走 RQ;消除跨 store 耦合 |
| `pages/detail/` 与 `pages/Detail_editing/` 关系 | 两个不同页面,都归 `pages/record/` | detail=按时间浏览流水(`/detail`);editing=记录编辑(`/editing/:id`);共享类型 `recordChildren` 下沉 `entities/record/types.ts` |
| `features/record-form/` 抽取时机 | 留到 P4 视情况 | bookkeeping 与 editing 表单重合度需实际比对后决定 |
| `widgets/` 创建 | 仅 `widgets/layout/`(P6) | Root + LoginGuard + TabBar 是明确的跨页 layout 组合;其他不预设 |
| slice 内 `components/` 目录 | 改 `ui/` | `components/` 非 FSD 标准段名;`shared/components/` 不存在,业务组件重分布到 entity/shared/widgets |
| `WwButton` 去留(P1 执行时修正) | 保留 | 原方案误判为 `ui/button` 重复;实际是 antd-mobile Button 样式封装,被 EmailChange 两处使用,与自定义 `ui/button`(纯 `<button>`)职责不同 |

---

## 14. 执行进度日志

> 每阶段完成后追加,记录实际执行内容与方案偏差。

### P1 卫生修复 — 2026-07-04 ✅

**实际执行**:
- `src/store/record.ts`:删除 no-op `persist` 包装(`partialize` 返回 `{}`),保留 store 本体(P5 再改 URL params)
- `src/utils/component.ts`:合并 `BaseProps` + `withBaseProps`;`composeExportComponent` 的 `hasOwnProperty` 升级为 `Object.hasOwn`
- 删除 `src/components/utils/{baseProps.ts,index.ts}` 及目录
- 5 个 `ui/` 组件 import 路径 `'../../utils'` → `'@/utils'`:`progress-circle`、`progress-bar`、`gap`、`list`、`switch`

**未执行(已修正)**:
- `WwButton` 删除 — 方案误判,实际仍是有效组件,保留
- `SuccessResponse` 显式 export、`shims.axios.d.ts` 迁移 — 并入 P2

**验证**:`npx tsc -b --noEmit` 通过;`npx eslint --fix <changed>` exit 0
**改动**:9 文件,+39/-61 行

### P2 shared/ 落地 — 2026-07-04 ✅

按 5 个子步推进,每步独立 tsc 验证。

**P2.1 `modules/` → `shared/lib/`**:
- `git mv` echarts.ts、AudioWeb.ts(→ audio-web.ts)、playSound.ts(→ play-sound.ts),删 barrel
- 14 处 `@/modules` import → `@/shared/lib/{echarts,play-sound}`

**P2.2 `config/` + `constants/route.ts` → `shared/config/`**:
- `git mv` config/index.ts → shared/config/index.ts;constants/route.ts → shared/config/routes.ts
- constants/index.ts 删 `export * from './route'`(保留 AUDIO_LIST + COUNTDOWN_TIME_SECOND + asset)
- 13 处 `ROUTES_PATH` import → `@/shared/config/routes`;7 处 `@/config` → `@/shared/config`

**P2.3 `utils/` → `shared/lib/` + `shared/api/`**(最大子步,77 barrel + 14 subpath import):
- `shared/api/`:http.ts(← request.ts)、request-process.ts、is-success.ts、index.ts barrel(导出 `request` + `isSuccessApi`)
- `shared/lib/`:component.ts、system.ts、regular.ts、math.ts、amount.ts、class-name.ts、date-time.ts(← DataTime.ts)、chose-file.ts、export-data.ts、time.ts、index.ts barrel(downloadCanvas + 6 个 re-export)
- http.ts 内部 `@/utils/requestProcess` → `./request-process`
- import 拆分:`request`/`isSuccessApi` → `@/shared/api`;`isSuccessApi + normalizeAmount` 拆成两行(2 文件 Edit);其余 → `@/shared/lib`
- 删 `utils/` 目录

**P2.4 `components/ui/` → `shared/ui/`**:
- `git mv src/components/ui src/shared/ui`(整体移动)
- 47 处 `@/components/ui/index.ts` → `@/shared/ui`(顺便清理 `/index.ts` 后缀)

**P2.5 `hooks/useChart.ts` → `shared/lib/use-chart.ts`**:
- `git mv` + 重命名;hooks/index.ts 删 re-export
- 3 处 `useChart` import:`@/hooks` → `@/shared/lib/use-chart`;AssetTrendChart 的合并 import 拆分(Edit)

**遗留(待后续阶段)**:
- `SuccessResponse` 仍是 `api/api.d.ts` 的 ambient 全局类型 — 显式 export 迁移并入 P3(随 entities/api 类型一起处理)
- `shims.axios.d.ts` 仍在根 — 并入 P3(随 shared/api 稳定后处理)
- `components/` 顶层业务组件(BudgetItem、RecordList、LoginGuard、tab-bar 等)未重分布 — 按 P3(entity UI)、P6(widgets/layout)处理
- `constants/`(AUDIO_LIST、COUNTDOWN_TIME_SECOND、asset.ts)未迁 — P3 随 entity 处理

**验证**:每子步 `npx tsc -b --noEmit` 通过;关键文件 `npx eslint --fix` exit 0
**改动**:234 文件(P2 全程累计)

### P2.6 shared/ui 清理(antd-mobile 替代)— 2026-07-04 ✅

按 §12.2 规则核查 `shared/ui` 各组件实际引用,删除 0 引用且有 antd-mobile 对应的组件:
- 删 `progress-bar/`(0 引用,antd-mobile 有 `ProgressBar`)
- 删 `progress-circle/`(0 引用,antd-mobile 有 `ProgressCircle`)
- 删 `switch/`(0 引用,settings 页已用 antd-mobile `Switch`)
- 保留 `mask/`(虽 0 页面引用,但是 `image-preview`/`share`/`modal` 的内部依赖)
- 保留 `button`/`input`/`list`/`modal`/`nav-bar`/`image-preview`(仍有页面引用,待后续核查是否已切 antd-mobile)
- 保留 `icon`/`comment`/`fixed-pin`/`gap`/`share`(无 antd-mobile 对应)

commit `17 files changed, +29/-395`。tsc + eslint 通过。

### P3.1 asset 实体抽取 — 2026-07-04 ✅

第一个 entity,作为 per-entity sub-PR 模板。

**新建 `entities/asset/`**:
- `types.ts` ← 合并 `types/asset.ts`(AssetGroupType、AssetType)+ `pages/Asset/AssetChart/types.ts`(AssetStatisticalRecordType)+ api/asset.ts 内联类型(Asset、AssetGroup、AssetRecord、AssetStatisticalRecord、AssetGroupAssetType)
- `api.ts` ← `api/asset.ts`(接口函数 + 请求/响应类型,AssetStatisticalRecordType 改从 `./types` 导入)
- `keys.ts` ← `hooks/query/keys/assetKeys.ts`(类型改从 `./api` 导入)
- `hooks.ts` ← 聚合 6 query + 3 mutation hook(9 个原文件合并,internal import 改 `./api` `./keys`)
- `constants.ts` ← `constants/asset.ts`(AssetGroupType 改从 `./types` 导入)
- `lib/use-asset-summary.ts` ← `hooks/useAssetSummaryInfo.ts`(import 改 `../api` `../hooks`)
- `lib/use-asset-statistical-record.ts` ← `hooks/useAssetStatisticalRecord.ts`
- `index.ts` barrel

**删除**:`types/` 目录(空)、`pages/Asset/AssetChart/types.ts`、9 个旧 hook 文件

**Barrel 清理**:`api/index.ts`、`hooks/index.ts`、`hooks/query/index.ts`、`hooks/mutation/index.ts`、`constants/index.ts`、`types/index.ts` 移除 asset re-export

**Consumer 更新**(13 个页面/组件):`@/api` / `@/hooks` → `@/entities/asset`(所有 consumer 只 import asset 相关项,无混入,可直接替换)

**附带修复**:`shared/lib/play-sound.ts` 的 `playSound` 从 default export 改为 named export — P2.1 迁移时 `@/modules` barrel 把 default 转 named,移到 `shared/lib/play-sound.ts` 后丢了 named export,被 tsc 增量缓存掩盖,清缓存后暴露并修复

**验证**:`npx tsc -b --noEmit`(清缓存)0 error;`npx eslint` 0 error
**commit** `3c1a2b1`,39 文件,+294/-335

**模板经验**(供后续 entity 参考):
- tsc 增量缓存(`.tsbuildinfo`)可能掩盖错误,entity 迁移后清缓存复验
- consumer 若只 import 单 entity 项,可 sed 直接替换 `@/api`/`@/hooks` → `@/entities/<x>`
- hooks 聚合到单文件 `hooks.ts` 可行(9 个 hook ~280 行)
- 跨层类型(如 `AssetStatisticalRecordType` 在 pages/)随 entity 一起收敛

### P3.2 invoice 实体抽取 — 2026-07-04 ✅

较 asset 简单(无独立 types/constants/lib)。`entities/invoice/` 含 api、keys、hooks(5 聚合)、index。5 个 consumer(`pages/Invoice/*`)全 import invoice 项,直接 sed。commit 17 文件,+130/-150。

### P3.3 fixed-expense 实体抽取 — 2026-07-04 ✅

5 enum + 多类型。`entities/fixed-expense/` 含 api、keys、hooks(5 聚合)、index。8 个 consumer(`pages/FixedExpenses/*` 含 constants.ts、utils.ts)全 fixed-expense 项,直接 sed。commit `25aae2e`,25 文件。

### P3.4a record 实体抽取(数据层)— 2026-07-04 ✅

最大实体(api 105 行 + 6 hooks + 跨页类型)。`entities/record/` 含 api、keys、hooks(6 聚合)、types、index。

**关键处理**:
- `recordChildren` 类型从 `pages/detail/List.tsx` 移到 `entities/record/types.ts`,消除 6 处跨页 import(`@/pages/detail/List` / `../detail/List`)
- 2 个 MIXED consumer 拆分:`bookkeeping/keyboard.tsx`(`CategoryEntity` 留 `@/api` + `PutRecordApiData` 转 entity)、`Chart/ChartCategory.tsx`(chart 类型留 `@/api` + `RecordEntry` 转 entity)
- `pages/detail/List.tsx` 移除 interface 定义,改 import
- record hooks 暂从 `@/hooks/query` 引 `chartKeys`(过渡,chart entity 抽取后改 `@/entities/chart`)

commit 31 文件,+250/-266。UI 组件(RecordList、RecordListItem、CurrentMonthBillCard)留 P3.4b。

---

本方案到此。后续推进从 P1 起步,每阶段独立 PR。

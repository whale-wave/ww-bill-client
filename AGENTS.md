# AGENTS.md

## 通用规范

本文件适用于 `ww-bill-admin`、`ww-bill-client`、`ww-bill-service` 三个项目。处理代码时先理解现有目录结构、业务行为、接口调用链、状态来源和校验方式，再进行修改。

优先采用当前项目已有实现方式，保持代码风格、目录边界和业务行为一致。不要未经确认做大规模重构，不为了抽象而抽象，不为了所谓最佳实践破坏现有稳定逻辑。

涉及库、框架、SDK、API、CLI 或云服务的用法问题时，优先使用 Context7 MCP 获取当前官方文档。除非用户提供 `/org/project` 格式的精确库 ID，否则先 `resolve-library-id`，再用选定的库 ID `query-docs`。

如果项目内存在 `DESIGN.md`，涉及 UI 视觉、组件外观、页面结构、颜色、字体、间距、圆角、图表表达和禁止风格时，以 `DESIGN.md` 为准。`AGENTS.md` 只记录工程约束、目录职责、编码规范、校验命令、状态和请求组织。

如果项目内存在 `specs/**/plan.md`，并且当前任务属于该 feature 范围，先阅读对应 plan，了解技术栈、项目结构、契约、验证命令和实现约束。

### AGENTS.md 维护

对话、开发和审查过程中，如果同类问题反复出现，并且可以沉淀为稳定、可复用的工程规则，应主动把规则补充到 `AGENTS.md` 中，作为后续协作约束。不要记录一次性问题、临时偏好或已经过期的背景信息。

每次更新 `AGENTS.md` 时，必须同时修改以下三个位置，并保持内容完全一致：

- `ww-bill-admin/AGENTS.md`
- `ww-bill-client/AGENTS.md`
- `ww-bill-service/AGENTS.md`

更新后需要校验三份文件内容一致，并执行对应仓库的 Markdown 空白检查：

```bash
shasum -a 256 ww-bill-admin/AGENTS.md ww-bill-client/AGENTS.md ww-bill-service/AGENTS.md
git diff --check
```

### Markdown 代码片段

在 Markdown 中记录代码时，只有可以作为独立示例通过对应语言 ESLint / TypeScript 校验的内容，才使用带语言标识的代码块。短 decorator、类型名、单行调用、配置项片段或其它不完整代码，必须用行内反引号包裹，例如 `@UseGuards(JwtAuthGuard)`，不要写成带 `ts` 语言标识的 fenced code block。

修改代码文件后做针对性校验：

```bash
npx eslint --fix <修改的代码文件>
```

只修改 Markdown、说明文档或非代码文件时，不需要运行 ESLint / TypeScript / Jest，但需要执行：

```bash
git diff --check
```

较大改动、跨模块类型变更、路由、store、API 类型、缓存策略或业务逻辑变更完成后，继续执行对应项目的 lint、typecheck 或 test 命令。命令以各项目 `package.json` 为准，不凭经验改脚本。

命名要求：

- 不使用 `type1`、`list`、`keyToggle` 这类不表意命名，优先使用 `recordType`、`categoryList`、`selectedCategoryId`。
- 布尔状态使用 `isXxx`、`showXxx`、`hasXxx` 等前缀。
- 事件处理函数使用 `handleXxx` 前缀，`onXxx` 留给 props。
- 不写无意义变量重命名，例如 `const state = list`。
- 注意拼写，避免 `setSateList` 这类错误。

TypeScript 要求：

- 禁止新增不必要的 `any`。
- 优先使用明确的 `interface`、`type`、`unknown`、现有 API 类型或后端实体对应类型。
- 能通过类型推导保持清晰的场景，不重复声明冗余类型。
- 多个可选参数使用 options object，避免长参数列表。

文档补充场景：

- 新增完整业务功能。
- 新增复杂业务流程。
- 新增跨页面复用能力。
- 新增或调整重要接口模块。
- 调整页面流程、缓存策略、登录态或持久化策略。

文档优先放在 `docs/`。流程类文档放在 `docs/flowcharts/`。需要保留实现背景或维护上下文时，补充到 `docs/context/`。

## 前端规范

本节适用于 `ww-bill-client` 和 `ww-bill-admin`。

### 前端项目差异

`ww-bill-client` 是移动端账本/财务工具前端，主要技术栈以 `package.json` 为准，当前包括：

- Vite
- React 18
- TypeScript
- React Router 6
- TanStack React Query 4
- Zustand 4
- Ant Design Mobile 5
- Tailwind CSS 3
- Sass
- Axios
- ECharts

常用命令：

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm lint:type
pnpm lint:fix
```

`ww-bill-admin` 是管理端前端，主要技术栈以 `package.json` 为准，当前包括：

- Vite
- React 19
- TypeScript
- TanStack React Query 5
- TanStack React Router
- Zustand 5
- Ant Design 5
- Ant Design Pro Components
- Tailwind CSS 4
- Axios
- ECharts
- React Hook Form
- Zod
- Vitest

常用命令：

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm lint:fix
pnpm test
```

### 前端目录职责

`ww-bill-client` 已迁移到 Feature-Sliced Design (FSD) 架构。主要目录：

```text
src/
├── app/           应用初始化 — App.tsx (Provider 装配) + router.tsx (路由树)
├── pages/         路由页面 (薄编排层, kebab-case 目录 + *Page.tsx 命名)
├── widgets/       页面级组合组件 (仅 layout: RootLayout + TabBar)
├── features/      跨页面可复用用户能力 (auth, email-captcha)
├── entities/      业务实体 — api + keys + hooks + types + ui (项目最厚的层)
├── shared/        跨切面共享
│   ├── api/       HTTP 实例 + SuccessResponse + upload + 拦截器
│   ├── lib/       纯工具 + 第三方封装 + 通用 hook
│   ├── ui/        设计系统 (基础组件, 无 antd-mobile 对应的保留)
│   └── config/    env 配置 + 路由常量
└── assets/        静态资源、图片、全局样式
```

**FSD 导入方向** (硬性规则): `app → pages → widgets → features → entities → shared`。上层可导入下层，同层 slice 之间禁止互相导入。每个 slice 通过 `index.ts` 暴露 public API。

**Page 规范**:
- 目录: kebab-case (如 `pages/record/bookkeeping/`)
- 文件: `*Page.tsx` (如 `BookkeepingPage.tsx`)
- 私有组件: `ui/` (非 `components/`)
- 页面级状态: `model/` (非 `store/` 或 `hooks/`)

**Entity 结构**:
```
entities/record/
├── api.ts        # 接口函数 + 请求/响应类型
├── keys.ts       # query key factory
├── hooks.ts      # useGet/usePost/usePut/useDelete hooks
├── types.ts      # 实体领域类型
├── ui/           # 实体级展示原语
└── index.ts      # public API barrel
```

状态管理原则:
- 服务端数据 → React Query (不进 Zustand)
- 派生数据 → useMemo (不进 store)
- 鉴权 token → features/auth/model/store.ts (Zustand persist)
- 用户偏好 → entities/user-app-config (RQ)
- 搜索/筛选 → URL search params
- 页面 UI 状态 → pages/<page>/model/ 或组件 local state

`ww-bill-admin` 主要目录：

```text
src/
├── app/          应用启动、全局 provider、路由接入
├── assets/       静态资源
├── entities/     实体类型、OpenAPI 生成类型
├── features/     业务能力模块
├── mocks/        MSW mock
├── pages/        路由页面
├── shared/       共享 API、工具和 UI
├── styles/       全局样式
└── widgets/      页面级组合组件和布局组件
```

新增代码优先放在现有职责目录中。不要凭空新增新的长期分层，除非用户明确要求或项目已经形成对应边界。

### 页面与组件

页面统一放在 `src/pages/`。页面私有组件优先放在对应页面目录下的 `ui/`。跨页面复用的业务组件按项目现有边界放入 `src/entities/*/ui/`、`src/shared/ui/` 或 `src/widgets/`。

组件抽象遵循三次原则：

- 相同逻辑或 UI 多次出现，再考虑抽象。
- 多个页面依赖同一能力，再考虑放入共享组件或共享 hook。
- 只有一处使用且逻辑简单时，不提前抽象。

组件编写要求：

- 默认使用函数组件和 TypeScript。
- props 必须有清晰类型，避免新增不必要的 `any`。
- 页面组件负责业务编排、路由参数、请求 hook 和状态组合。
- 展示组件负责 UI、局部交互和明确的 props/callback 输入输出。
- 不让子组件隐式依赖父页面的路由、store 或请求细节，除非它本身就是业务容器。
- 大组件拆分时先按 UI 区块拆，再按状态和副作用抽 hook。

Hook 放在组件顶部，推荐顺序：

1. React 内置 Hook。
2. Router Hook。
3. React Query Hook。
4. Zustand Hook。
5. 自定义 Hook。
6. 普通函数和返回值。

派生数据优先使用 `useMemo`，不要用 `useEffect` + `useState` 保存可以直接从 props/state 计算出的值。`useEffect` 依赖必须完整，或者通过 `useCallback` / `useMemo` 稳定化。

列表渲染不要用数组索引作为 key，除非列表静态、不会重排插入删除且没有唯一 ID。优先使用业务 ID，例如 `item.id`、`item.key`。

事件处理避免无意义箭头函数包装。无需传参时直接传 `handleXxx`，需要传参时再使用箭头函数。

相关联的数据放在同一结构中，不要用两个数组靠 index 配对。移除无意义注释、空标签和不必要检查。只处理 `null` / `undefined` 时优先使用 `??`，不要误用 `||`。

### 前端 API 与请求

前端请求必须复用项目已有 request 实例和错误处理，不在页面组件中直接使用 axios 请求后端。

`ww-bill-client` API 请求统一放在 `src/entities/<entity>/api.ts` 或 `src/shared/api/`，新增 API 后需要在对应 entity 的 `index.ts` 中按现有方式导出。接口响应类型优先沿用 `SuccessResponse<T>`。如果后端金额字段以字符串返回，前端类型也保持字符串，不擅自改成 number。

`ww-bill-client` 的 `request` HTTP/网络失败分支必须 reject 一个带 `statusCode`、`message`、`data` 字段的 Error 对象。无 response、timeout、401/402/403 都应走统一错误处理，不在页面中自行拼 axios error 结构。HTTP 2xx 的后端业务 envelope 仍保持 resolve，由调用方或 query hook 根据 `statusCode` 判断业务成功与否。

`ww-bill-admin` 优先沿用 `src/shared/api/`、`src/entities/api-types.ts` 和既有 feature 内请求组织。需要同步接口类型时使用项目现有 `typegen` 脚本，不手写大段可生成类型。

### React Query

服务端数据获取优先使用 TanStack React Query。注意两个前端版本不同：`ww-bill-client` 使用 v4，`ww-bill-admin` 使用 v5。涉及 API 细节、迁移或配置差异时必须通过 Context7 查询当前文档。

Query key 按业务资源组织，不按 hook 名字组织。涉及复杂业务、列表/详情组合或会被 mutation 失效的 key，优先抽成领域 key helper。

不要新增 `useGetXxxQueryQueryKey = 'useGetXxxQuery'` 这类以 hook 名字命名的 key。hook 名字不是业务资源，后续列表、详情、统计和批量失效会变得难维护。

Query hook 负责解开接口响应壳，页面优先消费派生后的业务数据，不要在页面中反复判断 `response?.statusCode`。同一领域内默认值保持一致：

- 列表默认 `[]`。
- 详情默认 `undefined`。
- 统计或汇总对象需要提供明确的 `emptySummary` / `emptyInfo`。

Query hook 参数使用 options object。请求参数放 `params`，React Query 配置放 `queryOptions`，不要只支持 `enabled` 一个字段；需要排除 `queryKey` 和 `queryFn`，由 hook 内部固定。

Mutation hook 内部使用 `useQueryClient()` 获取 client，不要 import 全局 `queryClient`。Mutation 成功后，如果影响列表、详情、统计或用户信息，必须通过 `queryClient.invalidateQueries` 刷新相关 query。

多个缓存需要失效时，必须分别调用 `invalidateQueries`，不要把多个 key 塞进同一个 `queryKey` 数组。

不要为了统一而抽象通用 CRUD hook factory。当前业务的缓存关系不完全标准化，抽象边界最多到领域 key helper、单个 query hook、单个 mutation hook，必要时再抽很小的 invalidate 工具。

`ww-bill-client` hook 返回结构沿用现有模式：

- query hook 返回 `response`、派生后的业务数据和 React Query 其余状态。
- mutation hook 返回 `[mutateAsync, rest] as const`。

新代码可以优先返回 mutation object，但如果改动会牵动旧页面调用，先保留 tuple 形态，避免无关重写。

`ww-bill-client` 社区、话题、关注相关页面禁止直接调用 `src/api/topic.ts` 或 `src/api/follow.ts` 的写接口。发帖、点赞、评论、关注和取消关注必须通过 `src/hooks/mutation/` 中的领域 mutation hook；详情、个人主页、评论列表和关注列表必须通过 `src/hooks/query/` 中的 query hook，并从 `src/hooks` barrel 导入。

### Zustand 与前端状态

全局客户端状态放在项目现有 store 目录或状态模块中。适合放入 store 的内容：

- 登录态、token 和用户信息。
- 跨页面共享的 UI 或业务状态。
- 需要持久化到 localStorage 的状态。

不适合放入 store 的内容：

- 可通过 React Query 获取的服务端数据。
- 页面局部临时表单状态。
- 只在单个组件中使用的 UI 状态。

涉及登录退出时，需要注意清理缓存和持久化状态。

### 前端路由

`ww-bill-client` 路由统一维护在 `src/app/router.tsx`，项目使用 `createHashRouter`，不要擅自切换为 browser router。新增页面后在 `src/pages/` 中创建 kebab-case 目录 + `*Page.tsx` 入口，在路由文件中注册 path 和 lazy import，需要登录访问的页面使用 `lazyGuardedPage`。路由路径常量优先复用 `src/shared/config/routes.ts` 中的 `ROUTES_PATH`。

`ww-bill-admin` 使用 TanStack React Router，路由组织按现有 `src/app`、`src/pages` 和布局组件约定执行，不混入 React Router 6 写法。

### 前端样式与 UI

样式和视觉规则遵循项目内 `DESIGN.md`。

`ww-bill-client`：

- 移动端交互优先使用 Ant Design Mobile。
- 样式优先使用 Tailwind CSS、项目已有 Sass、`global.scss` 中的全局类和 `DESIGN.md` 中的规则。
- 图标优先复用 `antd-mobile-icons` 或 `src/shared/ui/icon`。
- 页面根容器优先使用 `.page` 或 `.page-new`。
- 主色通过 `var(--ww-theme-color)`、`bg-primary` 或 `text-primary` 使用。
- Ant Design Mobile 变量已在 `global.scss` 中做全局映射，不随意改全局变量。

`ww-bill-admin`：

- 管理端交互优先使用 Ant Design、Pro Components 和项目已有 `shared/ui`。
- 图标优先复用当前项目已引入的图标体系，例如 `lucide-react`。
- 表单优先沿用现有 React Hook Form / Zod / Ant Design 组合方式。
- 不随意新增新的 UI 框架、图标库或按钮/输入框体系。

通用样式要求：

- 常规布局、间距、颜色、字号优先使用现有 Tailwind class 或已有样式体系。
- 每次新增或修改样式、处理 `style` 属性、CSS Module、Sass 或全局 CSS 时，先判断能否迁移为 Tailwind class；能用 Tailwind 清晰表达的布局、间距、尺寸、定位、变换、过渡、颜色、字号等，不新增或保留行内 style / 简单 CSS。
- 当前前端样式入口未引入 `@tailwind base`，Tailwind 的 `translate-*`、`rotate-*`、`scale-*` 等 transform 工具类依赖未初始化的 `--tw-*` 变量时可能失效；迁移 transform 行内样式时，优先使用 Tailwind arbitrary property（如 `[transform:translateX(-50%)]`、`[transform:rotate(180deg)]`），除非已经确认对应页面有完整变量初始化。
- 页面级样式只保留复杂选择器、第三方组件局部覆盖、伪元素、keyframes 或无法清晰表达为 class 的局部修正。
- UI 改动后检查 `DESIGN.md` 是否需要同步更新；工程执行规则写入 `AGENTS.md`，视觉规则写入 `DESIGN.md`。

### 前端校验

修改前端代码文件后执行：

```bash
npx eslint --fix <修改的代码文件>
```

`ww-bill-client` 较大 TypeScript 改动、路由、store、API 类型、React Query hook 或跨模块类型变更完成后执行：

```bash
pnpm lint:type
```

影响范围较大或准备交付前执行：

```bash
pnpm lint
pnpm lint:type
```

`ww-bill-admin` 较大改动或准备交付前执行：

```bash
pnpm lint
pnpm test
```

## 后端规范

本节适用于 `ww-bill-service`。

### 后端技术栈与命令

后端项目位于 `ww-bill-service`，主要技术栈以 `package.json` 为准，当前包括：

- NestJS 10
- TypeORM 0.2.x
- PostgreSQL
- Jest
- Swagger
- class-validator / class-transformer

运行环境以 `package.json` 为准，当前 Node.js 要求为 `>=24.15.0`。

常用命令：

```bash
yarn start:dev
yarn build
yarn test
yarn test:e2e
yarn lint
yarn lint:fix
yarn migration
```

### 后端模块

新增业务模块统一放在：

```text
src/modules/<module-name>/
```

优先沿用现有模块结构：

```text
src/modules/<module-name>/
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── <module-name>.module.ts
└── dto/
```

Controller 负责：

- 路由定义。
- 鉴权声明。
- 参数 DTO 接收。
- Swagger 注解。
- 响应封装。

Service 负责：

- 业务逻辑。
- 数据查询与写入。
- 业务计算。
- 多 Repository 协作。

需要登录的接口使用：

`@UseGuards(JwtAuthGuard)`

Swagger Bearer 认证使用：

`@ApiBearerAuth('Token')`

响应结构优先复用现有工具：

- `success`
- `created`
- `updated`
- `deleted`
- `fail`
- `sendSuccess`
- `sendError`

禁止在新增接口中随意返回未封装的响应结构。

### DTO 与接口

所有接口入参优先定义 DTO，并使用 `class-validator` 做校验。

DTO 中需要补充 Swagger decorator，例如：

- `@ApiProperty`
- `@ApiPropertyOptional`

Query 参数存在类型转换需求时，使用 `class-transformer`，例如字符串布尔值转换为 boolean。

项目已启用全局 `ValidationPipe`，关键配置为 `transform: true`、`whitelist: true`、`forbidNonWhitelisted: true`。

新增 DTO 时需要确保：

- 请求字段都在 DTO 中声明。
- 可选字段使用 `@IsOptional()`。
- 枚举字段使用 `@IsEnum()`。
- 数字字符串、日期、UUID 等类型按现有 DTO 风格使用对应 validator。

### Entity 与数据库

Entity 统一放在：

```text
src/entity/
```

新增表对应的 Entity 优先继承：`BaseColumn`。

字段定义需要补充 TypeORM column 配置，优先保持现有风格：

- `type`
- `comment`
- `default`
- `nullable`

金额类字段沿用当前项目约定：

- 数据库存储为字符串金额。
- 计算时使用 `mathHelper`。
- 禁止直接使用 JavaScript 浮点数进行金额计算。

数据库结构变更需要同步：

- Entity 定义。
- `migrations/sql/` 下的迁移 SQL。

迁移执行使用：

```bash
yarn migration
```

### 后端 ESLint 与类型

项目使用 `@antfu/eslint-config`，并开启分号风格。

每次变更的文件如果属于 ESLint 校验范围，都需要执行：

```bash
npx eslint --fix <变更的文件>
```

多个文件：

```bash
npx eslint --fix src/modules/user/user.service.ts src/modules/user/user.controller.ts
```

较大 TypeScript 改动完成后，执行：

```bash
yarn lint
```

Nest metadata 依赖运行时类型时，不要强行改成 `import type`。例如 DTO、Service、Entity 在 decorator metadata 或依赖注入中需要作为运行时值使用时，应保持普通 import。

### 后端测试

项目使用 Jest，测试文件沿用：

```text
*.spec.ts
```

以下情况优先补充或更新测试：

- 新增 Service 能力。
- 修改业务逻辑。
- 修改金额、统计、日期等计算逻辑。
- 新增复杂查询条件。
- 修复已有 bug。

常用测试命令：

```bash
yarn test
yarn test:e2e
```

文档修改本身不需要运行后端测试。

# Frontend Agents Guide

本项目是 `ww-bill-client`，一个移动端账本/财务工具前端。处理代码时优先理解现有页面结构、接口调用链、React Query 缓存来源和 Zustand 状态来源，保持当前目录边界、交互模式和视觉规范一致。

不要为了局部需求引入新的分层体系、UI 框架或大规模重构。优先保证业务功能正确，再考虑局部代码整理。

## 文档与资料

涉及 UI 视觉、组件外观、页面结构、颜色、字体、间距、圆角、图表表达和禁止风格时，以 `DESIGN.md` 为准。

涉及库、框架、SDK、API、CLI 或云服务的用法问题时，优先使用 Context7 MCP 获取当前官方文档。除非用户提供 `/org/project` 格式的精确库 ID，否则先 `resolve-library-id`，再用选定的库 ID `query-docs`。

协作分工：

- `AGENTS.md`：工程约束、目录职责、编码规范、校验命令、状态和请求组织。
- `DESIGN.md`：产品气质、视觉系统、页面模式、组件外观和 UI 禁止事项。
- `docs/`：复杂业务流程、跨页面功能说明、接口依赖和后续维护背景。

## 技术栈

以 `package.json` 为准，当前主要技术栈包括：

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

## 代码校验

修改代码文件后做针对性校验：

```bash
npx eslint --fix <修改的代码文件>
```

较大 TypeScript 改动、路由、store、API 类型、React Query hook 或跨模块类型变更完成后，继续执行：

```bash
pnpm lint:type
```

影响范围较大或准备交付前，执行：

```bash
pnpm lint
pnpm lint:type
```

只修改 Markdown、说明文档或非代码文件时，不需要运行 ESLint / TypeScript 校验，但需要执行：

```bash
git diff --check
```

如果本地使用 yarn，也必须以 `package.json` 中脚本名为准，不凭经验改脚本。

## 项目结构

当前项目主要目录职责：

```text
src/
├── api/          API 请求函数、请求参数类型、响应类型
├── assets/       静态资源、图片、全局样式
├── components/   跨页面复用业务组件和项目内基础组件
├── config/       前端配置
├── constants/    常量
├── hooks/        通用 Hook、React Query query/mutation Hook
├── modules/      非 React 业务模块或浏览器能力封装
├── pages/        路由页面和页面局部组件
├── router/       Hash Router 配置
├── store/        Zustand 全局状态
├── types/        全局类型
└── utils/        工具函数、请求实例、响应处理
```

新增代码优先放在现有职责目录中。不要凭空新增 `services`、`layouts`、`shared` 等长期分层，除非用户明确要求或项目已经形成对应边界。

## 页面与组件组织

页面统一放在 `src/pages/`。页面私有组件优先放在对应页面目录下的 `components/`。跨页面复用的业务组件放在 `src/components/`。

组件抽象遵循三次原则：

- 相同逻辑或 UI 多次出现，再考虑抽象。
- 多个页面依赖同一能力，再考虑放入 `src/components` 或 `src/hooks`。
- 只有一处使用且逻辑简单时，不提前抽象。

组件编写要求：

- 默认使用函数组件和 TypeScript。
- props 必须有清晰类型，避免新增不必要的 `any`。
- 页面组件负责业务编排、路由参数、请求 hook 和状态组合。
- 展示组件负责 UI、局部交互和明确的 props/callback 输入输出。
- 不让子组件隐式依赖父页面的路由、store 或请求细节，除非它本身就是业务容器。
- 大组件拆分时先按 UI 区块拆，再按状态和副作用抽 hook。

UI 实现优先级：

- 移动端交互优先使用 Ant Design Mobile。
- 样式优先使用 Tailwind CSS、项目已有 Sass、`global.scss` 中的全局类和 `DESIGN.md` 中的规则。
- 图标优先复用 `antd-mobile-icons` 或 `src/components/icon`。
- 不新增新的 UI 框架、图标库或按钮/输入框体系。

## API 与请求

API 请求统一放在 `src/api/`。API 文件只负责：

- 定义请求函数。
- 定义请求参数类型。
- 定义响应数据类型。
- 拼接后端接口路径。

请求必须复用 `request`，它来自 `@/utils`，已统一处理 `/api` baseURL、Token Authorization、loading Toast 和响应状态处理。

不要在页面组件中直接使用 axios 请求后端。新增 API 后，需要在 `src/api/index.ts` 中按现有方式导出。

接口响应类型优先沿用 `SuccessResponse<T>`。如果后端金额字段以字符串返回，前端类型也保持字符串，不擅自改成 number。

## React Query

服务端数据获取优先使用 TanStack React Query。

查询 Hook 放在 `src/hooks/query/`，命名遵循：

```text
useGetXxxQuery
useGetXxxByIdQuery
```

Mutation Hook 放在 `src/hooks/mutation/`，命名遵循：

```text
usePostXxxMutation
usePatchXxxMutation
usePutXxxMutation
useDeleteXxxMutation
```

Query key 按业务资源组织，不按 hook 名字组织。涉及复杂业务、列表/详情组合或会被 mutation 失效的 key，优先抽成领域 key helper，例如：

```ts
export const fixedExpenseKeys = {
  all: ['fixed-expense'] as const,
  lists: () => [...fixedExpenseKeys.all, 'list'] as const,
  list: (params?: GetFixedExpenseQuery) => [...fixedExpenseKeys.lists(), params] as const,
  details: () => [...fixedExpenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...fixedExpenseKeys.details(), id] as const,
};
```

不要新增 `useGetXxxQueryQueryKey = 'useGetXxxQuery'` 这类以 hook 名字命名的 key。hook 名字不是业务资源，后续列表、详情、统计和批量失效会变得难维护。

Query hook 负责解开接口响应壳，页面优先消费派生后的业务数据，不要在页面中反复判断 `response?.statusCode`。同一领域内默认值保持一致：

- 列表默认 `[]`。
- 详情默认 `undefined`。
- 统计或汇总对象需要提供明确的 `emptySummary` / `emptyInfo`。

Query hook 参数使用 options object。请求参数放 `params`，React Query 配置放 `queryOptions`，不要只支持 `enabled` 一个字段；需要排除 `queryKey` 和 `queryFn`，由 hook 内部固定。

Mutation hook 内部使用 `useQueryClient()` 获取 client，不要从 `@/main` import 全局 `queryClient`。Mutation 成功后，如果影响列表、详情、统计或用户信息，必须通过 `queryClient.invalidateQueries` 刷新相关 query。

多个缓存需要失效时，必须分别调用 `invalidateQueries`，不要把多个 key 塞进同一个 `queryKey` 数组：

```ts
await Promise.all([
  queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.lists() }),
  queryClient.invalidateQueries({ queryKey: fixedExpenseKeys.detail(id) }),
]);
```

不要为了统一而抽象通用 CRUD hook factory。当前业务的缓存关系不完全标准化，抽象边界最多到领域 key helper、单个 query hook、单个 mutation hook，必要时再抽很小的 invalidate 工具。

Hook 返回结构沿用现有模式：

- query hook 返回 `response`、派生后的业务数据和 React Query 其余状态。
- mutation hook 返回 `[mutateAsync, rest] as const`。

新代码可以优先返回 mutation object，但如果改动会牵动旧页面调用，先保留 tuple 形态，避免无关重写。

## Zustand 与状态

全局客户端状态放在 `src/store/`。适合放入 store 的内容：

- 登录态、token 和用户信息。
- 跨页面共享的 UI 或业务状态。
- 需要持久化到 localStorage 的状态。

不适合放入 store 的内容：

- 可通过 React Query 获取的服务端数据。
- 页面局部临时表单状态。
- 只在单个组件中使用的 UI 状态。

涉及登录退出时，需要注意清理缓存和持久化状态，参考 `useUserStore.logOut`。

## 路由

路由统一维护在 `src/router/index.tsx`，项目使用 `createHashRouter`，不要擅自切换为 browser router。

新增页面后：

- 在 `src/pages/` 中创建页面入口。
- 在 `src/router/index.tsx` 中注册 path 和 element。
- 需要登录访问的页面使用 `LoginGuard` 包裹。
- 大体量页面沿用现有 `lazy` 和 `Suspense` 模式。

路由 path、导航目标和常量应优先复用 `src/constants/route.ts` 中已有约定；不要在多个文件散落互相不一致的路径字符串。

## Hooks 与工具函数

`src/hooks/` 用于封装 React 状态、副作用、请求编排、页面级业务流程和可复用交互逻辑。

适合抽 hook 的情况：

- 请求流程、筛选、分页、轮询、批量操作或表单编排可以被清晰命名。
- 同一逻辑被两个以上组件或页面使用。
- 组件里副作用过多，影响阅读。

无 React 状态依赖的纯函数、格式化、金额计算、时间处理、路由拼接和响应处理放到 `src/utils/`，不要包装成 `useXxx`。

多个可选参数使用 options object，避免长参数列表。

## TypeScript 与命名

禁止新增不必要的 `any`。优先使用明确的 `interface`、`type`、`unknown`、现有 API 类型或后端实体对应类型。

命名遵循现有风格：

- React 组件文件使用 `PascalCase.tsx` 或页面现有 `index.tsx` 风格。
- Hook 使用 `useXxx.ts`。
- Query hook 使用 `useGetXxxQuery.ts`。
- Mutation hook 使用 `usePostXxxMutation.ts` 等动词前缀。
- Sass module 使用 `*.module.scss`。
- 项目内部导入优先使用 `@/` 别名，同目录紧邻文件可使用相对路径。

能通过类型推导保持清晰的场景，不重复声明冗余类型。公共类型放 `src/types/`，API 相关类型放对应 `src/api/*.ts`。

## 样式与 UI

样式和视觉规则遵循 `DESIGN.md`。

工程层面的样式约束：

- 页面根容器优先使用 `.page` 或 `.page-new`。
- 主色通过 `var(--ww-theme-color)`、`bg-primary` 或 `text-primary` 使用。
- Ant Design Mobile 变量已在 `global.scss` 中做全局映射，不随意改全局变量。
- 常规布局、间距、颜色、字号优先使用 Tailwind class 或现有 Sass。
- 页面级 Sass 只保留复杂选择器、第三方组件局部覆盖、伪元素、keyframes 或无法清晰表达为 class 的局部修正。
- UI 改动后检查 `DESIGN.md` 是否需要同步更新；工程执行规则写入 `AGENTS.md`，视觉规则写入 `DESIGN.md`。

## 文档规范

以下情况需要补充文档：

- 新增完整业务功能。
- 新增复杂业务流程。
- 新增跨页面复用能力。
- 新增或调整重要接口模块。
- 调整页面流程、缓存策略、登录态或持久化策略。

文档放在 `docs/`。流程类文档放在 `docs/flowcharts/`。需要保留实现背景或维护上下文时，补充到 `docs/context/`。

文档至少说明：

- 功能目标。
- 页面流程。
- 数据结构。
- 接口依赖。
- 状态来源和缓存刷新。
- 注意事项、权衡和已知问题。

## 工作方式

开始编码前先理解需求、现有页面结构、接口调用链和状态来源。修改前评估影响范围，尤其是全局样式、请求实例、路由、store、React Query key 和共享组件。

保持改动小而清晰。不要未经确认做大规模重构，不为了抽象而抽象，不为了所谓最佳实践破坏现有稳定业务逻辑。

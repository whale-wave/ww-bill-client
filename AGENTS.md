# 前端开发规范

## 开发原则

1. 开始编码前，先理解需求、现有页面结构、接口调用链和状态来源。
2. 优先采用当前项目已有实现方式，保持代码风格、交互模式和目录组织统一。
3. 不允许未经确认直接进行大规模重构。
4. 不允许为了抽象而抽象，也不为了所谓最佳实践破坏现有稳定业务逻辑。
5. 修改前先分析影响范围，优先保证功能正确，其次考虑代码优雅性。

## 技术栈与运行环境

前端项目位于 `ww-bill-client`，主要技术栈如下：

- Vite 6
- React 18
- TypeScript 5
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

如果本地使用 yarn，也需要以 `package.json` 中脚本名为准。

## 目录职责

当前项目主要目录职责如下：

```text
src/
├── api/          API 请求层、接口参数类型、接口返回类型
├── assets/       静态资源和全局样式
├── components/   全局可复用业务组件
├── config/       前端配置
├── constants/    常量
├── hooks/        通用 Hook、React Query query/mutation Hook
├── modules/      非 React 业务模块或浏览器能力封装
├── pages/        页面与页面局部组件
├── router/       路由配置
├── store/        Zustand 全局状态
├── types/        全局类型
└── utils/        工具函数、请求实例、响应处理
```

新增代码优先放在现有职责目录中。不要凭空新增 `services`、`layouts`、`ui` 等目录，除非先确认项目需要引入新的长期分层。

## 页面与组件规范

页面统一放在：

```text
src/pages/
```

页面私有组件优先放在页面目录内的：

```text
components/
```

跨页面复用的业务组件放在：

```text
src/components/
```

组件抽象遵循 Rule of Three（三次原则）：

- 相同逻辑或 UI 多次出现，再考虑抽象。
- 多个页面依赖同一能力，再考虑放入 `src/components` 或 `src/hooks`。
- 只有一处使用且逻辑简单时，不要提前抽象。

UI 实现优先遵循：

- 移动端组件优先使用 Ant Design Mobile。
- 样式优先使用 Tailwind CSS 和项目已有 Sass 变量、mixin。
- 图标优先复用 `antd-mobile-icons` 或 `src/components/icon` 中已有图标。
- 优先复用已有页面交互模式和视觉规范。
- 禁止随意混用新的 UI 框架。

## API 与请求规范

API 请求统一放在：

```text
src/api/
```

API 文件只负责：

- 定义请求函数。
- 定义请求参数类型。
- 定义响应数据类型。
- 拼接后端接口路径。

请求必须复用：

```ts
request;
```

`request` 来自 `@/utils`，已统一处理：

- `/api` baseURL
- Token Authorization
- loading Toast
- 响应状态处理

不要在页面组件中直接使用 axios 请求后端。

新增 API 后，需要在 `src/api/index.ts` 中按现有方式导出。

接口响应类型优先沿用：

```ts
SuccessResponse<T>;
```

如果后端金额字段以字符串返回，前端类型也应保持字符串，不要擅自改成 number。

## React Query 规范

服务端数据获取优先使用 TanStack React Query。

查询 Hook 放在：

```text
src/hooks/query/
```

命名遵循现有风格：

```text
useGetXxxQuery
useGetXxxByIdQuery
```

Mutation Hook 放在：

```text
src/hooks/mutation/
```

命名遵循现有风格：

```text
usePostXxxMutation
usePatchXxxMutation
useDeleteXxxMutation
```

Query key 需要导出常量，方便 mutation 成功后失效缓存。

Mutation 成功后，如果会影响列表、详情或统计数据，需要通过 `queryClient.invalidateQueries` 刷新相关 query。

Hook 返回结构优先沿用现有模式：

- query hook 返回 `response`、派生后的业务数据和 React Query 其余状态。
- mutation hook 返回 `[mutateAsync, rest] as const`。

## 状态管理规范

全局客户端状态使用 Zustand，文件放在：

```text
src/store/
```

适合放入 store 的内容：

- 登录态和用户信息。
- 跨页面共享的 UI 或业务状态。
- 需要持久化到 localStorage 的状态。

不适合放入 store 的内容：

- 可通过 React Query 获取的服务端数据。
- 页面局部临时表单状态。
- 只在单个组件中使用的 UI 状态。

涉及登录退出时，需要注意清理相关缓存和持久化状态，参考 `useUserStore.logOut`。

## 路由规范

路由统一维护在：

```text
src/router/index.tsx
```

新增页面后需要：

- 在 `src/pages` 中创建页面入口。
- 在路由中注册 path 和 element。
- 需要登录访问的页面使用 `LoginGuard` 包裹。
- 大体量页面可按现有方式使用 `lazy` 和 `Suspense`。

项目使用 hash router：

```ts
createHashRouter;
```

不要擅自切换为 browser router。

## TypeScript 规范

禁止新增不必要的 `any`。

优先使用：

- 明确的 `interface`
- 明确的 `type`
- `unknown`
- 现有 API 或后端实体对应类型

新增 API、Hook、组件 props 时需要定义清晰类型。

能通过类型推导保持清晰的场景，不需要重复声明冗余类型。

## ESLint 与格式规范

项目使用 `@antfu/eslint-config`，开启 React 支持，并开启分号风格。

如果变更文件属于 ESLint 校验范围，必须执行：

```bash
npx eslint --fix <变更文件>
```

例如：

```bash
npx eslint --fix src/pages/Home/index.tsx
```

多个文件：

```bash
npx eslint --fix src/pages/Home/index.tsx src/components/UserCard.tsx
```

较大 TypeScript 改动完成后，执行：

```bash
pnpm lint
pnpm lint:type
```

如果本地使用 yarn，则执行同名脚本。

## 文档规范

以下情况需要补充文档：

- 新增完整业务功能。
- 新增复杂业务流程。
- 新增跨页面复用能力。
- 新增或调整重要接口模块。

文档放在：

```text
docs/
```

文档至少包含：

- 功能说明
- 页面流程
- 数据结构
- 接口依赖
- 注意事项

需要保留实现背景或后续维护上下文时，补充：

```text
docs/context/
```

记录：

- 为什么这样设计
- 做过哪些权衡
- 后续优化方向
- 已知问题

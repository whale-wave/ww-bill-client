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

## 视觉与交互风格规范

本项目是移动端账本/财务工具，整体风格应保持轻量、清爽、可快速扫读。后续新增页面或组件时，优先延续当前产品气质，不要做成营销页、后台管理台或重装饰仪表盘。

### 整体气质

- 以实用工具感为主，界面服务于记账、账单、预算、资产、图表等高频操作。
- 信息密度偏紧凑，优先让金额、分类、日期、操作入口清晰可扫。
- 视觉表达克制，少用大面积插画、复杂纹理、炫光渐变、悬浮装饰物和过度动画。
- 页面默认按移动端 App 思路设计：顶部导航/数据区 + 中部列表或卡片内容 + 底部导航或底部操作区。

### 色彩系统

- 主色必须使用 `var(--ww-theme-color)` 或 Tailwind 的 `bg-primary`、`text-primary`，不要在业务样式中写死主色值。
- 当前默认主色来自 `src/assets/styles/reset.ts`，为浅青色 `#aeeeff`；主色常用于顶部栏、数据概览卡、主按钮、选中态和关键操作。
- 页面背景优先使用 `#F5F5F5`、`#f6f6f6` 或 Tailwind `bg-bg-gray`。
- 内容承载区优先使用白色 `#FFFFFF` / `#FEFEFE`。
- 主要文本使用 `#333`、`#333233`、`text-font-black`；次级文本使用 `#969696`、`#9e9e9e`、`text-font-gray`。
- 分割线和弱边框使用 `#EBEBEB`、`#E5E5E5`、`#D7D7D7`、`border-primary`。
- 收入、支出、风险或图表辅助色可以按业务语义少量使用，但不要引入大面积高饱和配色。

### 布局与容器

- 页面根容器优先复用 `.page` 或 `.page-new`，保持 `height: 100%`、纵向 flex 和移动端滚动行为一致。
- 常规页面内容左右留白以 `12px`、`16px` 为主，底部需要为 TabBar、键盘或固定操作区预留空间。
- 顶部区域通常固定高度并使用主色背景，页面标题、筛选、月份切换、汇总金额等放在顶部。
- 财务总览类页面可以使用大号金额突出主指标，再用小字号展示收入、支出、资产、负债等辅助指标。
- 列表页优先使用白底行项目 + 细分割线，不要把每一行都做成厚重阴影卡片。

### 卡片、列表与圆角

- 现有基础圆角偏小，通用卡片优先使用 `5px` 或 Tailwind `rounded-[5px]`、`card-rounded`。
- 小按钮、标签、分段控制可使用 `4px` 左右圆角；圆形只用于分类图标、头像、底部新增按钮等明确圆形元素。
- `rounded-xl`、`rounded-2xl`、`shadow-md` 等较强视觉样式只在确有强调需求的独立模块中使用，不要作为默认风格扩散。
- 列表行高度通常在 `55px`、`59px`、`60px` 左右，图标常用 `34px`、`35px`、`42px`、`55px` 的圆形容器。
- 分割线优先放在列表内容侧，避免整屏出现过多粗边框。

### 字体与数字层级

- 字体沿用系统默认字体，不要新增花哨字体或 Web Font。
- 常规正文多使用 `15px`、`16px`，列表辅助信息使用 `12px`、`13px`、`14px`。
- 页面标题和顶部 Tab 常用 `17px`、`18px`。
- 金额是视觉重点：普通卡片金额常用 `16px`、`18px`、`24px`；总额或净资产可使用 `30px` 到 `36px` 并加粗。
- 金额小数、单位、标签可降一到两级字号，保持基线对齐和可读性。
- 文本溢出优先使用 `.one-line` 或等价的省略处理，避免撑破移动端布局。

### 图标与操作

- 图标优先使用 `antd-mobile-icons` 或 `src/components/icon`，分类图标继续放在浅灰或主色圆形底中。
- 底部 TabBar 维持现有结构：白底、顶部细阴影、图标约 `22px`、文字约 `12px`，中间新增按钮使用主色圆形突出。
- 主按钮优先使用 Ant Design Mobile Button，并继承全局主色；不要引入新的按钮体系。
- 表单、弹窗、Toast、List、Tabs、Dropdown 等优先复用 Ant Design Mobile，再用局部样式调整到当前视觉。

### 图表与数据可视化

- 图表页面保持工具型表达，背景和坐标轴颜色要轻，突出当前选中数据和业务结论。
- ECharts 配色优先与主色、`#333`、灰阶体系协调；提示浮层可使用深色背景和白字。
- 排行、预算进度、资产趋势等模块优先将数字、类别图标和进度关系放清楚，不要增加装饰性图表元素。

### 禁止的风格偏移

- 不要新增紫蓝渐变、玻璃拟态、霓虹、强 3D、厚重投影、营销页 Hero、大插画背景等与当前账本工具不一致的风格。
- 不要把页面做成桌面端后台风格；默认按手机宽度、触控目标和底部导航来组织。
- 不要为了“高级感”牺牲信息密度和操作效率。
- 不要绕过 `--ww-theme-color`、Tailwind 主题色或现有 Sass 结构另起一套设计系统。
- 不要随意改变全局 Ant Design Mobile 变量；确需调整时应先确认影响范围。

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

# ww-bill-client 代码质量稳定化设计

日期：2026-07-19

## 背景与基线

本轮目标不是一次性重写前端，而是把审计中已经能够稳定复现、会影响用户或发布质量的问题先闭环，并为剩余债务建立明确批次。

当前基线：

- `pnpm lint:type` 通过。
- `pnpm lint` 为 0 error、82 warning，其中 54 条是 `react/exhaustive-deps`，14 条是 `react/set-state-in-effect`。
- Node 26.4.0 属于 `package.json` 声明的支持范围，但普通 `pnpm test` 在测试收集前失败；禁用 Node 实验性 Web Storage 后，7 个测试文件、18 个测试全部通过。
- `pnpm build` 通过，但生产产物包含 `data-inspector-*` 源码坐标，并出现大于 500 kB 的 chunk 警告。
- 工作树在审计开始时干净，已有 CI 只覆盖 Node 24.15.0。

## 已确认问题

### 本轮必须闭环

1. 找回密码第一页写入 `email` 查询参数，验证码页和重置页读取 `login.email`，流程稳定中断。
2. 发票编辑表单把首帧 `isLoading` 缓存在空依赖 `useMemo` 中，加载完成后仍可能永久禁用；保存回调也捕获陈旧依赖。
3. 记录编辑页在直达 `/editing/:id` 时会在查询返回前向子组件传入 `undefined`，子组件立即解引用；该路由还缺少登录守卫。
4. 记账键盘在表达式存在时先调用 `canSubmit()`，因此 `1 + 2`、`5 - 3` 无法通过完成按钮提交。
5. Node 26 的实验性全局 `localStorage` 值为 `undefined`，覆盖 Vitest jsdom 提供的存储对象，导致测试套件无法收集。
6. React Dev Inspector 的 Babel 注入在生产构建中仍然运行，泄露仓库内源码路径；Docker 与本地/CI 使用不同 pnpm 版本且未冻结锁文件。

### 后续独立批次

以下问题风险高或影响面大，本轮只记录，不与业务稳定化混改：

- 登录验证码 SVG 通过 `dangerouslySetInnerHTML` 直接注入，以及 token 持久化在 `localStorage` 带来的串联风险。
- 发布工作流使用未固定 SHA 的第三方 Action，并向部署步骤暴露生产密钥。
- 现有依赖审计记录的 Axios、React Router、xlsx、ECharts 安全债务。
- 82 条 React warning、FSD 同层/逆向依赖、应用级 ErrorBoundary、mutation 业务失败契约。
- 邮箱验证码重复点击/计时器竞态、全量 `localStorage.clear()`、登录后未返回原受保护地址。
- 可访问性、bundle 拆分、覆盖率阈值和共享边界中的 `any`。

## 方案比较

### 方案 A：高风险稳定化切片（采用）

先修已复现的用户流程缺陷和测试/构建可复现性，所有行为修复都增加回归测试。优点是改动边界清楚、可以在现有 18 个测试基础上逐步增加可信度；缺点是不会在本轮把 82 条 warning 全部清零。

### 方案 B：一次性清理全部 lint 与 FSD 债务

可以快速得到表面整洁的门禁，但会同时改动约 49 个文件，且大量 `set-state-in-effect` 与跨 slice 依赖需要重新设计状态边界。在当前测试覆盖较薄时，回归风险高于收益。

### 方案 C：安全依赖与认证架构优先

安全收益最高，但验证码渲染、HttpOnly cookie、xlsx 替换、部署 Action 固定和依赖升级都需要后端或部署环境配合，不能在缺少端到端环境验证时混入本轮业务修复。

## 设计

### 测试运行时

Vitest 的 `setupFiles` 在测试模块收集前运行。测试 setup 先把 `globalThis.localStorage` 显式绑定到 jsdom 的 `window.localStorage`，再动态导入 i18n，避免 ESM 静态 import 早于 setup 文件正文执行。普通 `pnpm test` 必须在 Node 26 下通过，不依赖 `NODE_OPTIONS` 绕过。

### 找回密码参数契约

新增单一 `params.ts`，集中定义 `email`、`captcha` 的读取与两段跳转 URL 构造。三个页面只使用该契约。重置页在缺少任一必要参数时返回找回密码入口，不再使用非空断言或 `any` 导航。

### 异步详情页

发票表单的 `isEdit`、`isDisabled` 改为每次渲染直接派生，保存回调列出真实依赖。记录编辑页优先使用路由 state 做即时展示，同时继续请求最新详情；没有 state 时分别处理 loading、error/empty、success，只有成功态才渲染 Top/List/Footer。`editing/:id` 改为登录保护路由。

### 记账表达式

`resolveAmount()` 成为唯一提交前检查入口：普通金额必须满足现有提交条件；有 `+/-` 时必须存在完整右操作数，先计算并返回结果；不完整表达式返回 `undefined`。页面不再在计算前调用会拒绝表达式的 `canSubmit()`。

### 构建与工具链

Inspector 插件只在 Vite `serve` 命令中启用；生产构建恢复 Vite 8 默认的 `baseline-widely-available` target。项目固定 `packageManager: pnpm@10.34.3`，Docker 使用 Node 24.15.0、相同 pnpm 版本和 `--frozen-lockfile`，`build:docker` 使用真正会检查 project references 的 `tsc -b`。删除无效的 Electron allow-build 占位值。

## 验证策略

每个业务修复先增加会在旧实现上失败的回归测试，再写最小修复。最终必须重新运行：

```bash
pnpm lint:type
pnpm lint
pnpm test
pnpm build
pnpm build:docker
git diff --check
```

生产产物还需确认不再包含 `data-inspector-relative-path`。本轮不把既有 82 条 warning 伪装成已解决；只要求不新增 warning，并记录本轮减少的数量。

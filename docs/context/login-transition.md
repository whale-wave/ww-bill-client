# 登录过渡修复执行记录

日期：2026-09-28

## 目标与范围

修复登录成功时空白账号、密码输入框闪现的问题。仅调整客户端登录页及其临时状态，不改变鉴权、账户缓存隔离和离线缓存策略。

## 原因与实施安排

- 登录成功后固定延迟 1000ms 跳转；`startSession()` 更换 App 的 Query Provider 并重新挂载登录页，表单局部状态因此清空。
- 去掉固定等待，成功后立即发起安全的 replace 跳转。
- 页面临时状态跨会话 Provider 重新挂载保留；仅驻留内存，实际离开页面后清理表单和计时器。
- 提交立即防重复，超过 300ms 尚未离开登录页时显示现有 `PageLoadingState`；失败恢复原表单并允许重试。

## 验收条件

快速成功无加载闪烁；慢请求及慢目标路由有加载动画；会话重新挂载不会清空输入框；失败保留输入；重复提交不会重复请求；离开页面后过期响应不创建会话。

## 执行与验证

- 已完成原因定位及实现：`src/pages/auth/login/LoginPage.tsx` 去掉固定跳转延迟，等待时复用鲸鱼加载状态；`model/login-state.ts` 保留跨会话重新挂载的临时表单与提交状态，并在真正离开页面后清理。
- 中英文增加登录等待文案，沿用现有加载视觉，不新增设计规则。
- 登录页回归覆盖快速成功、300ms 延迟、重复点击/回车、会话重新挂载、慢目标路由、延迟不中断、快速目标路由、失败重试、业务失败、邮箱登录及离开后的过期响应。
- `pnpm test test/pages/auth/login/login-page.test.ts test/features/auth/auth-page-shell.test.ts test/shared/i18n/auth-locales.test.ts test/shared/ui/page-loading-state.test.ts`：4 个文件、24 个测试全部通过。
- 变更代码针对性 ESLint 通过，无警告；`pnpm lint:type` 和 `git diff --check` 通过。
- `pnpm build`：类型检查与生产构建通过；构建报告存在大体积 chunk 提示。
- 原生设备体验待验证；本记录不代表已发布。

## 首屏停留时间调整

同日追加：用户反馈首屏动画偏长。`src/pages/first-screen/FirstScreenPage.tsx` 的跳转等待由 1200ms 缩短为 600ms；`index.module.css` 的内容入场由 640ms 缩短为 300ms，进度条动画同步缩短为 600ms，保留现有视觉与减少动态效果适配。Android 原本跳过网页首屏的行为不变。

验收：600ms 后发起进入明细页的跳转，入场与进度动画匹配更短的停留时间；实际页面呈现仍取决于目标路由就绪时间。针对性 ESLint、`pnpm lint:type` 和 `git diff --check` 通过；手机实机效果待验证。

# Taro 小程序接入前的共享目录准备

日期：2026-09-30

## 目标与边界

在 `bill-2/ww-bill-client` 中先建立平台无关的共享包，并保持现有 Web、Android、iOS 目录与后端接口不变。本阶段不创建 Taro 模板或小程序页面。下一阶段由项目所有者在 `ww-bill-client/miniapp/` 建立官方 React + TypeScript Taro 微信小程序模板，再根据模板实际结构完成接入。

## 任务与验收

1. 建立 `packages/bill-core`，把金额计算、格式化和输入规范化函数移入共享包；Web 原导入路径继续可用。
2. 更新 pnpm workspace、锁文件、Web Docker 安装步骤和 ESLint 范围；预留 `miniapp/` 包路径。
3. 验证共享包独立类型检查、现有金额测试、Web 类型检查与构建、Docker 构建及 Git 空白检查。

## 执行记录

- 2026-09-30：确认 `ww-bill-client` 的 `dev` 分支工作区无原有改动；现有 Web 以根目录为构建入口，`miniapp/` 和 `packages/` 尚不存在。
- 2026-09-30：将 `src/shared/lib/amount.ts` 原实现移入 `packages/bill-core/src/amount.ts`，旧路径改为共享包再导出；更新工作区配置、依赖和 Docker 安装步骤。
- 2026-09-30：`pnpm install --frozen-lockfile`、共享包与 Web 类型检查、金额相关 9 项测试、Web 构建及 Docker 构建通过。`pnpm lint` 通过，现有其他文件仍有 29 条警告。共享包经 Node.js 直接导入并计算 `0.1 + 0.2 = 0.3`。
- 2026-09-30：`bill-2` 的客户端、管理端、服务端和网站仓库均从各自 `dev` 建立并切换到 `refactor/taro`；仅客户端有本阶段代码改动。客户端功能代码提交为 `824f4310`，文档单独提交；未推送远端。
- 2026-09-30：补充[小程序首版接口接入清单](../context/taro-miniapp-api-readiness.md)，核对现有服务端契约、分类版本请求头和共享代码依赖边界；Taro 模板仍由项目所有者创建。
- 2026-09-30：项目所有者在 `miniapp/` 生成 Taro 4.3.0 官方默认模板，选择 React、TypeScript、Sass、微信小程序、pnpm 与 Vite。模板自带空 Git 仓库，无提交；已将其 Git 元数据移出目录，使模板文件由客户端的 `refactor/taro` 分支统一管理。
- 2026-09-30：首次 `pnpm install` 被现有 `no-downgrade` 信任策略拦截。核对 Vite、`@vitejs/plugin-legacy`、Rollup 对应官方发布记录，以及 npm 官方源与当前镜像源的包校验值后，仅为 `vite@4.5.14`、`@vitejs/plugin-legacy@4.1.1`、`rollup@3.30.0` 增加精确版本例外。工作区安装及模板的 `build:weapp` 均通过；未关闭全局信任检查。安装仍提示旧版 ESLint 与既有 Web 依赖的 peer 警告；Taro 绑定安装脚本虽被 pnpm 忽略，模板构建可正常完成。

## 下一步

基于已生成的模板接入 `bill-core` 和首版业务页面，并以模板实际配置验证微信小程序构建、开发者工具和真机。后端接口保持原状。

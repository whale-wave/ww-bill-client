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

## 下一步

项目所有者可在 `ww-bill-client/miniapp/` 建立官方 React + TypeScript Taro 微信小程序模板。接入时需要重新检查模板的包名、构建器、脚本及输出目录，并更新工作区锁文件和 Docker 清单复制步骤。模板建立前不修改后端接口或创建小程序页面。

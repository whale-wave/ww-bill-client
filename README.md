<p align="center">
  <img src="./static/logo.png" width="104" alt="鲸浪记账 Logo" />
</p>

<h1 align="center">鲸浪记账</h1>

<p align="center">为个人、情侣与家庭打造的现代化记账应用</p>

<p align="center">
  <a href="https://github.com/whale-wave/ww-bill-client/releases"><img src="https://img.shields.io/github/v/release/whale-wave/ww-bill-client?display_name=tag&label=Release&color=2F81F7" alt="Release" /></a>
  <a href="https://github.com/whale-wave/ww-bill-client"><img src="https://img.shields.io/github/stars/whale-wave/ww-bill-client?style=flat&label=Stars&color=F4B400" alt="GitHub Stars" /></a>
  <img src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5%2B-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white" alt="Capacitor 8" />
</p>

> 记录每一笔生活。鲸浪记账将日常记账、预算、资产、账单分析与多人协作整合到轻量、专注的移动端体验中。

## 为什么选择鲸浪记账

- **从记一笔到账本经营**：覆盖日常流水、预算、资产、固定支出、月度账单与数据导出。
- **适合共同生活**：支持家庭与多人账本，提供成员、邀请、权限、账本迁移与恢复等协作能力。
- **看得见的财务变化**：通过收支趋势、分类占比、资产统计和月度账单，让记录沉淀为决策依据。
- **为移动端而生**：基于 PWA 构建，并通过 Capacitor 接入 Android、iOS 原生工程；页面按需加载，适合碎片化记账。

## 已实现功能

| 场景       | 能力                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| 日常记账   | 收入、支出、转账、分类与标签、备注、图片、日历查看、关键词搜索与记录编辑。 |
| 账单与分析 | 月度账单、收支汇总、分类排行、趋势与占比图表，以及区间数据导出。           |
| 预算与资产 | 总预算和分类预算、资产账户与调整记录、净资产汇总和资产趋势。               |
| 共同账本   | 家庭与多人账本、成员管理、邀请码、加入申请、成员配色和个人权限策略。       |
| 生活管理   | 固定支出、发票抬头、社区话题、评论、关注、消息与反馈。                     |
| 账户与体验 | 密码或邮箱验证码登录、找回密码、邮箱更换、应用锁、声音与触感反馈。         |
| 快捷记账   | 支持 iOS 快捷指令把截图识别结果带入原生记账编辑器，用户确认后再落账。      |

## 获取与体验

- Android 安装包请前往 [GitHub Releases](https://github.com/whale-wave/ww-bill-client/releases) 获取。
- 使用、反馈或参与讨论，可加入 QQ 群：`1108214948`。

## 本地运行

### 前置条件

- Node.js `^20.19.0` 或 `>=22.12.0`
- pnpm `10.34.3`
- 可访问的 [鲸浪记账服务端](https://github.com/whale-wave/ww-bill-service)（本地或已部署）

### 启动开发环境

```bash
git clone https://github.com/whale-wave/ww-bill-client.git
cd ww-bill-client
pnpm install
pnpm dev
```

## 质量检查与构建

```bash
# 代码规范检查
pnpm lint

# TypeScript 类型检查
pnpm lint:type

# 运行测试
pnpm test

# 构建 Web 产物
pnpm build

# 本地预览构建结果
pnpm preview
```

## Docker 部署

仓库提供了 Nginx 静态站点镜像构建文件。以下示例会在本地构建并以 `8080` 端口提供页面：

```bash
docker build -t whale-wave-bill-client .
docker run --rm -p 8080:80 whale-wave-bill-client
```

## Android 与 iOS 工程

客户端基于 Capacitor 维护 Android 与 iOS 原生工程。生产同步需要配置一个真实的 HTTPS API 地址：

```bash
pnpm app:sync:prod
pnpm app:open:android
# 或 pnpm app:open:ios
```

开发测试可使用 `pnpm app:sync:test`；Android 构建可使用 `pnpm app:build:test` 或 `pnpm app:build:prod`。原生构建还需要对应平台的 Android Studio、Xcode 与签名配置。

## 技术栈

- **应用框架**：React 18、TypeScript、Vite、React Router
- **数据与状态**：TanStack React Query、Zustand、Axios
- **移动端与界面**：Ant Design Mobile、Tailwind CSS、Sass、Capacitor
- **数据表达**：ECharts、XLSX、html2canvas-pro
- **工程质量**：Vitest、ESLint、Husky、GitHub Actions、Docker

遇到问题时，欢迎通过 [GitHub Issues](https://github.com/whale-wave/ww-bill-client/issues) 反馈。提交问题请说明复现步骤、预期结果、实际结果、设备与浏览器或系统版本，并注意移除账号、凭证和账务数据等敏感信息。

## 参与贡献

欢迎提交 Issue、功能建议与 Pull Request。提交前请保持改动聚焦，并运行与变更相匹配的 lint、类型检查或测试。

## 许可证

本项目采用 [MIT License](./LICENSE)。你可以在保留版权与许可声明的前提下使用、修改、分发和商用本项目；软件按“原样”提供，不附带任何担保。

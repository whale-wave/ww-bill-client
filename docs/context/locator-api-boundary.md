# 标签排行请求混入 Locator 属性修复记录

更新日期：2026-09-22。状态：代码修复完成；相关回归、类型检查与构建通过；原设备待刷新复查。

## 现象与目标

用户在手机截图中报告 `property data-locatorjs-id should not exist`。目标是让开发环境的 UI 定位属性不进入标签排行 API 参数，同时保留服务端严格 DTO 校验和 Locator 的组件定位能力。

## 定位证据

- `vite.config.ts` 在开发环境启用 `@locator/babel-jsx`。
- 当前安装插件的 `src/index.ts` 会给自定义组件 JSX 添加 `data-locatorjs-id`，而不仅是原生 DOM。
- `src/features/chart-overview/ui/GlobalTagRanking.tsx` 的个人分支直接将组件 props 作为参数，账本及家庭分支把剩余 props 展开为 filters，三者都可将调试属性带入请求。
- 用户截图位于明细页，但未取得该设备请求日志，不能确认截图对应的具体 URL。已在以上三个分支构造相同属性泄漏的回归场景。

## 计划与验收

- [x] 添加个人、账本、家庭三个分支回归，模拟 JSX 注入属性。
- [x] 先确认测试在修复前因额外参数失败，再显式构造业务字段。
- [x] 确认日期、类型、账本范围不变，且只调用当前范围对应的 query。
- [x] 完成相关测试、类型检查、lint 与构建，记录实际结果。
- [x] 修复过程和验证结果随本次修复提交到版本历史。

## 决策

修复组件与 API 的数据边界，显式选择 startDate、endDate、type/metric 和作用域 ID。避免关闭调试工具、放宽后端 DTO 或在全局 HTTP 层悄悄删除未知业务字段。

## 验证与后续

回归入口：`pnpm test test/features/global-tag-ranking.test.tsx`。此测试在范围子组件上注入定位属性与额外 aria 属性，并完整比对 query 参数，验证无额外属性及范围隔离。

设备上的实际错误是否消失，需要修复加载后在原设备复查；本地验证不能代替这一项。

## 执行日志

2026-09-22：新增回归在修复前 3/3 失败，个人、账本、家庭参数均出现多余的 `data-locatorjs-id` 和 `aria-label`。随后将三个组件统一改为显式解构并重建参数，不再整体传递组件 props。生产构建不注入此定位属性，原有生产模式回归未覆盖这一开发环境路径；新增测试主动模拟注入，避免依赖构建模式。

## 验证结果

| 检查 | 结果与范围 |
| --- | --- |
| 修复前复现 | `global-tag-ranking.test.tsx` 3 项失败，差异均为额外组件属性进入 API 参数 |
| 相关回归 | `pnpm test test/features/global-tag-ranking.test.tsx test/features/tag-ranking-section.test.tsx test/features/chart-overview-ranking-navigation.test.tsx test/shared/api/http.test.ts`：4 文件、16 项通过 |
| 类型检查 | `pnpm lint:type` 通过 |
| 构建 | `pnpm build` 通过，保留现有大包体积警告 |
| 变更文件 lint | `pnpm exec eslint src/features/chart-overview/ui/GlobalTagRanking.tsx test/features/global-tag-ranking.test.tsx --fix`；测试使用 createElement 模拟注入，避免 cloneElement 告警 |

保留相关回归终端摘要，避免依赖临时日志：

```text
Test Files  4 passed (4)
     Tests  16 passed (16)
Start at  17:23:39
Duration  19.87s
```

本次没有放宽后端校验、运行生产迁移或改动其他任务的键盘样式。修复提交可用 `git log --grep='prevent locator props'` 定位。

测试模拟从 cloneElement 调整为 createElement 后重新运行新回归，1 文件、3 项通过；变更文件 lint 无错误或告警。

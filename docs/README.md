# Whale Wave Bill Client Docs

前端文档按主题放在 `docs/` 下，流程类文档统一放在 `docs/flowcharts/`。

## 文档入口

- [分类管理子分类宫格调整](./context/category-management-grid.md)

- [标签排行 Locator 属性泄漏修复记录](./context/locator-api-boundary.md)

- [跨三端计划执行记录与维护模板](../../ww-bill-service/docs/execution/README.md)
- [二级分类与多标签执行记录](../../ww-bill-service/docs/execution/2026-09-22-category-hierarchy-global-tags.md)
- [工作台设备统计执行记录](../../ww-bill-service/docs/execution/2026-09-23-dashboard-device-statistics.md)
- [完整统计首页执行记录](../../ww-bill-service/docs/execution/2026-09-23-chart-dashboard.md)
- [快捷记账草稿调试数据保留执行记录](../../ww-bill-service/docs/execution/2026-09-24-shortcut-draft-debug-retention.md)

- [功能流程图](./flowcharts/feature-flows.md)
- [记账退款、返现与补款](./context/record-adjustments.md)

## 组织约定

- `docs/flowcharts/`: 页面、用户操作、前端状态和 API 调用链路。
- `docs/assets/`: 后续如果需要放截图、导出的图片或录屏，可放在这里。
- 页面或组件的实现说明仍优先写在对应源码附近，跨页面的功能流程放在 `docs/flowcharts/`。

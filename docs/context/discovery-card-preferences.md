# 发现页卡片偏好

发现页的账单、预算总览和资产管家卡片由 `user_app_config` 的两项账户偏好控制：

- `discoveryCardOrder`：三张卡片的展示顺序；未知或缺失项在客户端回退为默认顺序。
- `visibleDiscoveryCards`：当前展示的卡片；服务端与客户端都保证至少保留一张。

用户长按任一卡片进入编辑状态，并可继续长按拖动排序。编辑状态的“管理卡片”面板用于显示或恢复隐藏卡片；每次变化立即保存到账户配置。动效遵循全局动态效果和系统减少动态设置。

服务端部署前需要执行 `20260904_add_discovery_card_preferences.sql`，或运行受保护的 TypeORM schema migration。

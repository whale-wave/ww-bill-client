# 记录搜索分页

个人账本、自定义账本和家庭账本的记录搜索统一采用增量分页。页面首批请求 30 条记录，结果区接近滚动底部时再请求下一页；关键词或筛选条件变化后，由新的 React Query key 从 `offset=0` 重新开始。

关键词和筛选条件只更新当前搜索页的 URL，并使用 replace 语义，不为每次搜索追加浏览器历史；无论连续搜索多少次，页面返回都应一次离开搜索页。

个人和自定义账本使用 `GET /record`、`GET /ledgers/:ledgerId/records` 的 `limit`、`offset` 参数。页面会合并已加载分页并按记录 ID 去重。响应中的 `total`、`income`、`expend` 始终表示全部匹配结果，不能按当前页重新计算。

家庭搜索沿用 `GET /households/:householdId/records` 的分页契约及 `summary` 全量统计。三类搜索共用同一个滚动加载展示；下一页失败时保留已加载结果，并由无限滚动组件提供重试入口。

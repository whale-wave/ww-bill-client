# Taro 小程序首版接口接入清单

日期：2026-09-30。目标：在官方模板到位后，以独立的小程序请求层调用现有服务端，不修改服务端接口。首版范围为已有账号密码登录、个人明细、基础收支新建、基础图表、发现快捷入口和我的。

## 请求通则

- 所有路径以 `/api` 为前缀。密码登录以外的接口需要 `Authorization: Bearer <token>`。
- 请求层必须带 `X-Classification-Version: 2`。服务端的全局 `ClassificationClientGuard` 会在记录及分类等写入请求缺失该头时返回 HTTP 426；现有 Web 请求实例已统一发送。
- 服务端使用 `{ statusCode, message, data? }` 响应壳。成功业务码为 `200`，创建记录也返回业务码 `200`，但没有新记录 ID。小程序需要同时处理 HTTP 失败与 HTTP 2xx 内的业务失败，不能仅凭 HTTP 2xx 判成功。
- 金额请求字段使用十进制字符串；记录列表金额也是字符串，列表汇总目前为数字，图表汇总为字符串。金额计算与显示使用 `@ww-bill/bill-core`，避免浮点运算。
- 本机 API 使用服务端 `4301`。微信真机调试仍需要可访问的 HTTPS 地址及请求合法域名；本清单没有确定部署地址。

## 首版接口

| 能力 | 现有接口 | 关键输入和输出 | 小程序接法 |
| --- | --- | --- | --- |
| 登录 | `POST /auth/login` | `{ username, password }`；成功 `data.token`、`data.userInfo` | 用户名或邮箱均可填在 `username`；保存 token，后续带 Bearer。首版不使用邮箱验证码流程。 |
| 用户信息 | `GET /user/userInfo` | `data` 含 `id`、`userId`、`name`、`username`、`email`、`recordCount` 等 | “我的”页读取；退出时清除本地 token 和账号缓存。 |
| 分类 | `GET /category` | `type=add\|sub`、`status=ACTIVE`；分类数组位于 `data.data` | 切换收支类型时重新取可选分类；提交时传真实分类 ID。 |
| 明细 | `GET /record` | `startDate=YYYY-MM-DD` 在未传 `endDate` 时按所在月份查询；`limit` 最多 100，`offset` 从 0 起；`data.data` 为记录，另含 `total`、`income`、`expend` | 首屏按月取数，继续加载按 offset 翻页；记录金额是字符串。 |
| 新建记录 | `POST /record` | 必填 `amount`、`categoryId`、`remark`、`time`、`type=add\|sub` | `amount` 大于 0、至多两位小数；`time` 用 ISO 日期时间；备注为空时沿用 Web 规则，填所选分类名。提交中禁止重复触发，成功后重新获取明细、图表与用户信息。 |
| 图表 | `GET /chart/dashboard` | 首版用 `period=month` 和 `anchorDate=YYYY-MM-DD`；`data.summary` 含收入、支出、净额等十进制字符串 | 图表页显示基础汇总；发现页可复用本月摘要，不在小程序本地重算统计。 |

个人明细、分类和图表都使用当前登录用户的默认账本。首版不调用家庭账本、自定义账本、附件、标签、资产关联、记录编辑或删除接口。服务端 `POST /record` 不返回记录 ID，因此成功后通过列表刷新呈现结果，不推测新记录编号。

## 已有客户端行为与复用边界

- Web 记账编辑器将金额格式化为字符串，将空备注替换为分类名，并把日期序列化为 ISO 字符串；这些行为与服务端校验一致。
- `packages/bill-core` 已提供金额计算、显示和输入规范化。小程序可以直接导入它；Web 旧路径已转发到共享包。
- 当前 `src/shared/lib/date-time.ts` 依赖 Web 的 i18n 单例；`recordPresentationMappers.ts` 依赖 i18n、Dayjs 和 Web 展示类型；发现页卡片排序虽为纯逻辑，但首版不做卡片管理。现在不迁移这些模块，避免把 Web 依赖带入共享包。
- Web 的请求实例依赖 Axios、浏览器环境、Capacitor 与通知 UI；小程序只复用上述接口契约，不直接导入该实例。模板接入后再实现小程序网络、存储、缓存和页面生命周期适配。

## 模板到位后验证

依次验证登录、分类、按月明细、创建支出与收入、图表和用户信息；重点覆盖缺失分类版本头、业务码失败、登录失效、空列表、翻页与重复提交。确认真机使用的 HTTPS 合法域名后再做设备验收。

证据来源：`ww-bill-client/src/entities/{auth,category,record,chart,user}/api.ts`、`src/features/record-editor/model/useRecordEditorController.ts`、`src/shared/api/http.ts`，以及 `ww-bill-service/src/modules/{auth,category,record,chart,user}` 的 Controller/DTO 与全局分类版本 Guard。

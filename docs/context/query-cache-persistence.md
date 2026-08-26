# 查询缓存持久化

客户端使用 session-scoped stale-while-revalidate 查询缓存。服务端仍是最终数据源，本地缓存只用于冷启动和页面切换时的即时展示。

## 存储边界

- PWA 使用 IndexedDB；Capacitor 原生端使用 `@capacitor/filesystem` 的应用私有 `Directory.Data`。
- 缓存文件按 `userId` 和缓存版本隔离，退出、401/402 或切换账号时清理。
- 只持久化成功的查询；邀请码预览等一次性查询通过 `meta.persist: false` 排除。
- 浏览器定时器最大可靠延迟约为 `2_147_483_647ms`；内存查询缓存使用 `Infinity`，保持到当前登录会话结束，退出或账号切换由统一生命周期清理。
- 本地查询快照按账号最长保留 30 天，过期、损坏或存储不可用时静默降级为联网加载。持久化期限、buster 和 dehydrate policy 由同一策略常量提供。
- 只保存成功 queries，不保存 mutations；恢复旧快照时会移除历史 mutations 并保留原 timestamp，避免一次升级整体丢弃查询缓存。
- `sessionEpoch` 标识新登录/退出，`credentialRevision` 标识同一会话中的 token 变化，`persistenceBindingRevision` 标识补绑 userId 后重新挂载恢复 Provider。
- A→A 新登录创建新的 QueryClient 但保留该账号的本地快照；邀请缓存仍按新会话清理。冷启动、补绑 userId、token refresh 不清理邀请缓存。
- 同一 physical storage key 的读、写、删除由 coordinator 串行；terminal handle 幂等。当前 JS 进程内删除失败保留 tombstone 并 fail-closed，后续恢复可重试删除；应用重启后 tombstone 不持久化。
- 缓存是本地明文数据，不承担加密或离线写入职责。

## 展示规则

- 同一 query key 有缓存时保留旧数据，使用 `isFetching` 表示后台刷新。
- 月份、账本或筛选条件改变时，记录和账单查询使用 `keepPreviousData`，旧内容显示更新提示，成功响应覆盖旧内容。
- 只有当前 query 成功返回空集合时才显示“暂无数据”；请求尚未完成不能映射成空状态。
- 有缓存但刷新失败时继续显示缓存并提供重试入口。

## 会话边界

- QueryClient 不跨会话共享。旧 session 的 mutation、restore、401/402 和家庭/账本邀请回调不能修改新 session 的状态、Toast 或 localStorage；QueryClient 自身的旧回写可以留在旧实例中。
- HTTP 请求在发出时一次性捕获 token、sessionEpoch 和 credentialRevision；只有仍属于当前身份的 401/402 才能触发 logout 和认证 Toast。会话清空后由响应式 LoginGuard 统一以 `replace` 保存完整来源并进入登录页，避免请求层直接写 hash 或制造重复登录历史。
- 本轮额外隔离的全局副作用仅包括 HTTP 认证处理、认证 Toast/redirect，以及家庭和账本邀请缓存；不宣称覆盖所有普通页面异步导航或 Toast。

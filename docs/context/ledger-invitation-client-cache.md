# 账本邀请码客户端缓存

## 目的

账本邀请码的有效期是 24 小时，但服务端没有「查询当前有效邀请码」接口（只有 create / revoke / preview）。为了避免刷新页面、WebView 重载或从后台恢复后邀请码 UI 丢失，客户端在 `localStorage` 中缓存本账本最近一次生成的邀请码。

## 存储位置

`src/entities/ledger/invitation-storage.ts`，从 `src/entities/ledger/index.ts` 导出。行为镜像 `src/entities/household/invitation-storage.ts`，但 schema 版本与实体版本分离。

- key：`wh:ledger-invitation:${ledgerId}`
- 结构：

```ts
interface StoredLedgerInvitation {
  schemaVersion: 1;
  ledgerId: string;
  id: string;
  code: string;
  expiresAt: string;
  invitationVersion: number;
}
```

- `schemaVersion` 是缓存结构版本，类型守卫要求字面量 `1`。
- `invitationVersion` 是服务端实体乐观锁版本，恢复时写回 `LedgerInvitation.version`。当前 revoke/regenerate 接口不发送 version，但保留该字段避免未来接口启用乐观锁时恢复出假的 `version: 1`。

## 生命周期

- 生成成功 → `writeLedgerInvitation`。
- 页面挂载 → `readLedgerInvitation`，过期、code 为空、schema 不匹配或 JSON 损坏时自动删除并返回 `null`。
- 撤销成功 → `removeLedgerInvitation`。
- 倒计时到 0（页面内每秒检查）→ `removeLedgerInvitation` 并重置 sharing consent。
- `localStorage` 不可用（隐私模式等）时写入/读取静默降级，页面内存态仍是当前会话的兜底。

## 约束

- 服务端未提供 `GET active invitation` 前，缓存只反映本机最后一次生成结果；其他设备生成的邀请码不会同步。
- 若后续服务端增加查询接口，应以服务端数据替代本地缓存。

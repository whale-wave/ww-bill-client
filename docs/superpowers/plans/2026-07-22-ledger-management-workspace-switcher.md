# Ledger Management and Workspace Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Use `superpowers:test-driven-development` for every behavior change and `superpowers:verification-before-completion` before reporting completion. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付“个人账本无感底层默认账本 + 自定义账本管理/排序/归档/退出 + 工作台切换器”的完整前端、服务端和后台回归能力。

**Architecture:** URL 是当前账本上下文的唯一权威。个人路由继续隐式使用服务端 `SYSTEM_DEFAULT`，自定义账本继续使用显式 `:ledgerId`。服务端提供不会泄漏默认账本的专用管理列表、用户私有批量排序和版本化快捷入口偏好；客户端使用 React Query 管理服务端状态、Ant Design Mobile 组成常规 UI，只有封面卡、胶囊和拖拽层自研。后台继续治理全量账本，但不接触用户私有偏好。

**Tech Stack:** React 18、React Router 6、TanStack Query 4、Ant Design Mobile 5.36.1、dnd-kit、NestJS 10、TypeORM 0.3.31、PostgreSQL、Jest、Vitest、Ant Design Pro

**Design Reference:** `docs/superpowers/specs/2026-07-22-ledger-management-workspace-switcher-design.md`

**Path Rule:** 每个 Task 中的文件路径都相对于该 Task 标注的仓库根目录；跨仓库命令使用绝对路径，不能假设执行 Agent 的当前目录。

## Global Constraints

- 不新增 `activeLedgerId`、Zustand store、localStorage 或数据库当前账本字段。
- 用户端不得出现“系统默认账本”、底层默认账本 UUID 或默认账本破坏操作。
- `/ledgers/management` 必须在服务端固定过滤 `CUSTOM`；客户端过滤只是第二道防线。
- OWNER 减号调用现有 archive；非 OWNER 减号调用现有 leave；不新增 delete ledger。
- 排序是用户私有关系字段，不写入共享 `ledger`，不进入账本审计。
- 所有服务端 schema 变更必须走显式 SQL；保持 `ORM_SYNCHRONIZE=false`。
- 常规 UI 优先使用 Ant Design Mobile，不新增/扩展旧 `@/shared/ui` 基础控件。
- 客户端测试文件必须以 `.test.ts` 结尾；当前 Vitest 不收集 `.test.tsx`。
- 不提交、不推送代码；每个任务完成后只记录 `git diff` 检查点，除非用户另行授权。

## Dependency Order

```text
Task 1 migration/entities
  ├─> Task 2 list/management API
  ├─> Task 3 reorder API
  └─> Task 4 quick-switch API

Task 2 + Task 3 + Task 4
  └─> Task 6 client contracts
       ├─> Task 7 navigation model
       ├─> Task 8 switcher UI
       ├─> Task 9 tab bars/workspace shell
       ├─> Task 10 management page
       └─> Task 11 preferences/join

Task 8 + Task 9 + Task 11
  └─> Task 12 page integration

Task 5 + Task 13
  └─> Task 14 release verification
```

---

### Task 1: Add additive database fields and an idempotent migration

**Repository:** `ww-bill-service`

**Files:**
- Modify: `src/entity/ledger-member.entity.ts`
- Modify: `src/entity/user-app-config.entity.ts`
- Modify: `src/entity/ledger-entities.metadata.spec.ts`
- Modify: `src/database/sql-migration-plan.spec.ts`
- Add: `migrations/sql/20260722_add_ledger_management_preferences.sql`
- Modify: `docs/migration-runbook.md`

**Interfaces:**

```ts
LedgerMemberEntity.sortOrder: number; // default 2_147_483_647
UserAppConfigEntity.isLedgerQuickSwitchEnabled: boolean; // default false
UserAppConfigEntity.ledgerQuickSwitchVersion: number; // default 1
```

- [x] **Step 1: Write failing metadata tests**

  In `ledger-entities.metadata.spec.ts`, assert:

  - `ledger_member.sortOrder` is `int`, non-null, default `2147483647`.
  - `CHK_ledger_member_sort_order` exists.
  - partial index `IDX_ledger_member_user_active_sort` covers user/order/join/id.
  - both user config fields exist, are non-null, and version has `>= 1` check.

- [x] **Step 2: Run the focused test and confirm failure**

  ```bash
  pnpm exec jest src/entity/ledger-entities.metadata.spec.ts --runInBand
  ```

  Expected: missing metadata assertions fail.

- [x] **Step 3: Add entity fields, check constraints, and index**

  Use explicit `nullable: false`; do not depend on TypeScript optional properties for database nullability.

- [x] **Step 4: Write the SQL migration before changing application behavior**

  The migration must:

  1. add nullable columns with `IF NOT EXISTS`;
  2. rank existing ACTIVE CUSTOM memberships per user by `joinedAt, id` only when `sortOrder IS NULL`;
  3. fill every remaining null with `2147483647`;
  4. set defaults and `NOT NULL`;
  5. add constraints through guarded `pg_constraint` blocks;
  6. create the partial sort index;
  7. detect duplicate `user_app_config."userId"` rows and fail with a diagnostic before creating/confirming `UQ_user_app_config_user_id`;
  8. match both `conname` and `conrelid` in every `pg_constraint` guard;
  9. be wrapped in `BEGIN/COMMIT`.

  Important: an idempotent rerun must not overwrite already saved sort orders.

- [x] **Step 5: Add migration-plan tests and run them**

  ```bash
  pnpm exec jest src/database/sql-migration-plan.spec.ts src/entity/ledger-entities.metadata.spec.ts --runInBand
  ```

- [x] **Step 6: Document rollout guardrails**

  Add `20260722` after the existing `20260721` batch; call out `ORM_SYNCHRONIZE=false`, backup, repeat-run validation, and migration-before-service deployment.

---

### Task 2: Return switcher and management list projections without N+1 queries

**Repository:** `ww-bill-service`

**Files:**
- Modify: `src/modules/ledger/ledger.service.ts`
- Modify: `src/modules/ledger/ledger.service.spec.ts`
- Modify: `src/modules/ledger/ledger.controller.ts`
- Modify: `src/modules/ledger/ledger.controller.spec.ts`

**Produces:**

```ts
interface MyLedgerMembershipView {
  id: string;
  version: number;
  sortOrder: number;
}

interface LedgerListItemView extends LedgerAccessView {
  activeMemberCount: number;
  recordCount: number;
  myMembership: MyLedgerMembershipView;
}
```

- [x] **Step 1: Add failing service tests**

  Cover all of these independently:

  - `findAll` calls `ensureSystemDefaultLedger` and puts `SYSTEM_DEFAULT` first.
  - custom items follow `membership.sortOrder`, then `joinedAt`, then ID.
  - `activeMemberCount` counts only ACTIVE members.
  - `recordCount` excludes soft-deleted records.
  - both count fields are numbers and the list uses exactly one database query.
  - response exposes only current user's membership ID/version/order.
  - `findManagement` fixes kind to CUSTOM and status to ACTIVE/SUSPENDED.
  - `findManagement` never returns system default even if a malformed row reaches the mapper.

- [x] **Step 2: Confirm the tests fail**

  ```bash
  pnpm exec jest src/modules/ledger/ledger.service.spec.ts --runInBand
  ```

- [x] **Step 3: Replace `Repository.find()` with one QueryBuilder projection**

  Use membership as the root, join ledger, and add correlated subqueries or explicit grouped counts. `LedgerEntity` has no `records` reverse relation, so do not call relation-count on `ledger.records`. Count `RecordEntity` by `record.ledgerId = ledger.id AND record.deletedAt IS NULL`, use `getRawAndEntities()` / `getRawMany()`, and convert PostgreSQL COUNT strings through `Number(...)`. Do not call member or record repositories inside a `.map()`.

  Detail `findOne()` continues returning `LedgerAccessView`; only list endpoints return `LedgerListItemView`.

- [x] **Step 4: Add the static management controller route before `:id`**

  ```ts
  @Get('management')
  async findManagement(@Req() req: any) {
    const data = await this.ledgerService.findManagement(+req.user.id);
    return sendSuccess({ data });
  }
  ```

  It must appear before `@Get(':id')`, so `management` is never parsed as UUID.
  `GET /ledgers/management`, `PATCH /ledgers/management/order`, and `PATCH /user-app-config/ledger-quick-switch` must all use the existing `sendSuccess({ data })` envelope.

- [x] **Step 5: Add controller tests and run both suites**

  ```bash
  pnpm exec jest src/modules/ledger/ledger.controller.spec.ts src/modules/ledger/ledger.service.spec.ts --runInBand
  ```

---

### Task 3: Implement atomic user-private ledger reordering

**Repository:** `ww-bill-service`

**Files:**
- Add: `src/modules/ledger/dto/ledger-management.dto.ts`
- Add: `src/modules/ledger/dto/ledger-management.dto.spec.ts`
- Modify: `src/modules/ledger/dto/index.ts`
- Modify: `src/modules/ledger/ledger.service.ts`
- Modify: `src/modules/ledger/ledger.service.spec.ts`
- Modify: `src/modules/ledger/ledger.controller.ts`
- Modify: `src/modules/ledger/ledger.controller.spec.ts`

**Request:**

```ts
class LedgerOrderItemDto {
  ledgerId: string;      // UUID v4
  memberVersion: number; // int >= 1
}

class ReorderLedgersDto {
  items: LedgerOrderItemDto[]; // unique, max 500
}
```

- [x] **Step 1: Write failing DTO tests**

  Reject non-array, duplicate IDs, invalid UUID, version 0, and more than 500 items. Accept an empty list only when the user currently has zero custom ledgers; collection equality remains a service concern.

- [x] **Step 2: Write failing service transaction tests**

  Assert:

  - the transaction isolation level is `SERIALIZABLE`;
  - only current user's ACTIVE CUSTOM membership rows are locked;
  - request IDs must exactly equal database IDs;
  - all versions are checked before the first update;
  - `sortOrder` is the request index;
  - every update matches member ID/user/status/version and increments version;
  - one zero-affected update rolls back all changes;
  - SQLSTATE `40001` becomes HTTP 409;
  - another user's ordering is untouched.

- [x] **Step 3: Run the failing tests**

  ```bash
  pnpm exec jest src/modules/ledger/dto/ledger-management.dto.spec.ts src/modules/ledger/ledger.service.spec.ts --runInBand
  ```

- [x] **Step 4: Implement `LedgerService.reorder()`**

  Return the new versions so the client can immediately perform leave without a stale member version:

  ```ts
  Array<{ ledgerId: string; sortOrder: number; memberVersion: number }>
  ```

- [x] **Step 5: Register `PATCH /ledgers/management/order` before `PATCH :id`**

  Keep route order explicit. Add controller delegation and validation tests.

- [x] **Step 6: Run focused service tests**

  ```bash
  pnpm exec jest src/modules/ledger/dto/ledger-management.dto.spec.ts src/modules/ledger/ledger.controller.spec.ts src/modules/ledger/ledger.service.spec.ts --runInBand
  ```

---

### Task 4: Add a versioned global quick-switch preference

**Repository:** `ww-bill-service`

**Files:**
- Add: `src/modules/user-app-config/dto/update-ledger-quick-switch.dto.ts`
- Add: `src/modules/user-app-config/dto/update-ledger-quick-switch.dto.spec.ts`
- Add: `src/modules/user-app-config/user-app-config.service.spec.ts`
- Add: `src/modules/user-app-config/user-app-config.controller.spec.ts`
- Modify: `src/modules/user-app-config/user-app-config.service.ts`
- Modify: `src/modules/user-app-config/user-app-config.controller.ts`

**Endpoint:**

```http
PATCH /user-app-config/ledger-quick-switch
{ "enabled": true, "version": 1 }
```

**Response:**

```json
{ "data": { "enabled": true, "version": 2 } }
```

- [x] **Step 1: Write failing DTO, service, and controller tests**

  Test boolean validation, version >= 1, current-user isolation, successful CAS increment and returned next version, stale version 409, missing legacy config auto-create, and duplicate create race recovery. Race recovery is only valid after the migration verifies and enforces uniqueness of `user_app_config."userId"`.

- [x] **Step 2: Run and confirm failure**

  ```bash
  pnpm exec jest src/modules/user-app-config --runInBand
  ```

- [x] **Step 3: Implement `findOrCreateForUser()` and `updateLedgerQuickSwitch()`**

  Preserve the old general PATCH behavior for display amount and sound. The new dedicated endpoint is the only versioned path for ledger quick switch.

- [x] **Step 4: Ensure GET exposes the two additive fields**

  Do not expose a separate active ledger ID. Do not require the client to fetch any ledger preference to render this switch.

- [x] **Step 5: Run user-config tests**

  ```bash
  pnpm exec jest src/modules/user-app-config --runInBand
  ```

---

### Task 5: Harden default-ledger destruction boundaries and preserve admin governance

**Repository:** `ww-bill-service`

**Files:**
- Modify: `src/modules/ledger/ledger-collaboration.service.ts`
- Modify: `src/modules/ledger/ledger-collaboration.service.spec.ts`
- Modify: `src/modules/admin/ledgers/admin-ledgers.service.spec.ts`

- [x] **Step 1: Add a failing default-ledger leave test**

  A forged `POST /ledgers/:id/leave` against `SYSTEM_DEFAULT` must return 403 explicitly, not merely fail because the caller is OWNER.

- [x] **Step 2: Implement the explicit kind guard inside the existing locked transaction**

  Do not relax ownership or suspended-ledger policies as part of this task.

- [x] **Step 3: Add admin regression assertions**

  Verify the admin list still includes/filter `SYSTEM_DEFAULT` and its projection does not contain `sortOrder`, `myMembership`, or quick-switch fields.

- [x] **Step 4: Run focused tests**

  ```bash
  pnpm exec jest src/modules/ledger/ledger-collaboration.service.spec.ts src/modules/admin/ledgers/admin-ledgers.service.spec.ts --runInBand
  ```

---

### Task 6: Add typed client API contracts and React Query cache boundaries

**Repository:** `ww-bill-client`

**Files:**
- Modify: `src/entities/ledger/types.ts`
- Modify: `src/entities/ledger/api.ts`
- Modify: `src/entities/ledger/hooks.ts`
- Modify: `src/entities/ledger/keys.ts`
- Modify: `src/entities/ledger/index.ts`
- Modify: `src/entities/user-app-config/api.ts`
- Modify: `src/entities/user-app-config/hooks.ts`
- Modify: `src/entities/record/hooks.ts`
- Modify: `src/entities/ledger-data/hooks.ts`
- Modify: `test/entities/ledger-api.test.ts`
- Modify: `test/entities/ledger-query-functions.test.ts`
- Modify: `test/entities/ledger-keys.test.ts`
- Modify: `test/entities/ledger-types.test.ts`
- Add: `test/entities/user-app-config-ledger-preference.test.ts`
- Modify: `test/entities/ledger-third-batch-keys.test.ts`

**Types:**

```ts
interface MyLedgerMembership {
  id: string;
  version: number;
  sortOrder: number;
}

interface LedgerListItem extends Ledger {
  activeMemberCount: number;
  recordCount: number;
  myMembership: MyLedgerMembership;
}
```

- [x] **Step 1: Write failing API and key tests**

  Cover `GET /ledgers/management`, `PATCH /ledgers/management/order`, dedicated quick-switch PATCH, encoded IDs, and stable `navigation()` / `management()` keys.

- [x] **Step 2: Run focused tests**

  ```bash
  pnpm test -- test/entities/ledger-api.test.ts test/entities/ledger-query-functions.test.ts test/entities/ledger-keys.test.ts test/entities/ledger-types.test.ts test/entities/user-app-config-ledger-preference.test.ts
  ```

- [x] **Step 3: Implement typed API functions and hooks**

  Add:

  ```ts
  useLedgerNavigationQuery()
  useLedgerManagementQuery()
  useReorderLedgersMutation()
  usePatchLedgerQuickSwitchMutation()
  ```

  Keep `getLedgerApi()` typed as `Ledger`; list-only fields must not become required on detail responses.

- [x] **Step 4: Encode cache invalidation rules**

  Reorder writes returned member versions to management cache and invalidates navigation. Create/join/approve/archive/leave invalidate both navigation and management roots.

  Because the switcher shows `recordCount`, personal/custom record create, delete, and restore must invalidate navigation. Transfer execution must invalidate navigation plus both source and target record roots. Add assertions for personal→custom, custom→personal, and custom→custom rather than leaving a stale count until reload.

- [x] **Step 5: Run type and entity tests**

  ```bash
  pnpm lint:type
  pnpm test -- test/entities
  ```

---

### Task 7: Implement pure URL-to-workspace navigation mapping

**Repository:** `ww-bill-client`

**Files:**
- Add: `src/features/ledger-switcher/model/ledger-navigation.ts`
- Add: `src/features/ledger-switcher/model/ledger-switcher-view-model.ts`
- Add: `src/features/ledger-switcher/index.ts`
- Modify: `src/shared/config/routes.ts`
- Add: `test/features/ledger-switcher-navigation.test.ts`
- Modify: `test/shared/config/routes.test.ts`

- [x] **Step 1: Write table-driven failing tests**

  Cover personal/custom mapping for records, create, bill, budget, charts; URL encoding; unknown surface fallback; system default conversion to personal scope; and circle target `/detail`.

- [x] **Step 2: Run and confirm failure**

  ```bash
  pnpm test -- test/features/ledger-switcher-navigation.test.ts test/shared/config/routes.test.ts
  ```

- [x] **Step 3: Implement pure functions only**

  Suggested signatures:

  ```ts
  getLedgerWorkspaceScope(pathname: string): LedgerWorkspaceScope
  getLedgerSurface(pathname: string): LedgerSurface
  getLedgerWorkspacePath(scope: LedgerWorkspaceScope, surface: LedgerSurface): string
  resolveLedgerSwitchTarget(item: LedgerSwitcherItem, surface: LedgerSurface): string
  toLedgerSwitcherItems(list: LedgerListItem[]): LedgerSwitcherItem[]
  ```

  `SYSTEM_DEFAULT` becomes `{ type: 'personal', label: '个人账本' }` and never carries a public navigation ledger ID.
  For custom targets, require `RECORD_CREATE`, `RECORD_READ`, `BUDGET_READ`, or `CHART_READ` as appropriate. If the requested surface is unavailable, fall back to records when `RECORD_READ` exists, otherwise to `/ledgers/:ledgerId`.

- [x] **Step 4: Add missing route builders**

  Add personal detail/bookkeeping builders and `LEDGER_PREFERENCES`; keep `LEDGER_BILL` and make its route real in Task 12.

- [x] **Step 5: Run tests and typecheck**

  ```bash
  pnpm test -- test/features/ledger-switcher-navigation.test.ts test/shared/config/routes.test.ts
  pnpm lint:type
  ```

---

### Task 8: Build the switcher header, panel, and functional web capsule

**Repository:** `ww-bill-client`

**Files:**
- Add: `src/features/ledger-switcher/ui/LedgerSwitcherHeader.tsx`
- Add: `src/features/ledger-switcher/ui/LedgerSwitcherPanel.tsx`
- Add: `src/features/ledger-switcher/ui/MiniProgramCapsule.tsx`
- Add: `src/features/ledger-switcher/ui/ledger-switcher.scss`
- Modify: `src/features/ledger-switcher/index.ts`
- Add: `test/features/ledger-switcher-header.test.ts`

**Official components:** `NavBar`, `Popup` or `Dropdown`, `List`, `Button`, `ActionSheet`, `SpinLoading`, `ErrorBlock`, `SafeArea`.

- [x] **Step 1: Write failing interaction tests using `createElement`**

  Assert:

  - quick-switch off renders static title without arrow;
  - quick-switch off removes the More action that directly opens the switch panel, while circle/create/manage/preferences remain;
  - quick-switch on opens the panel;
  - personal item is first and never exposes server default name/ID;
  - selected item has a check mark;
  - switching uses React Router `replace`;
  - circle in custom scope replaces to `/detail`;
  - More actions expose create/manage/preferences/current settings according to capability;
  - personal records More actions preserve search and calendar navigation with their current date parameters;
  - loading, error/retry, and personal-only empty states render.

- [x] **Step 2: Confirm failure**

  ```bash
  pnpm test -- test/features/ledger-switcher-header.test.ts
  ```

- [x] **Step 3: Implement with Ant Design Mobile**

  Keep `MiniProgramCapsule` stateless. Use real icons from `antd-mobile-icons`; do not draw ellipsis/circle with text, CSS art, or inline SVG.

- [x] **Step 4: Apply design tokens**

  Capsule, selected state, header, and buttons derive from `var(--ww-theme-color)` / existing global tokens. Do not copy competitor blue/yellow.

- [x] **Step 5: Run focused test and lint the changed files**

  ```bash
  pnpm test -- test/features/ledger-switcher-header.test.ts
  pnpm exec eslint --fix src/features/ledger-switcher test/features/ledger-switcher-header.test.ts
  ```

---

### Task 9: Introduce official personal and custom workspace tab bars

**Repository:** `ww-bill-client`

**Files:**
- Modify: `src/widgets/layout/ui/tab-bar/tab-bar.tsx`
- Modify: `src/widgets/layout/ui/tab-bar/tab-bar.scss`
- Add: `src/widgets/layout/ui/ledger-workspace-tab-bar.tsx`
- Modify: `src/widgets/layout/index.ts`
- Add: `test/widgets/layout/tab-bar.test.ts`

- [x] **Step 1: Write failing navigation tests**

  Cover five personal targets, three custom targets, string `activeKey`, route prefetch, custom create capability, disabled Toast, and safe-area padding.

- [x] **Step 2: Run the test and confirm failure**

  ```bash
  pnpm test -- test/widgets/layout/tab-bar.test.ts
  ```

- [x] **Step 3: Replace layout primitives with official `TabBar`**

  Keep existing business hierarchy: the personal middle “记账” remains visually prominent. Do not keep `any` tab objects or old `@/shared/ui` Icon merely to reproduce the previous wrapper.

- [x] **Step 4: Implement `LedgerWorkspaceTabBar`**

  Required items:

  ```text
  明细 -> /ledgers/:id/records
  记账 -> /ledgers/:id/records/new
  图表 -> /ledgers/:id/charts
  ```

- [x] **Step 5: Run test and typecheck**

  ```bash
  pnpm test -- test/widgets/layout/tab-bar.test.ts
  pnpm lint:type
  ```

---

### Task 10: Rebuild the ledger management page and sortable cover grid

**Repository:** `ww-bill-client`

**Files:**
- Add: `src/entities/ledger/ui/LedgerCoverCard.tsx`
- Modify: `src/entities/ledger/ui/index.ts`
- Add: `src/pages/ledger-center/ui/LedgerManagementGrid.tsx`
- Add: `src/pages/ledger-center/ui/SortableLedgerGrid.tsx`
- Add: `src/pages/ledger-center/ui/RemoveLedgerBadge.tsx`
- Add: `src/pages/ledger-center/ui/LedgerManagementFooter.tsx`
- Add: `src/pages/ledger-center/ledger-center.scss`
- Modify: `src/pages/ledger-center/LedgerCenterPage.tsx`
- Modify: `test/pages/ledger/ledger-page-interactions.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Dependency install:**

```bash
pnpm add @dnd-kit/core@6.3.1 @dnd-kit/sortable@10.0.0 @dnd-kit/utilities@3.2.2
```

- [x] **Step 1: Add failing page tests before installing/implementing drag behavior**

  Assert:

  - query source is management endpoint;
  - system default is defensively excluded;
  - cards render 3-column semantic grid and multiplayer count;
  - card click pushes to records;
  - NavBar settings opens `/ledgers/preferences`;
  - long press enters sort mode;
  - focused card `Space` enters sort mode while `Enter` opens records;
  - drag changes local order but does not call API;
  - save submits every current ledger ID/version in displayed order;
  - dirty back asks for confirmation;
  - owner minus confirms archive with `ledger.version`;
  - member minus confirms leave with `myMembership.version`;
  - all SUSPENDED cards disable the remove badge, explain the platform pause, and send neither archive nor leave;
  - 409 refreshes list and clears draft;
  - empty/error/loading/suspended states are complete.
  - empty state exposes both create-template and join-ledger actions.

- [x] **Step 2: Run and confirm failure**

  ```bash
  pnpm test -- test/pages/ledger/ledger-page-interactions.test.ts
  ```

- [x] **Step 3: Install dnd-kit and implement sortable grid**

  Use:

  - `DndContext`
  - `SortableContext`
  - `rectSortingStrategy`
  - `PointerSensor` with activation distance/delay
  - `KeyboardSensor` + `sortableKeyboardCoordinates`
  - `DragOverlay`
  - accessible announcements

  Remove badges must be focusable buttons whose accessible name distinguishes “归档 {账本名}” from “退出 {账本名}”.

  Do not make a click on a card accidentally start dragging.

- [x] **Step 4: Implement the cover card and fixed footers**

  Use official `Grid`, `NavBar`, `Button`, `Dialog`, `Toast`, `ErrorBlock`, `SpinLoading`, `SafeArea`, `Tag`. The card visual, remove overlay, and drag shell are the only custom pieces.

- [x] **Step 5: Wire archive/leave/cache behavior**

  Reuse current hooks after Task 6 invalidation changes. Never fetch members per card.

- [x] **Step 6: Run focused tests, lint, and typecheck**

  ```bash
  pnpm test -- test/pages/ledger/ledger-page-interactions.test.ts
  pnpm exec eslint --fix src/entities/ledger/ui src/pages/ledger-center test/pages/ledger/ledger-page-interactions.test.ts
  pnpm lint:type
  ```

---

### Task 11: Add quick-switch settings and finish the join form migration

**Repository:** `ww-bill-client`

**Files:**
- Add: `src/pages/ledger-preferences/LedgerPreferencesPage.tsx`
- Modify: `src/pages/ledger-join/LedgerJoinPage.tsx`
- Modify: `src/pages/ledger-collaboration/model.ts`
- Modify: `src/app/router.tsx`
- Modify: `test/app/ledger-routes.test.ts`
- Add: `test/pages/ledger/ledger-preferences-page.test.ts`
- Modify: `test/pages/ledger/ledger-collaboration-pages.test.ts`
- Modify: `test/pages/ledger/ledger-collaboration-model.test.ts`

- [x] **Step 1: Write failing preference-page tests**

  Verify current value, correct version submission, Promise loading state, success cache update, failure rollback, and 409 refresh.

- [x] **Step 2: Write failing join form tests**

  Verify official components, uppercase/no-space normalization, exactly six characters matching `[A-HJ-NP-Z2-9]{6}` (reject `0/1/I/O`), remark 1–30, empty disabled, loading guard, existing success state, and existing idempotency key.

- [x] **Step 3: Run the tests and confirm failure**

  ```bash
  pnpm test -- test/pages/ledger/ledger-preferences-page.test.ts test/pages/ledger/ledger-collaboration-pages.test.ts test/pages/ledger/ledger-collaboration-model.test.ts test/app/ledger-routes.test.ts
  ```

- [x] **Step 4: Register `/ledgers/preferences` before `:ledgerId`**

  Static route ordering is part of the test. Use official `NavBar`, `List`, `Switch`, `SafeArea`.

- [x] **Step 5: Replace raw join inputs and custom NavBar**

  Use official `Form`, `Input`, `TextArea`, `Button`, `NavBar`, `Toast`. Preserve the accepted submission flow and API contract.

- [x] **Step 6: Run focused tests and typecheck**

  ```bash
  pnpm test -- test/pages/ledger test/app/ledger-routes.test.ts
  pnpm lint:type
  ```

---

### Task 12: Integrate switcher/capsule/navigation into personal and custom workspaces

**Repository:** `ww-bill-client`

**Files:**
- Modify: `src/pages/record/detail/Top.tsx`
- Modify: `src/pages/record/detail/DetailPage.tsx`
- Modify: `src/pages/chart/chart-home/ChartHomePage.tsx`
- Modify: `src/pages/chart/chart-home/ui/Top.tsx`
- Modify: `src/pages/chart/chart-home/ui/Top.module.scss`
- Modify: `src/pages/chart/chart-home/ui/ChartContent.tsx`
- Modify: `src/pages/budget/BudgetPage.tsx`
- Modify: `src/pages/budget/ui/BudgetTop.tsx`
- Modify: `src/pages/budget/ui/BudgetTop.module.scss`
- Modify: `src/pages/budget/index.module.scss`
- Modify: `src/pages/ledger-records/LedgerRecordsPage.tsx`
- Modify: `src/pages/ledger-charts/LedgerChartsPage.tsx`
- Modify: `src/pages/ledger-budget/LedgerBudgetPage.tsx`
- Add: `src/pages/bill/LedgerBillPage.tsx`
- Add: `src/pages/bill/ui/BillWorkspaceView.tsx`
- Refactor: `src/pages/bill/BillPage.tsx`
- Refactor: `src/pages/bill/BillTabs.tsx`
- Modify: `src/features/ledger-scope/LedgerScopeBoundary.tsx`
- Modify: `test/features/ledger-scope-boundary.test.ts`
- Modify: `src/pages/ledger-record-create/LedgerRecordCreatePage.tsx`
- Modify: `src/pages/ledger-create/LedgerCreatePage.tsx`
- Modify: `src/app/router.tsx`
- Modify: `test/app/ledger-routes.test.ts`
- Add: `test/pages/ledger/ledger-workspace-navigation.test.ts`
- Modify: `test/pages/ledger/ledger-preference-consumers.test.ts`

- [x] **Step 1: Write failing integration tests**

  Cover:

  - personal detail header label is “个人账本”, not app name/default ledger name;
  - custom records header uses current ledger name;
  - quick-switch toggle controls clickable title in both contexts;
  - circle returns custom records/charts/budget/bill to `/detail` with replace;
  - personal chart/budget/bill render the capsule without losing their existing period/metric controls;
  - personal records search/calendar remain available through More actions;
  - non-record pages retain their own period/metric titles and expose switch via More;
  - custom bottom tabs preserve `ledgerId`;
  - created ledger lands on records workspace;
  - management card land target is records;
  - missing custom bill route is registered and uses scoped bill hook.
  - remote ledger 403/404 redirects to personal detail, while a valid ledger lacking one requested capability only shows the existing permission state.

- [x] **Step 2: Run and confirm failure**

  ```bash
  pnpm test -- test/pages/ledger/ledger-workspace-navigation.test.ts test/app/ledger-routes.test.ts test/pages/ledger/ledger-preference-consumers.test.ts
  ```

- [x] **Step 3: Integrate the header on records home surfaces**

  Replace the personal static `config.appName` title and the custom static “账本明细” title with `LedgerSwitcherHeader` while preserving their surrounding totals/month controls.

- [x] **Step 4: Integrate capsule on filter-title surfaces**

  Personal and custom charts, budget, and bill keep their filter titles. Compose only `MiniProgramCapsule` + ActionSheet/Panel entry; update the personal chart fixed offsets in `Top.module.scss` / `ChartContent.tsx` and the budget header spacing deliberately instead of stacking absolute bars blindly.

- [x] **Step 5: Add `LedgerBillPage` inside the existing bill page slice**

  Do not import one page slice from another. Keep `LedgerBillPage.tsx` and private `BillWorkspaceView.tsx` under `src/pages/bill`, refactor the shared rendering to accept data/filters, then bind personal to `useGetRecordBillQuery` and custom to `useLedgerRecordBillQuery`. Wrap custom bill with `LedgerScopeBoundary` for `RECORD_READ`; without the capability it must not fire the bill query.

- [x] **Step 6: Redirect deterministically lost ledger access**

  Extend `LedgerScopeBoundary` so a ledger detail query that deterministically returns 403/404 redirects with replace to `/detail`. Do not redirect when the ledger exists but lacks the page-specific capability; keep the permission ErrorBlock in that case. Mutation-originated archive/leave also navigates after success.

- [x] **Step 7: Add appropriate tab bars**

  Personal pages keep the official personal TabBar; custom records/charts use `LedgerWorkspaceTabBar`. The record-create page may omit the bottom bar while editing, but return navigation must preserve the ledger ID.

- [x] **Step 8: Run integration tests, lint, and typecheck**

  ```bash
  pnpm test -- test/pages/ledger/ledger-workspace-navigation.test.ts test/app/ledger-routes.test.ts test/pages/ledger/ledger-preference-consumers.test.ts
  pnpm exec eslint --fix src/pages/record/detail src/pages/chart/chart-home src/pages/budget src/pages/ledger-records src/pages/ledger-charts src/pages/ledger-budget src/pages/bill src/features/ledger-scope
  pnpm lint:type
  ```

---

### Task 13: Verify admin remains a governance surface, not a user-preference editor

**Repositories:** `ww-bill-service`, `ww-bill-admin`

**Files:**
- Verify/Modify only if failing: `ww-bill-service/src/modules/admin/ledgers/admin-ledgers.service.spec.ts`
- Verify/Modify only if failing: `ww-bill-service/src/modules/admin/admin.service.spec.ts`
- Verify/Modify only if failing: `ww-bill-admin/src/pages/ledgers/LedgerPages.test.tsx`
- Verify: `ww-bill-admin/src/entities/types.ts`

- [x] **Step 1: Run existing admin service and UI tests**

  ```bash
  cd /Users/avan/Code/whale-wave/bill/ww-bill-service
  pnpm exec jest src/modules/admin/ledgers src/modules/admin/admin.service.spec.ts --runInBand

  cd /Users/avan/Code/whale-wave/bill/ww-bill-admin
  pnpm test -- src/pages/ledgers/LedgerPages.test.tsx
  ```

- [x] **Step 2: Add regression assertions only where coverage is absent**

  Required invariants:

  - admin list still displays and filters SYSTEM_DEFAULT;
  - admin active member count remains correct;
  - admin ledger/member projections do not expose `sortOrder` or `myMembership`;
  - admin `getUserDetail().preferences` remains limited to `hideAmount`, `sound`, and `amountDisplay`, without quick-switch fields;
  - admin archive protection for SYSTEM_DEFAULT still passes.

- [x] **Step 3: Do not add an admin sorting or quick-switch page**

  These fields are user-private product preferences, not governance data.

---

### Task 14: Migration rehearsal, full verification, and visual QA

**Repositories:** all three

**Files:**
- Verify: all changed files
- Update if needed: `ww-bill-service/docs/migration-runbook.md`
- Update if needed: `ww-bill-client/docs/superpowers/specs/2026-07-22-ledger-management-workspace-switcher-design.md`

- [x] **Step 1: Rehearse SQL on a disposable database**

  Preconditions:

  - database name matches `ww_bill_*_test`;
  - `TYPEORM_CLI_MODE=true`;
  - `ORM_SYNCHRONIZE=false`.

  `TYPEORM_CLI_MODE` does not protect direct `psql`, so use an explicitly named disposable URL and inspect it before execution:

  ```bash
  test -n "$WW_BILL_TEST_DATABASE_URL"
  psql --no-psqlrc --set ON_ERROR_STOP=1 "$WW_BILL_TEST_DATABASE_URL" -f migrations/sql/20260721_apply_multi_ledger_household.sql
  psql --no-psqlrc --set ON_ERROR_STOP=1 "$WW_BILL_TEST_DATABASE_URL" -f migrations/sql/20260722_add_ledger_management_preferences.sql
  ```

  Select one ACTIVE CUSTOM member ID, write a non-default order, and capture it:

  ```bash
  psql --no-psqlrc --set ON_ERROR_STOP=1 "$WW_BILL_TEST_DATABASE_URL" -c 'UPDATE "ledger_member" SET "sortOrder" = 73 WHERE "id" = (SELECT lm."id" FROM "ledger_member" lm JOIN "ledger" l ON l."id" = lm."ledgerId" WHERE lm."status" = '\''ACTIVE'\'' AND l."kind" = '\''CUSTOM'\'' ORDER BY lm."id" LIMIT 1);'
  psql --no-psqlrc --set ON_ERROR_STOP=1 "$WW_BILL_TEST_DATABASE_URL" -f migrations/sql/20260722_add_ledger_management_preferences.sql
  psql --no-psqlrc --set ON_ERROR_STOP=1 "$WW_BILL_TEST_DATABASE_URL" -c 'SELECT "id", "sortOrder" FROM "ledger_member" WHERE "sortOrder" = 73;'
  ```

  Expected: the final query still returns the chosen row with `sortOrder = 73`; a second migration run does not re-rank it.

- [x] **Step 2: Run the full service gate**

  ```bash
  cd /Users/avan/Code/whale-wave/bill/ww-bill-service
  pnpm exec jest --runInBand
  pnpm lint
  pnpm build
  git diff --check
  ```

- [x] **Step 3: Run the full client gate**

  ```bash
  cd /Users/avan/Code/whale-wave/bill/ww-bill-client
  pnpm test
  pnpm lint:type
  pnpm lint
  pnpm build
  git diff --check
  ```

- [x] **Step 4: Run the full admin gate**

  ```bash
  cd /Users/avan/Code/whale-wave/bill/ww-bill-admin
  pnpm test
  pnpm lint
  pnpm build
  git diff --check
  ```

- [x] **Step 5: Perform reference-vs-build visual QA at 390×844**

  Capture and compare these exact states:

  1. two custom ledgers in management view;
  2. three custom ledgers including one shared card;
  3. sort mode with remove badges and fixed save button;
  4. empty join form;
  5. quick-switch settings enabled;
  6. custom records page with open switcher panel;
  7. custom page circle returning to personal detail.

  Compare reference and implementation side-by-side at the same viewport. Fix spacing, card dimensions, font weight, borders, radii, fixed footer overlap, and safe-area errors; screenshots alone are not acceptance.

- [x] **Step 6: Exercise concurrency and destructive flows manually**

  - reorder the same list in two tabs; second save must refresh on 409;
  - change a member role while another tab attempts leave;
  - owner archives; all former members return to personal page;
  - ordinary member leaves; owner remains and receives notification;
  - forged default archive/leave fails;
  - quick switch changes in two tabs conflict safely.

- [x] **Step 7: Final scope audit**

  Confirm no unrelated household, asset, invoice, fixed-expense, or admin preference changes entered the diff. Confirm no commit or push occurred without explicit user authorization.

## Final Acceptance Matrix

| Area | Required result |
|---|---|
| Default ledger invisibility | not in management, no system wording/ID/destructive action |
| Switcher | personal first, custom ordered, current check, replace navigation |
| Capsule | circle returns `/detail`, More actions functional |
| Management | three-column cards, shared count, drag draft, save CAS |
| Removal | owner archive with ledger version; member leave with membership version |
| Preferences | global/versioned/off by default/failure rollback |
| Join | official antd-mobile controls, 6-char code, 1–30 remark, idempotent request |
| Data | one-query counts, no N+1, per-user order isolation |
| Admin | retains all-ledger governance; no private preference exposure |
| Migration | additive, idempotent, synchronize disabled |
| Quality | three repositories pass test/lint/type/build/diff checks |

# Message and Join Request Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/message` category hub with a reference-faithful real notification feed and redesign join-request review around explicit role selection and role permission previews.

**Architecture:** Keep the existing notification and ledger APIs unchanged. Build the primary message feed directly in `MessagePage`, reuse the current notification target whitelist, and isolate role descriptions/permission rows in a small page-local model so rendering and tests share stable domain mappings.

**Tech Stack:** React 18, TypeScript, React Router 6, TanStack Query 4, Ant Design Mobile 5, SCSS modules, Vitest, jsdom

## Global Constraints

- `/message` must render real notification data and match reference image 1's visual hierarchy.
- Existing `/message/new-follow`, `/message/comment-list`, and `/message/system-notify` routes must remain available.
- Join-request review must match reference images 2–6 while using `--ww-theme-color`, not the reference app's yellow.
- Existing backend API types, URLs, optimistic versions, capability checks, and safe notification target parser must remain unchanged.
- Only roles returned by `getAssignableRoles(currentRole)` may be selected.
- Approval requires an explicit selected role; ignore remains available; duplicate submissions remain locked.

---

### Task 1: Replace `/message` with the notification feed

**Files:**
- Modify: `src/pages/message/MessagePage.tsx`
- Modify: `src/pages/message/index.module.scss`
- Modify: `src/shared/i18n/locales/zh-CN/common.json`
- Modify: `src/shared/i18n/locales/en/common.json`
- Create: `test/pages/message/message-page.test.ts`

**Interfaces:**
- Consumes: `useNotificationsQuery({ params: { limit: 20 } })`, `useMarkNotificationReadMutation()`, `useMarkAllNotificationsReadMutation()`, `getNotificationTarget(payload)`, `showDate(createdAt)`.
- Produces: a `/message` page with `data-testid="message-notification-<id>"`, `message-notification-action-<id>`, `message-read-all`, and `message-load-more` controls.

- [ ] **Step 1: Write the failing message-page tests**

Create a jsdom router test that mocks the notification hooks and asserts the primary page no longer contains category copy, renders app avatar/title/time/content, shows a theme action only for a safe review target, marks an unread item with its current version, navigates to the encoded target even when mark-read rejects, and calls `fetchNextPage` from the load-more button.

```ts
expect(hooks.useNotificationsQuery).toHaveBeenCalledWith({ params: { limit: 20 } });
expect(container.textContent).toContain('申请待处理');
expect(container.textContent).toContain('请处理加入申请');
expect(container.querySelector('[data-testid="message-notification-action-notification-1"]')).not.toBeNull();
expect(container.textContent).not.toContain('message.newFollow.title');

await act(async () => {
  container.querySelector<HTMLButtonElement>('[data-testid="message-notification-action-notification-1"]')?.click();
  await Promise.resolve();
});
expect(hooks.markRead).toHaveBeenCalledWith({ id: 'notification-1', version: 2 });
expect(router.state.location.pathname).toBe('/ledgers/ledger%2Fa/join-requests/request%2Fa');
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm test test/pages/message/message-page.test.ts
```

Expected: FAIL because `/message` still renders the three category buttons and never calls notification hooks.

- [ ] **Step 3: Implement the real notification feed**

Replace the static item array with notification hooks. Import the existing logo and render a compact item. Keep navigation after a best-effort read attempt:

```tsx
const handleOpen = async (notification: UserNotification) => {
  const target = getNotificationTarget(notification.payload);
  if (!target)
    return;
  if (notification.status === UserNotificationStatus.UNREAD) {
    try {
      await markReadMutation.mutateAsync({ id: notification.id, version: notification.version });
    }
    catch {}
  }
  navigate(target);
};

<article className={styles.item} data-testid={`message-notification-${notification.id}`}>
  <img alt="" className={styles.avatar} src={appLogo} />
  <div className={styles.itemContent}>
    <div className={styles.itemHeader}>
      <h2>{notification.title}</h2>
      <time dateTime={notification.createdAt}>{showDate(notification.createdAt)}</time>
    </div>
    <p>
      {notification.content}
      {target && notification.type === UserNotificationType.LEDGER_JOIN_REQUEST && (
        <button data-testid={`message-notification-action-${notification.id}`} onClick={() => void handleOpen(notification)} type="button">
          {t('message.notificationCenter.handle')}
        </button>
      )}
    </p>
  </div>
</article>
```

Add full-width loading/error/empty states, a subdued header action for `markAllRead`, and a load-more button when `hasNextPage`. Add localized `handle` text (`去处理 >>` / `Handle >>`) while reusing existing notification-state translations.

- [ ] **Step 4: Implement the reference-aligned SCSS**

Use a white scroll surface, `16px` horizontal padding, `64px`–`76px` message rows, a `44px` rounded app avatar, `15px` title, `12px` time, `14px/21px` body, `#ebebeb` separators, and `var(--ww-theme-color)` for unread/action accents. Avoid card radii, grey filter bars, type badges, and per-row management button groups.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run:

```bash
pnpm test test/pages/message/message-page.test.ts test/pages/system-notify/notification-navigation.test.ts
```

Expected: PASS, proving the new main feed and existing target whitelist.

- [ ] **Step 6: Commit the message feed**

```bash
git add src/pages/message/MessagePage.tsx src/pages/message/index.module.scss src/shared/i18n/locales/zh-CN/common.json src/shared/i18n/locales/en/common.json test/pages/message/message-page.test.ts
git commit -m "feat(client): turn message home into notification feed"
```

### Task 2: Define role chooser and permission-preview mappings

**Files:**
- Create: `src/pages/ledger-join-request-detail/model.ts`
- Create: `test/pages/ledger/ledger-join-request-detail-model.test.ts`
- Modify: `src/shared/i18n/locales/zh-CN/ledger.json`
- Modify: `src/shared/i18n/locales/en/ledger.json`

**Interfaces:**
- Consumes: `AssignableLedgerRole` and `LedgerRole`.
- Produces: `getJoinRequestPermissionGroups(role: AssignableLedgerRole): readonly JoinRequestPermissionGroup[]` and `getJoinRequestRoleDescriptionKey(role: AssignableLedgerRole): string`.

- [ ] **Step 1: Write failing model tests**

Assert exact permission group keys for each role:

```ts
expect(getJoinRequestPermissionGroups(LedgerRole.VIEWER).map(group => group.key))
  .toEqual(['browse']);
expect(getJoinRequestPermissionGroups(LedgerRole.BOOKKEEPER).map(group => group.key))
  .toEqual(['browse', 'records']);
expect(getJoinRequestPermissionGroups(LedgerRole.ADMIN).map(group => group.key))
  .toEqual(['browse', 'records', 'budget', 'ledgerManagement']);
```

- [ ] **Step 2: Run the focused model test and verify RED**

Run:

```bash
pnpm test test/pages/ledger/ledger-join-request-detail-model.test.ts
```

Expected: FAIL because the page-local model does not exist.

- [ ] **Step 3: Implement immutable role metadata**

Create the exact public shape:

```ts
export interface JoinRequestPermissionGroup {
  descriptionKey: string;
  key: 'browse' | 'records' | 'budget' | 'ledgerManagement';
  titleKey: string;
}

const PERMISSION_GROUPS = {
  browse: { key: 'browse', titleKey: 'requestDetail.permissions.browse.title', descriptionKey: 'requestDetail.permissions.browse.description' },
  records: { key: 'records', titleKey: 'requestDetail.permissions.records.title', descriptionKey: 'requestDetail.permissions.records.description' },
  budget: { key: 'budget', titleKey: 'requestDetail.permissions.budget.title', descriptionKey: 'requestDetail.permissions.budget.description' },
  ledgerManagement: { key: 'ledgerManagement', titleKey: 'requestDetail.permissions.ledgerManagement.title', descriptionKey: 'requestDetail.permissions.ledgerManagement.description' },
} as const;
```

Return `[browse]`, `[browse, records]`, or all four based on `VIEWER`, `BOOKKEEPER`, and `ADMIN`. Map role descriptions to `requestDetail.roleDescriptions.<ROLE>`.

- [ ] **Step 4: Add Chinese and English copy**

Add keys for avatar, choose-role prompt, popup title, role descriptions, permission section title, four permission group titles/descriptions, and selected-state accessible text. Chinese text must match the approved design, including “查看记账”, “添加新记账、修改记账、删除记账”, and the full management permission description.

- [ ] **Step 5: Run the model test and verify GREEN**

Run:

```bash
pnpm test test/pages/ledger/ledger-join-request-detail-model.test.ts
```

Expected: PASS for all three assignable roles.

- [ ] **Step 6: Commit the role metadata**

```bash
git add src/pages/ledger-join-request-detail/model.ts test/pages/ledger/ledger-join-request-detail-model.test.ts src/shared/i18n/locales/zh-CN/ledger.json src/shared/i18n/locales/en/ledger.json
git commit -m "feat(client): define join request role permissions"
```

### Task 3: Redesign the join-request detail interaction

**Files:**
- Modify: `src/pages/ledger-join-request-detail/LedgerJoinRequestDetailPage.tsx`
- Create: `src/pages/ledger-join-request-detail/index.module.scss`
- Modify: `test/pages/ledger/ledger-collaboration-pages.test.ts`

**Interfaces:**
- Consumes: `getAssignableRoles`, `getLedgerUserDisplayName`, `LedgerUserAvatar`, role metadata from Task 2, and existing ledger query/decision hooks.
- Produces: `data-testid="join-request-role-row"`, `join-request-role-popup`, `join-request-role-<ROLE>`, `join-request-ignore`, and `join-request-approve` controls.

- [ ] **Step 1: Replace the existing approval test with explicit-role behavior**

Assert the applicant name is the nav title, the initial role text is the choose prompt, approval is disabled, the role popup exposes only assignable roles, selecting `BOOKKEEPER` renders browse and record permissions, and approval sends the selected role/version. Add an ignore assertion.

```ts
expect(container.textContent).toContain('小勇');
expect(container.textContent).toContain('requestDetail.chooseRole');
expect(container.querySelector<HTMLButtonElement>('[data-testid="join-request-approve"]')?.disabled).toBe(true);

await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="join-request-role-row"]')?.click());
expect(container.querySelector('[data-testid="join-request-role-ADMIN"]')).not.toBeNull();
expect(container.querySelector('[data-testid="join-request-role-BOOKKEEPER"]')).not.toBeNull();

await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="join-request-role-BOOKKEEPER"]')?.click());
expect(container.textContent).toContain('requestDetail.permissions.records.description');

await act(async () => {
  container.querySelector<HTMLButtonElement>('[data-testid="join-request-approve"]')?.click();
  await Promise.resolve();
});
expect(hooks.decideJoinRequest).toHaveBeenCalledWith({
  data: { assignedRole: LedgerRole.BOOKKEEPER, decision: 'APPROVED', version: 4 },
  ledgerId: 'ledger/a',
  requestId: 'request/a',
});
```

- [ ] **Step 2: Run the focused collaboration test and verify RED**

Run:

```bash
pnpm test test/pages/ledger/ledger-collaboration-pages.test.ts
```

Expected: FAIL because the current page defaults to `ADMIN`, uses a native select, and renders three actions plus a decision textarea.

- [ ] **Step 3: Implement the reference page structure**

Remove `effectiveAssignedRole`, `decisionRemark`, the native select, rejection button, and textarea. Use `assignedRole` only. Build three compact information rows; make the role row a button that opens an Ant Design Mobile `Popup`. Render only `assignableRoles`, each with localized description and selected check state.

```tsx
<Popup
  bodyClassName={styles.rolePopup}
  destroyOnClose
  onClose={() => setRolePickerOpen(false)}
  onMaskClick={() => setRolePickerOpen(false)}
  position="bottom"
  showCloseButton
  visible={rolePickerOpen}
>
  <section data-testid="join-request-role-popup">
    <h2>{t('requestDetail.rolePickerTitle')}</h2>
    {assignableRoles.map(role => (
      <button data-testid={`join-request-role-${role}`} key={role} onClick={() => {
        setAssignedRole(role);
        setRolePickerOpen(false);
      }} type="button">
        <span>{t(`role.${role}`)}</span>
        <span>{t(getJoinRequestRoleDescriptionKey(role))}</span>
      </button>
    ))}
  </section>
</Popup>
```

When `assignedRole` exists, map `getJoinRequestPermissionGroups(assignedRole)` into the “加入后的权限” section. Use the applicant display name as `NavBar` title.

- [ ] **Step 4: Implement fixed bottom decisions and new styles**

Keep content scrollable with bottom padding around `96px`. Fix a white action bar above the safe area, with equal-width `48px` buttons; use neutral fill for ignore and `color="primary"` for approve. Disable approve when no role or while loading. Match reference dividers, `16px` paddings, `52px` avatar row, grey section captions, and a rounded-top popup while deriving accents from `var(--ww-theme-color)`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
pnpm test test/pages/ledger/ledger-collaboration-pages.test.ts test/pages/ledger/ledger-join-request-detail-model.test.ts
```

Expected: PASS for explicit selection, role visibility, permission preview, approval, ignore, and existing collaboration pages.

- [ ] **Step 6: Commit the approval redesign**

```bash
git add src/pages/ledger-join-request-detail/LedgerJoinRequestDetailPage.tsx src/pages/ledger-join-request-detail/index.module.scss test/pages/ledger/ledger-collaboration-pages.test.ts
git commit -m "feat(client): redesign join request review"
```

### Task 4: Verify fidelity, regressions, and publish

**Files:**
- Modify: `docs/superpowers/plans/2026-08-05-message-join-request-redesign.md`

**Interfaces:**
- Consumes: completed Tasks 1–3.
- Produces: verified mobile screenshots/runtime evidence, checked plan boxes, clean repository state, and pushed `feat/admin-base` commits.

- [ ] **Step 1: Run formatting and static checks**

Run:

```bash
npx eslint --fix src/pages/message/MessagePage.tsx src/pages/ledger-join-request-detail/LedgerJoinRequestDetailPage.tsx src/pages/ledger-join-request-detail/model.ts test/pages/message/message-page.test.ts test/pages/ledger/ledger-collaboration-pages.test.ts test/pages/ledger/ledger-join-request-detail-model.test.ts
pnpm lint:type
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 2: Run targeted and full regression tests**

Run:

```bash
pnpm test test/pages/message/message-page.test.ts test/pages/system-notify/system-notify-page.test.ts test/pages/system-notify/notification-navigation.test.ts test/pages/ledger/ledger-collaboration-pages.test.ts test/pages/ledger/ledger-join-request-detail-model.test.ts
pnpm test
```

Expected: all targeted files and the complete Vitest suite pass.

- [ ] **Step 3: Build the production client**

Run:

```bash
pnpm build
```

Expected: TypeScript project build and Vite production bundle both succeed.

- [ ] **Step 4: Perform mobile visual and interactive QA**

Start `pnpm dev`, open a `375px`-wide browser, and verify `/message` against image 1: white nav/surface, compact app-avatar rows, inline blue action, readable empty/error/loading states, and no category cards. Open a pending join request and verify all five reference states: initial choose prompt, role popup, viewer permission preview, bookkeeper permission preview, and admin permission preview. Confirm bottom actions remain visible without covering content and the console has no new errors.

- [ ] **Step 5: Recheck the approved design requirement by requirement**

Compare the rendered UI and tests against `docs/superpowers/specs/2026-08-05-message-join-request-redesign.md`. Verify old child routes remain registered, notification targets still use `getNotificationTarget`, and no yellow reference-brand color was introduced.

- [ ] **Step 6: Commit plan completion and push**

```bash
git add docs/superpowers/plans/2026-08-05-message-join-request-redesign.md
git commit -m "docs(client): record message redesign verification"
git push origin feat/admin-base
git status --short
git rev-parse HEAD
git rev-parse origin/feat/admin-base
```

Expected: clean status and matching local/remote commit hashes.

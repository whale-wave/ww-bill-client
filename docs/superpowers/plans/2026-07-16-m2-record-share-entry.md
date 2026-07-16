# M2 Record Share Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the existing record-detail share control to `/share` with the current real `RecordEntry`, then prove the complete share journey with automated and browser evidence.

**Architecture:** The record editing/detail page remains the sole business entry and passes `{ record: state }` through React Router state. `SharePage` and `normalizeShareData()` remain the single normalization/rendering boundary; no store, service API, query serializer, or new shared feature is introduced.

**Tech Stack:** React 18, TypeScript 6, React Router 6, Vitest 4, jsdom, pnpm 10, Vite 8.

## Global Constraints

- Implement only the approved record-detail entry; do not add bill-list gestures or actions.
- Do not add dependencies, service endpoints, stores, Context providers, or persistence.
- Pass the exact current record as `state: { record }`; do not duplicate share normalization in the entry page.
- Preserve `/share` empty state, image download, native share, clipboard fallback, cancellation, failure, and back-navigation behavior.
- Write and observe the failing navigation test before changing production code.
- Use Node `^20.19.0 || >=22.12.0` and the repository's locked pnpm dependencies.
- Do not start category CRUD, message summaries, or community sharing.

---

## File Map

- Create `test/pages/record/editing/list.test.ts`: owns the record-detail share-navigation regression.
- Modify `src/pages/record/editing/list.tsx`: attaches the existing fixed share control to the approved route-state navigation.
- Verify `test/pages/share/share-utils.test.ts`: existing contract coverage for record normalization, date fallback, query recovery, and cancellation; no production change is planned here.
- Modify `docs/frontend-audit-roadmap.md`: closes M2 and records fresh gate/browser evidence.

### Task 1: Connect the record-detail share entry

**Files:**

- Create: `test/pages/record/editing/list.test.ts`
- Modify: `src/pages/record/editing/list.tsx:1-50`
- Verify: `test/pages/share/share-utils.test.ts`

**Interfaces:**

- Consumes: `RecordEntry` from `@/entities/record`, `ROUTES_PATH.SHARE.getPath(): string`, and React Router `navigate(to, { state })`.
- Produces: clicking the existing translated `edit.share` control calls `navigate('/share', { state: { record } })` exactly once.

- [ ] **Step 1: Write the failing navigation test**

Create `test/pages/record/editing/list.test.ts` with this content:

```ts
import type { ReactNode } from 'react';
import type { RecordEntry } from '@/entities/record';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import List from '@/pages/record/editing/list';

const { navigate } = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/ui', () => ({
  FixedPin: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) =>
    createElement('button', { onClick, type: 'button' }, children),
}));

const record: RecordEntry = {
  amount: '88.00',
  category: {
    createdAt: '2026-07-16T00:00:00.000Z',
    icon: 'food',
    id: 1,
    name: '餐饮',
    updatedAt: '2026-07-16T00:00:00.000Z',
  },
  createdAt: '2026-07-16T12:30:00.000Z',
  id: 7,
  remark: '午餐',
  time: '2026-07-16T12:30:00.000Z',
  type: 'sub',
  updatedAt: '2026-07-16T12:30:00.000Z',
};

let cleanup: (() => void) | undefined;

beforeEach(() => {
  navigate.mockReset();
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe('record editing details', () => {
  it('opens the share page with the current record', () => {
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => root.render(createElement(List, { state: record })));
    cleanup = () => act(() => root.unmount());

    const shareButton = [...container.querySelectorAll('button')]
      .find(element => element.textContent === 'edit.share');

    expect(shareButton).toBeDefined();
    act(() => shareButton?.click());

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/share', {
      state: { record },
    });
  });
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run: `pnpm exec vitest run test/pages/record/editing/list.test.ts`

Expected: one failing test. The share button exists, but `navigate` has zero calls because `FixedPin` has no `onClick` in the current production component.

- [ ] **Step 3: Implement the minimal route-state navigation**

Modify `src/pages/record/editing/list.tsx` imports:

```ts
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES_PATH } from '@/shared/config/routes';
```

Inside `List`, immediately after translation setup, add:

```text
const navigate = useNavigate();
const handleShare = () => {
  navigate(ROUTES_PATH.SHARE.getPath(), {
    state: { record: state },
  });
};
```

Replace the existing fixed pin with:

```text
<FixedPin onClick={handleShare}>{t('edit.share')}</FixedPin>
```

Do not modify `SharePage`, `shareUtils`, the route tree, or `FixedPin`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `pnpm exec vitest run test/pages/record/editing/list.test.ts test/pages/share/share-utils.test.ts`

Expected: 2 test files pass; the new entry test passes and the 5 existing share utility tests remain green.

- [ ] **Step 5: Run focused static checks**

Run:

```bash
pnpm exec eslint src/pages/record/editing/list.tsx test/pages/record/editing/list.test.ts
pnpm lint:type
git diff --check
```

Expected: every command exits 0 with no error output.

- [ ] **Step 6: Review and commit the feature slice**

Run:

```bash
git diff -- src/pages/record/editing/list.tsx test/pages/record/editing/list.test.ts
git add src/pages/record/editing/list.tsx test/pages/record/editing/list.test.ts
git commit -m "feat(client): connect record sharing entry"
```

Expected: the commit contains only the one production component and its regression test.

### Task 2: Prove the complete M2 user journey

**Files:**

- Modify: `docs/frontend-audit-roadmap.md:13-28`
- Modify: `docs/frontend-audit-roadmap.md:42-67`
- Add section near `docs/frontend-audit-roadmap.md:236`: `M2 验证日志 — 2026-07-16`

**Interfaces:**

- Consumes: the Task 1 route-state contract and existing `/share` state/query behavior.
- Produces: authenticated browser evidence for real record → share card → image/share link → cleanup, plus a roadmap that marks M2 complete.

- [ ] **Step 1: Run the fresh client gate**

Run in this exact order:

```bash
CI=true pnpm install --frozen-lockfile
pnpm lint:type
pnpm lint
pnpm test
pnpm build
git diff --check
git ls-files 'dist/**' '*.tsbuildinfo' 'coverage/**'
```

Expected:

- install, typecheck, lint, test, build, and diff check exit 0;
- lint remains at 0 errors, with the known warning count recorded rather than silently omitted;
- Vitest reports 7/7 files and 18/18 tests;
- the last command prints nothing, proving generated artifacts remain untracked.

- [ ] **Step 2: Start the local service and client without exposing credentials**

Run the service in its own process:

```bash
cd /Users/avanlan/code/ww/bill/ww-bill-service
export PATH=/Users/avanlan/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH
corepack yarn build
node dist/src/main.js > /tmp/ww-bill-service-m2.log 2>&1
```

Run the client in another process:

```bash
cd /Users/avanlan/code/ww/bill/ww-bill-client
pnpm dev --host 127.0.0.1 > /tmp/ww-bill-client-m2.log 2>&1
```

Verify ports 3001 and 3231 listen with `lsof -nP -iTCP:3001 -sTCP:LISTEN` and `lsof -nP -iTCP:3231 -sTCP:LISTEN`. Do not print raw service logs because they include authentication headers.

- [ ] **Step 3: Create a known record and enter its share page**

Using the in-app browser at `http://localhost:3231/` and its existing authenticated session:

1. Create a test expense with amount `0.12`, category `餐饮`, and remark `M2 分享验收`.
2. Open the created record's `/editing/:id` detail.
3. Click the existing “分享” fixed control.

Expected: the URL becomes `/#/share`, not an empty-state route, and the card shows expense `0.12`, category `餐饮`, remark `M2 分享验收`, and the record date.

- [ ] **Step 4: Exercise share behaviors and cleanup**

1. Use the share page back control and verify it returns to the same `/editing/:id` record, then enter share again.
2. Use “保存图片” and verify a browser download is produced.
3. Use the share action. If native share is unavailable, verify the copy-success Toast.
4. Obtain or reconstruct the generated `#/share?...` query URL from the known card fields and open it in the same authenticated origin without route state.
5. Verify the query-only page renders the same required fields.
6. Navigate directly to `/#/share` with neither state nor query and verify the explicit empty state.
7. Return to the test record and delete it; verify it is absent from detail/search results.

Expected: every state, query, fallback, and cleanup behavior matches the approved design; browser console errors remain 0.

- [ ] **Step 5: Stop local processes safely**

Run without reading the redirected service log:

```bash
pids=$(lsof -tiTCP:3001 -sTCP:LISTEN); if [ -n "$pids" ]; then kill $pids; fi
pids=$(lsof -tiTCP:3231 -sTCP:LISTEN); if [ -n "$pids" ]; then kill $pids; fi
lsof -tiTCP:3001 -sTCP:LISTEN >/dev/null && exit 1 || true
lsof -tiTCP:3231 -sTCP:LISTEN >/dev/null && exit 1 || true
```

Expected: both ports are closed.

- [ ] **Step 6: Close M2 in the roadmap with exact evidence**

Update `docs/frontend-audit-roadmap.md` so that:

- the M2 status row reads `已完成` and names the real record-detail share entry;
- current priority states M2 is closed and does not imply it is still unstarted;
- the feature map says record detail can enter `/share` with real data;
- the share P0 item is marked completed and no longer claims the quality gate is blocked;
- a `M2 验证日志 — 2026-07-16` section records 7/7 test files, 18/18 tests, lint/type/build/diff results, the known lint warning count, the `0.12` browser record, image/share-link behavior, query-only recovery, empty state, console error count, and successful deletion.

Do not mark category CRUD, message summaries, or community sharing complete.

- [ ] **Step 7: Verify and commit the roadmap evidence**

Run:

```bash
pnpm exec eslint docs/frontend-audit-roadmap.md
git diff --check
git diff -- docs/frontend-audit-roadmap.md
git add docs/frontend-audit-roadmap.md
git commit -m "docs(client): close M2 record sharing"
```

Expected: documentation checks pass and the commit contains only the roadmap evidence.

### Task 3: Final completion audit

**Files:**

- Verify: `docs/superpowers/specs/2026-07-16-m2-record-share-entry-design.md`
- Verify: `docs/frontend-audit-roadmap.md`
- Verify: the Task 1 production and test files.

**Interfaces:**

- Consumes: every acceptance criterion and verification artifact from Tasks 1-2.
- Produces: a clean, evidence-backed M2 completion state.

- [ ] **Step 1: Audit every approved design requirement**

Read the design spec and confirm direct evidence exists for each requirement: one record-detail entry only; exact `{ record }` state contract; real card fields; query-only recovery; image download; native share or clipboard fallback; back/empty/error behavior; test record cleanup; and no service/API/dependency/category/message/community scope expansion.

Expected: no acceptance item is supported only by inference or an unrelated test.

- [ ] **Step 2: Run post-commit verification**

Run:

```bash
pnpm lint:type
pnpm test
pnpm build
pnpm exec eslint . --quiet
git diff --check
git status --short --branch
git log -3 --oneline
```

Expected: all commands exit 0, Vitest reports 7/7 files and 18/18 tests, the worktree is clean, and the latest commits include the feature and M2 roadmap closure.

- [ ] **Step 3: Mark the active M2 goal complete**

Only after Step 2 and the requirement audit both pass, update the active goal to `complete` and report the exact commits, automated evidence, browser evidence, remaining non-M2 enhancements, and elapsed goal time.

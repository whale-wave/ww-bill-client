# ww-bill-client P9 Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore a reproducible `ww-bill-client` quality baseline on `feat/admin-base` so dependency installation, TypeScript, ESLint, Vitest, and the production build all pass without changing product behavior.

**Architecture:** Stabilize from the bottom up. First make the lockfile installation reproducible, then repair shared type/module boundaries, close the remaining TypeScript and ESLint regressions, add a minimal pure-logic Vitest suite, and only then run the full release gate. Keep FSD import direction and existing runtime behavior unchanged.

**Tech Stack:** Node `^20.19.0 || >=22.12.0`, pnpm 11, React 18, TypeScript 6, Vite 8, Vitest 4, jsdom, ESLint 9, TanStack React Query 4.

## Goal Task Text

Copy the following text directly when creating the goal task:

> Complete `ww-bill-client` P9 post-merge stabilization on `feat/admin-base`. Preserve existing documentation changes and product behavior. Install dependencies reproducibly from `pnpm-lock.yaml`; repair shared API/UI/record type boundaries and all remaining TypeScript errors; make `pnpm lint` exit successfully; add Vitest 4 + jsdom with pure-logic tests for amount normalization, share data normalization, and query key factories; make `pnpm lint:type`, `pnpm lint`, `pnpm test`, and `pnpm build` all pass; update the P9 roadmap checkboxes with fresh evidence. Do not start M2 share-entry feature work until every P9 gate passes.

## Global Constraints

- Work only in `/Users/avanlan/code/ww/bill/ww-bill-client` on `feat/admin-base`.
- Preserve the existing uncommitted documentation changes under `docs/`; never reset, checkout, or overwrite them.
- Do not implement the M2 share-entry feature in this phase. Existing share utilities may receive tests, but user-visible behavior must remain unchanged.
- Keep FSD import direction: `app → pages → widgets → features → entities → shared`.
- Use explicit type imports. Do not restore ambient global `SuccessResponse` declarations.
- Do not add new `any`. Replace existing touched `SuccessResponse<any>` uses with a concrete type or `unknown`.
- Keep React 18, React Router 6, React Query 4, Zustand 4, Vite 8, and TypeScript 6 versions unchanged.
- The only new dependencies authorized by this plan are `vitest@^4.1.6` and `jsdom` as dev dependencies.
- Standard verification commands are `pnpm lint:type`, `pnpm lint`, `pnpm test`, and `pnpm build`.
- Run `git diff --check` after every task that changes files.
- Keep code and documentation commits separate from the pre-existing roadmap edits until the final documentation task.

---

## File Map

**Dependency and test infrastructure**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `tsconfig.node.json`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `test/shared/lib/amount.test.ts`
- Create: `test/pages/share/share-utils.test.ts`
- Create: `test/entities/query-keys.test.ts`

**Shared contracts and FSD public APIs**

- Modify: `src/shared/api/axios-shim.d.ts`
- Modify: `src/shared/api/http.ts`
- Modify: `src/shared/api/is-success.ts`
- Modify: `src/shared/api/upload.ts`
- Modify: `src/shared/ui/input/input.tsx`
- Modify: `src/shared/ui/input/index.ts`
- Modify: `src/shared/ui/index.ts`
- Modify: `src/entities/record/types.ts`
- Modify: `src/entities/record/api.ts`
- Modify: `src/entities/record/hooks.ts`
- Modify: `src/entities/record/ui/RecordList.tsx`
- Modify: `src/entities/record/ui/RecordListItem.tsx`

**Known TypeScript and lint regression sites**

- Modify the entity API/hook files listed in Task 2 for explicit `SuccessResponse` imports.
- Modify: `src/pages/chart/chart-category/index.ts`
- Modify: `src/pages/chart/chart-home/index.ts`
- Modify: `src/pages/record/detail/Top.tsx`
- Modify: `src/pages/not-found/NotFoundPage.tsx`
- Modify: `src/shared/lib/export-data.ts`
- Modify: `src/pages/record/bookkeeping/icon.ts`
- Modify: `src/shared/lib/component.ts`
- Modify: `src/pages/asset/asset-chart/AssetChartPage.tsx`
- Modify: `src/pages/create-budget-category/CreateBudgetCategoryPage.tsx`
- Modify the unused-import files listed in Task 3.
- Split: `src/shared/lib/senior-mode.tsx`
- Create: `src/shared/lib/senior-mode-context.ts`
- Create: `src/shared/lib/senior-mode-provider.tsx`
- Create: `src/shared/lib/senior-mode.ts`

**Roadmap evidence**

- Modify: `docs/fsd-refactor-plan.md`
- Modify: `docs/frontend-audit-roadmap.md`

---

### Task 1: Reproduce Dependencies and Capture the Fresh Baseline

**Files:**

- Inspect: `package.json`
- Inspect: `pnpm-lock.yaml`
- Preserve: all current `docs/` changes

**Interfaces:**

- Consumes: committed `package.json` and `pnpm-lock.yaml` on `feat/admin-base`.
- Produces: a lockfile-consistent `node_modules` and fresh gate output for the remaining tasks.

- [ ] **Step 1: Confirm branch and preserve the dirty-worktree inventory**

Run:

```bash
git status --short --branch
git diff --name-only
```

Expected: branch is `feat/admin-base`; existing modified files are documentation files. Record the list and do not reset it.

- [ ] **Step 2: Confirm the Node version satisfies the package engine**

Run:

```bash
node --version
node -e "const e=require('./package.json').engines.node; console.log(e)"
```

Expected: Node is `20.19.0+` or `22.12.0+`; the repository currently declares `^20.19.0 || >=22.12.0`.

- [ ] **Step 3: Install exactly from the lockfile without an interactive purge prompt**

Run:

```bash
CI=true pnpm install --frozen-lockfile
```

Expected: exit 0; `package.json` and `pnpm-lock.yaml` remain unchanged. If the frozen install reports lockfile drift, stop this task and report the exact mismatch instead of regenerating the lockfile.

- [ ] **Step 4: Capture the fresh pre-fix gates**

Run each command independently so one failure does not hide the others:

```bash
pnpm lint:type
pnpm lint
pnpm build
```

Expected before implementation: failures are allowed and must be copied into the task log. Missing packages such as `lucide-react`, `react-dev-inspector`, or Vite plugins must no longer appear after the frozen install; remaining failures are source regressions handled below.

- [ ] **Step 5: Verify installation did not create tracked changes**

Run:

```bash
git diff -- package.json pnpm-lock.yaml
git diff --check
```

Expected: no package/lockfile diff and no whitespace errors. Do not commit `node_modules` or build artifacts.

---

### Task 2: Repair Shared API, Input, and Record Type Boundaries

**Files:**

- Modify: `src/shared/api/axios-shim.d.ts`
- Modify: `src/shared/api/http.ts`
- Modify: `src/shared/api/is-success.ts`
- Modify: `src/shared/api/upload.ts`
- Modify: `src/shared/ui/input/input.tsx`
- Modify: `src/shared/ui/input/index.ts`
- Modify: `src/shared/ui/index.ts`
- Modify: `src/entities/record/types.ts`
- Modify: `src/entities/record/api.ts`
- Modify: `src/entities/record/hooks.ts`
- Modify: `src/entities/record/ui/RecordList.tsx`
- Modify: `src/entities/record/ui/RecordListItem.tsx`
- Modify: entity files listed in Step 2

**Interfaces:**

- Consumes: `SuccessResponse<T>` from `src/shared/api/types.ts` and the FSD public API rule.
- Produces: explicit `SuccessResponse` imports, a single exported `RecordEntry` domain type, and an exported `InputProps` supporting wrapper style and suffix content.

- [ ] **Step 1: Fix Axios module augmentation**

Replace `src/shared/api/axios-shim.d.ts` with:

```ts
import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    loading?: boolean;
  }
}
```

This keeps Axios's original exports (`create`, `get`, interceptors) while augmenting `AxiosRequestConfig`.

- [ ] **Step 2: Add explicit `SuccessResponse` imports everywhere it is consumed**

For entity files, use separate imports in this form:

```ts
import type { SuccessResponse } from '@/shared/api';
import { isSuccessApi, request } from '@/shared/api';
```

Apply the relevant subset to these exact files:

```text
src/entities/auth/api.ts
src/entities/chart/api.ts
src/entities/chart/hooks.ts
src/entities/follow/api.ts
src/entities/follow/hooks.ts
src/entities/invoice/api.ts
src/entities/invoice/hooks.ts
src/entities/record/api.ts
src/entities/record/hooks.ts
src/entities/system-notify/api.ts
src/entities/system-notify/hooks.ts
src/entities/topic/api.ts
src/entities/topic/hooks.ts
src/entities/user/api.ts
src/entities/user/hooks.ts
src/entities/user-app-config/api.ts
src/entities/user-app-config/hooks.ts
src/entities/user-email/api.ts
```

For shared API internals, import directly from the sibling type module to avoid a barrel cycle:

```ts
import type { SuccessResponse } from './types';
```

Apply this to:

```text
src/shared/api/http.ts
src/shared/api/is-success.ts
src/shared/api/upload.ts
```

In `src/entities/user/api.ts`, replace touched `SuccessResponse<any>` return types with `SuccessResponse<unknown>`.

- [ ] **Step 3: Make `RecordEntry` the canonical record domain type**

Replace `src/entities/record/types.ts` with:

```ts
export interface RecordEntry {
  amount: string;
  category: {
    createdAt: string;
    icon: string;
    id: number;
    name: string;
    updatedAt: string;
  };
  createdAt: string;
  id: number;
  remark: string;
  status?: boolean;
  time: string;
  type: 'sub' | 'add';
  updatedAt: string;
}

/** @deprecated Use RecordEntry. Kept temporarily for existing page state types. */
export type recordChildren = RecordEntry;
```

Remove the duplicate `RecordEntry` interface from `src/entities/record/api.ts` and add:

```ts
import type { RecordEntry } from './types';
```

Update `src/entities/record/hooks.ts` so `RecordEntry` is imported from `./types`, not `./api`. Keep UI imports from `../types`; `src/entities/record/index.ts` already exports `./types`.

- [ ] **Step 4: Export and complete the shared input contract**

Use this public contract in `src/shared/ui/input/input.tsx`:

```ts
import type { ChangeEventHandler, CSSProperties, FC, ReactNode } from 'react';

export interface InputProps {
  className?: string;
  label?: ReactNode;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  style?: CSSProperties;
  suffix?: ReactNode;
  type?: string;
  value?: string | number;
}
```

Destructure `style` and `suffix`; apply `style` to the wrapper `<label>` and render the suffix after the native `<input>`:

```tsx
<label className={`${classPrefix}-wrapper ${className}`} style={style}>
  {label && <span className={`${classPrefix}-name`}>{label}</span>}
  <input
    className={classPrefix}
    onChange={onChange}
    placeholder={placeholder}
    type={type}
    value={value}
  />
  {suffix && <span className={`${classPrefix}-suffix`}>{suffix}</span>}
</label>;
```

Export the type through both barrels:

```ts
// src/shared/ui/input/index.ts
export type { InputProps } from './input';

// src/shared/ui/index.ts
export { default as Input, type InputProps } from './input';
```

Add this layout rule to `src/shared/ui/input/input.scss`:

```scss
&-suffix {
  flex-shrink: 0;
  margin-left: auto;
}
```

- [ ] **Step 5: Run the focused type and lint checks**

Run:

```bash
pnpm exec eslint src/shared/api src/shared/ui/input src/entities/record src/entities/auth src/entities/chart src/entities/follow src/entities/invoice src/entities/system-notify src/entities/topic src/entities/user src/entities/user-app-config src/entities/user-email
pnpm lint:type
git diff --check
```

Expected: Axios, `SuccessResponse`, `RecordEntry`, and `InputProps` diagnostics are gone. Other TypeScript diagnostics may remain for Task 3.

- [ ] **Step 6: Commit the shared contract repair**

Run:

```bash
git add src/shared/api src/shared/ui/input src/shared/ui/index.ts src/entities
git commit -m "fix(client): restore shared type contracts"
```

Expected: commit contains no roadmap files.

---

### Task 3: Close the Remaining TypeScript Regression Set

**Files:**

- Modify: `src/pages/chart/chart-category/index.ts`
- Modify: `src/pages/chart/chart-home/index.ts`
- Modify: `src/pages/record/detail/Top.tsx`
- Modify: `src/pages/not-found/NotFoundPage.tsx`
- Modify: `src/shared/lib/export-data.ts`
- Modify: `src/pages/record/bookkeeping/icon.ts`
- Modify: `src/shared/lib/component.ts`
- Modify: `src/pages/asset/asset-chart/AssetChartPage.tsx`
- Modify: `src/pages/create-budget-category/CreateBudgetCategoryPage.tsx`
- Modify: unused-import files listed in Step 2

**Interfaces:**

- Consumes: repaired shared contracts from Task 2.
- Produces: `pnpm lint:type` exit 0 without changing runtime routes or API payloads.

- [ ] **Step 1: Repair renamed page barrels and the detail-page type import**

Use these exact exports:

```ts
// src/pages/chart/chart-category/index.ts
export { default as ChartCategory } from './ChartCategoryPage';

// src/pages/chart/chart-home/index.ts
export { default as ChartHome } from './ChartHomePage';
```

In `src/pages/record/detail/Top.tsx`, change:

```ts
import type { numType } from './DetailPage';
```

- [ ] **Step 2: Apply the known one-line type corrections**

Make these exact corrections:

```text
src/pages/not-found/NotFoundPage.tsx
  add: import type { FC } from 'react';

src/shared/lib/export-data.ts
  change: config.APP_NAME
  to:     config.appName

src/pages/asset/asset-chart/AssetChartPage.tsx
  change NavBar back={false} to back={null}

src/pages/create-budget-category/CreateBudgetCategoryPage.tsx
  change NavBar back={false} to back={null}

src/shared/lib/component.ts
  change: return res;
  to:     return res as C & O;
```

In `src/pages/record/bookkeeping/icon.ts`, replace the mutation loop with an immutable return so `id` is inferred:

```ts
return list.map((item, index) => ({
  ...item,
  id: index + 1,
}));
```

- [ ] **Step 3: Remove imports that TypeScript reports as unused**

Remove the unused `dayjs` value import from:

```text
src/pages/auth/forget-password/VerifyCodePage.tsx
src/pages/record/model/useRecordList.ts
src/pages/user/email-change/EmailChangeCaptchaPage.tsx
src/pages/user/email-change/EmailChangePage.tsx
```

Remove the unused `i18n` import from:

```text
src/pages/record/bookkeeping/model/useCalculator.ts
```

Keep any type-only Dayjs imports that are still used.

- [ ] **Step 4: Run TypeScript and resolve only diagnostics still emitted**

Run:

```bash
pnpm lint:type
```

Expected: exit 0. If a diagnostic remains, fix the referenced type/import at its existing FSD layer; do not add `@ts-ignore`, ambient globals, broad casts, or new `any`.

- [ ] **Step 5: Verify the production build reaches Vite**

Run:

```bash
pnpm build
git diff --check
```

Expected: TypeScript phase and Vite build both exit 0. Generated `dist/` and `*.tsbuildinfo` files remain ignored.

- [ ] **Step 6: Commit the TypeScript regression fixes**

Run:

```bash
git add src/pages src/shared/lib
git commit -m "fix(client): close post-merge type regressions"
```

Expected: commit contains no roadmap files.

---

### Task 4: Make ESLint a Reliable Error Gate

**Files:**

- Modify: all files changed automatically by `pnpm lint:fix`
- Split: `src/shared/lib/senior-mode.tsx`
- Create: `src/shared/lib/senior-mode-context.ts`
- Create: `src/shared/lib/senior-mode-provider.tsx`
- Create: `src/shared/lib/senior-mode.ts`

**Interfaces:**

- Consumes: type-clean source from Task 3.
- Produces: `pnpm lint` exit 0, with no ESLint errors and an explicitly recorded warning count.

- [ ] **Step 1: Apply repository-configured safe auto-fixes in an isolated diff**

Run:

```bash
pnpm lint:fix
git diff --stat
git diff --check
```

Expected: import order, quote style, type-only import style, and JSX formatting errors are fixed. Review the diff before continuing; do not accept product behavior changes.

- [ ] **Step 2: Split senior-mode utilities from the provider component**

Create `src/shared/lib/senior-mode-context.ts`:

```ts
import { createContext, useContext } from 'react';

const STORAGE_KEY = 'app-senior-mode';

export interface SeniorModeContextValue {
  isSeniorMode: boolean;
  toggleSeniorMode: () => void;
}

export const SeniorModeContext = createContext<SeniorModeContextValue>({
  isSeniorMode: false,
  toggleSeniorMode: () => {},
});

export function getSeniorMode(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setSeniorMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function applySeniorMode(enabled: boolean): void {
  document.documentElement.classList.toggle('senior', enabled);
}

export const useSeniorMode = (): SeniorModeContextValue => useContext(SeniorModeContext);
```

Create `src/shared/lib/senior-mode-provider.tsx`; this module must export only the React component so the Fast Refresh rule can validate it:

```tsx
import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applySeniorMode,
  getSeniorMode,
  SeniorModeContext,
  setSeniorMode,
} from './senior-mode-context';

export const SeniorModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isSeniorMode, setIsSeniorMode] = useState(() => getSeniorMode());

  useEffect(() => {
    applySeniorMode(isSeniorMode);
  }, [isSeniorMode]);

  const toggleSeniorMode = useCallback(() => {
    setIsSeniorMode((previous) => {
      const next = !previous;
      setSeniorMode(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ isSeniorMode, toggleSeniorMode }),
    [isSeniorMode, toggleSeniorMode],
  );

  return (
    <SeniorModeContext.Provider value={value}>
      {children}
    </SeniorModeContext.Provider>
  );
};
```

Create `src/shared/lib/senior-mode.ts` as the stable public barrel:

```ts
export {
  applySeniorMode,
  getSeniorMode,
  setSeniorMode,
  useSeniorMode,
} from './senior-mode-context';
export { SeniorModeProvider } from './senior-mode-provider';
```

Delete `src/shared/lib/senior-mode.tsx`. Existing imports from `@/shared/lib/senior-mode` must continue to work unchanged.

- [ ] **Step 3: Re-run ESLint and classify the remaining warnings**

Run:

```bash
pnpm lint
```

Expected: exit 0 and zero errors. Record the warning count in the task log. Fix warnings in files touched by Tasks 2-4 when the correction is local and behavior-preserving; leave unrelated historical warnings for a separately measured cleanup rather than broad refactoring.

- [ ] **Step 4: Re-run type and build after lint changes**

Run:

```bash
pnpm lint:type
pnpm build
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit the lint stabilization**

Run:

```bash
git add src
git commit -m "chore(client): restore eslint error gate"
```

Expected: commit contains only source lint/stability changes and no roadmap files.

---

### Task 5: Add the Minimal Vitest 4 Test Gate

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `tsconfig.node.json`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `test/shared/lib/amount.test.ts`
- Create: `test/pages/share/share-utils.test.ts`
- Create: `test/entities/query-keys.test.ts`

**Interfaces:**

- Consumes: stable Vite aliases and pure functions/key factories already present in the codebase.
- Produces: `pnpm test` as a non-watch CI gate and `pnpm test:watch` for local development.

- [ ] **Step 1: Prove the test gate is currently missing**

Run:

```bash
pnpm test
```

Expected before implementation: failure because `package.json` has no `test` script.

- [ ] **Step 2: Install the authorized test dependencies**

Run:

```bash
pnpm add -D vitest@^4.1.6 jsdom
```

Expected: only `package.json` and `pnpm-lock.yaml` change. Do not upgrade existing dependencies.

- [ ] **Step 3: Add scripts and TypeScript config coverage**

Add to `package.json` scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Update `tsconfig.node.json` include:

```json
{
  "include": [
    "vite.config.ts",
    "vitest.config.ts"
  ]
}
```

- [ ] **Step 4: Add the Vitest configuration**

Create `vitest.config.ts`:

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    include: ['test/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
  },
});
```

Create `test/setup.ts`:

```ts
import { beforeEach } from 'vitest';
import '@/shared/i18n';

beforeEach(() => {
  localStorage.clear();
});
```

- [ ] **Step 5: Add amount normalization tests**

Create `test/shared/lib/amount.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatAmount, normalizeAmount } from '@/shared/lib/amount';

describe('amount helpers', () => {
  it('formats amounts to two decimal places', () => {
    expect(formatAmount(12)).toBe('12.00');
    expect(formatAmount(12.345)).toBe('12.35');
  });

  it('normalizes leading decimal input', () => {
    expect(normalizeAmount('.', '')).toBe('0.');
  });

  it('rejects a second decimal point and excess precision', () => {
    expect(normalizeAmount('1.2.3', '1.2')).toBe('1.2');
    expect(normalizeAmount('1.234', '1.23')).toBe('1.23');
  });

  it('removes non-numeric characters and redundant leading zeroes', () => {
    expect(normalizeAmount('abc12.3', '')).toBe('12.3');
    expect(normalizeAmount('00012', '')).toBe('12');
  });
});
```

- [ ] **Step 6: Add share normalization tests**

Create `test/pages/share/share-utils.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  buildShareUrl,
  getSourceFromSearchParams,
  isShareCancelError,
  normalizeShareData,
} from '@/pages/share/model/shareUtils';

describe('share utilities', () => {
  it('normalizes a record-shaped source', () => {
    expect(normalizeShareData({
      amount: '88.00',
      type: 'sub',
      category: { name: '餐饮' },
      remark: '午餐',
      dateText: '2026-07-16',
    })).toEqual({
      amount: '88.00',
      type: 'sub',
      categoryName: '餐饮',
      remark: '午餐',
      dateText: '2026-07-16',
    });
  });

  it('rejects incomplete share data', () => {
    expect(normalizeShareData({ amount: '88.00', type: 'sub' })).toBeNull();
  });

  it('reads query parameters and builds a copyable URL', () => {
    const source = getSourceFromSearchParams(new URLSearchParams(
      'amount=88.00&type=sub&categoryName=%E9%A4%90%E9%A5%AE&dateText=2026-07-16',
    ));
    const data = normalizeShareData(source);
    expect(data).not.toBeNull();
    expect(buildShareUrl(data!)).toContain('#/share?amount=88.00&type=sub');
  });

  it('recognizes browser share cancellation', () => {
    const error = new Error('cancel');
    error.name = 'AbortError';
    expect(isShareCancelError(error)).toBe(true);
    expect(isShareCancelError(new Error('network failed'))).toBe(false);
  });
});
```

- [ ] **Step 7: Add query-key factory tests**

Create `test/entities/query-keys.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { assetKeys } from '@/entities/asset';
import { budgetKeys } from '@/entities/budget';
import { recordKeys } from '@/entities/record';
import { topicKeys } from '@/entities/topic';

describe('query key factories', () => {
  it('creates stable record list and detail keys', () => {
    expect(recordKeys.list({ keyword: 'coffee' })).toEqual([
      'record',
      'list',
      { keyword: 'coffee' },
    ]);
    expect(recordKeys.detail({ id: '42' })).toEqual(['record', 'detail', '42']);
  });

  it('keeps domain roots separate', () => {
    expect(assetKeys.all).toEqual(['asset']);
    expect(budgetKeys.all).toEqual(['budget']);
    expect(topicKeys.all).toEqual(['topic']);
  });

  it('includes mutation-relevant parameters in keys', () => {
    expect(topicKeys.list(true)).toEqual(['topic', 'list', { recommend: true }]);
    expect(assetKeys.group('cash')).toEqual(['asset', 'group', 'cash']);
  });
});
```

- [ ] **Step 8: Run the new test and existing quality gates**

Run:

```bash
pnpm test
pnpm lint:type
pnpm lint
pnpm build
git diff --check
```

Expected: all commands exit 0 and Vitest reports three passing test files.

- [ ] **Step 9: Commit the test gate**

Run:

```bash
git add package.json pnpm-lock.yaml tsconfig.node.json vitest.config.ts test
git commit -m "test(client): add vitest quality gate"
```

Expected: commit contains test infrastructure, tests, and the two authorized dependency additions only.

---

### Task 6: Run the Final Gate, Smoke Critical Flows, and Close P9

**Files:**

- Modify: `docs/fsd-refactor-plan.md`
- Modify: `docs/frontend-audit-roadmap.md`
- Preserve: `docs/flowcharts/feature-flows.md` and all prior roadmap updates

**Interfaces:**

- Consumes: passing dependency, type, lint, test, and build tasks.
- Produces: fresh P9 evidence and a clean handoff to M2 share-entry work.

- [ ] **Step 1: Run the complete gate from a fresh shell**

Run in this exact order:

```bash
CI=true pnpm install --frozen-lockfile
pnpm lint:type
pnpm lint
pnpm test
pnpm build
git diff --check
```

Expected: every command exits 0. Record Node version, pnpm version, test file/test counts, ESLint warning count, and build result in the P9 execution log.

- [ ] **Step 2: Confirm generated artifacts are ignored**

Run:

```bash
git status --short
git ls-files 'dist/**' '*.tsbuildinfo' 'coverage/**'
```

Expected: no tracked build, TypeScript build-info, or coverage artifacts are introduced.

- [ ] **Step 3: Smoke the critical browser flows**

Run:

```bash
pnpm dev
```

Verify this explicit checklist in the browser:

```text
[ ] Login with username/password reaches the previous page or home.
[ ] Registration accepts email, password, and email captcha fields.
[ ] Forget-password pages render and navigate without runtime errors.
[ ] Bookkeeping can enter amount/category/remark and submit.
[ ] Record detail and editing pages render existing records.
[ ] Budget, asset, invoice, and fixed-expense pages open.
[ ] Chart tabs switch and category ranking opens category detail.
[ ] Community, topic detail, follow, comment, and system notification pages open.
[ ] Language switching updates visible copy and persists after reload.
[ ] Senior mode toggles the html.senior class and persists after reload.
[ ] Direct /share without valid data shows its intentional empty state.
```

Expected: all items pass. Stop the dev server after verification.

- [ ] **Step 4: Update P9 evidence in the roadmap**

In `docs/fsd-refactor-plan.md`:

- Check all six P9 checkboxes.
- Change the P9 table status from `进行中` to `✅ 已完成`.
- Append the exact verification date, versions, command results, test count, ESLint warning count, build result, and smoke result.

In `docs/frontend-audit-roadmap.md`:

- Change M1 from `重新打开` to `已恢复`.
- Change M3/M5 validation from reopened to passed.
- Change M6 testing from `未完成` to `最小闭环完成`.
- Keep M2 as incomplete until the real share-entry task is implemented.

- [ ] **Step 5: Re-run documentation and worktree checks**

Run:

```bash
git diff --check
git status --short --branch
git log --oneline -5
```

Expected: only intentional roadmap changes remain uncommitted; source/test commits are visible; no unrelated files changed.

- [ ] **Step 6: Commit the P9 evidence without mixing code**

Review all pre-existing roadmap edits first, then run:

```bash
git add docs
git diff --cached --check
git commit -m "docs(client): close P9 stabilization plan"
```

Expected: the documentation commit preserves the earlier roadmap refresh and adds the verified P9 result.

---

## Completion Criteria

P9 is complete only when all statements below are true in the same final verification run:

- [ ] `CI=true pnpm install --frozen-lockfile` exits 0.
- [ ] `pnpm lint:type` exits 0.
- [ ] `pnpm lint` exits 0 with zero errors; any warnings are counted and recorded.
- [ ] `pnpm test` exits 0 with the three planned test files passing.
- [ ] `pnpm build` exits 0.
- [ ] Critical browser smoke checklist passes.
- [ ] `git diff --check` exits 0.
- [ ] No build, coverage, or dependency artifacts are tracked.
- [ ] P9 roadmap evidence is updated with fresh command results.
- [ ] M2 share-entry feature work has not been mixed into this phase.

## Stop Conditions

Stop and report evidence instead of expanding scope when any of these occurs:

- Frozen install reports that `package.json` and `pnpm-lock.yaml` disagree.
- Passing the gates requires upgrading an existing major dependency.
- A proposed type fix changes API payloads, route paths, authentication behavior, financial calculations, or persisted state.
- A lint fix changes user-visible behavior instead of formatting/import/hook correctness.
- Smoke testing requires unavailable credentials or backend state; report the exact blocked flows and complete every independent gate first.

## Context7 References Used

- Vitest official documentation: use `vitest run` for a one-shot test gate; TypeScript tests use `.test.ts`; a DOM environment is configured with `environment: 'jsdom'` and the `jsdom` package.
- pnpm official documentation: use `pnpm install --frozen-lockfile` for lockfile-consistent installation; package scripts can be run with the `pnpm <script>` shorthand.

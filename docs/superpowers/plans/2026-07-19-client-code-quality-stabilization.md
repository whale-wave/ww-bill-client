# ww-bill-client Code Quality Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复已经复现的关键用户流程缺陷，并让测试与生产构建在项目声明支持的工具链范围内可重复运行。

**Architecture:** 保持现有 FSD 分层和 API 契约不变，把 URL 参数、异步详情状态和计算器提交规则收敛到各自已有 slice 内。配置改动只处理测试环境、开发 Inspector 隔离和 pnpm/Docker 可复现性，不在本批次升级业务依赖。

**Tech Stack:** Node `^20.19.0 || >=22.12.0`, pnpm `10.34.3`, React 18, React Router 6, TanStack React Query 4, TypeScript 6, Vite 8, Vitest 4, jsdom.

## Global Constraints

- Work only in `/Users/avan/Code/whale-wave/bill/ww-bill-client` on `feat/admin-base`.
- Preserve existing product appearance, API endpoints, response-envelope behavior, hash routing, and FSD import direction.
- Do not upgrade production dependencies in this batch.
- Do not add `any`, non-null assertions for URL/query data, or new `eslint-disable` comments.
- Every behavior fix must demonstrate RED before implementation and GREEN after implementation.
- Run targeted ESLint with `--fix` for every changed TypeScript/TSX file.
- Final verification commands are `pnpm lint:type`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm build:docker`, and `git diff --check`.
- Existing lint warnings may be reduced but must not increase above the 82-warning baseline.

---

## File Map

**Test runtime**

- Modify: `test/setup.ts`

**Password recovery contract**

- Create: `src/pages/auth/forget-password/model/params.ts`
- Modify: `src/pages/auth/forget-password/ForgetPasswordPage.tsx`
- Modify: `src/pages/auth/forget-password/VerifyCodePage.tsx`
- Modify: `src/pages/auth/forget-password/ResetPage.tsx`
- Create: `test/pages/auth/forget-password-params.test.ts`

**Async detail reliability**

- Modify: `src/pages/invoice/ui/InvoiceInfoForm.tsx`
- Create: `test/pages/invoice/invoice-info-form.test.ts`
- Modify: `src/pages/record/editing/EditingPage.tsx`
- Modify: `src/app/router.tsx`
- Create: `test/pages/record/editing/editing-page.test.ts`

**Calculator submission**

- Modify: `src/pages/record/bookkeeping/model/useCalculator.ts`
- Modify: `src/pages/record/bookkeeping/keyboard.tsx`
- Modify: `test/pages/record/bookkeeping/keyboard.test.ts`

**Build reproducibility**

- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `Dockerfile`
- Modify: `pnpm-workspace.yaml`

---

### Task 1: Restore Vitest on Node 26

**Files:**

- Modify: `test/setup.ts`

**Interfaces:**

- Consumes: Vitest `jsdom` environment configured with URL `http://localhost/`.
- Produces: a working global `localStorage` before i18n initialization and before test module collection.

- [x] **Step 1: Reproduce the existing collection failure**

Run:

```bash
pnpm test
```

Expected RED on Node 26: seven suites fail before collecting tests with `Cannot read properties of undefined (reading 'getItem')` from `detectLanguage`.

- [x] **Step 2: Bind jsdom storage before importing i18n**

Replace the static i18n side-effect import with setup ordering equivalent to:

```ts
import { beforeEach } from 'vitest';

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: window.localStorage,
});

await import('@/shared/i18n');
```

Keep the existing `AudioContext` stub and `beforeEach(() => localStorage.clear())` after this initialization.

- [x] **Step 3: Verify ordinary execution without Node flags**

Run:

```bash
pnpm test
npx eslint --fix test/setup.ts
```

Expected GREEN: 7 test files and 18 tests pass without `NODE_OPTIONS` and without ExperimentalWarning noise.

### Task 2: Make Password-Recovery Parameters Consistent

**Files:**

- Create: `src/pages/auth/forget-password/model/params.ts`
- Modify: `src/pages/auth/forget-password/ForgetPasswordPage.tsx`
- Modify: `src/pages/auth/forget-password/VerifyCodePage.tsx`
- Modify: `src/pages/auth/forget-password/ResetPage.tsx`
- Create: `test/pages/auth/forget-password-params.test.ts`

**Interfaces:**

- Produces: `buildVerifyCodePath(email: string): string`, `buildResetPath(params: { captcha: string; email: string }): string`, and `readPasswordRecoveryParams(searchParams: URLSearchParams): { captcha: string; email: string }`.

- [x] **Step 1: Write the failing URL-contract test**

The test must round-trip Unicode and `+` characters through both navigation steps:

```ts
const email = '鲸浪+test@example.com';
const verifyUrl = new URL(buildVerifyCodePath(email), 'https://example.test');
expect(readPasswordRecoveryParams(verifyUrl.searchParams).email).toBe(email);

const resetUrl = new URL(buildResetPath({ captcha: '123456', email }), 'https://example.test');
expect(readPasswordRecoveryParams(resetUrl.searchParams)).toEqual({
  captcha: '123456',
  email,
});
```

Run `pnpm test test/pages/auth/forget-password-params.test.ts` and confirm RED because the module does not exist.

- [x] **Step 2: Implement one query-string contract**

Use `URLSearchParams` in `params.ts`; the only accepted keys are `email` and `captcha`. Both builders return the existing hash-router-relative paths beginning with `/forget-password/`.

- [x] **Step 3: Migrate all three pages**

The first page uses `buildVerifyCodePath`, the verification page reads with `readPasswordRecoveryParams` and navigates with `buildResetPath`, and the reset page uses the same reader. Missing email on the verification page, or missing email/captcha on the reset page, navigates to `/forget-password` with `replace: true`. Separate numeric back navigation from string navigation so no `as any` remains.

- [x] **Step 4: Verify the contract and touched pages**

Run:

```bash
pnpm test test/pages/auth/forget-password-params.test.ts
npx eslint --fix src/pages/auth/forget-password/model/params.ts src/pages/auth/forget-password/ForgetPasswordPage.tsx src/pages/auth/forget-password/VerifyCodePage.tsx src/pages/auth/forget-password/ResetPage.tsx test/pages/auth/forget-password-params.test.ts
pnpm lint:type
```

Expected GREEN: the new test passes and TypeScript exits 0.

### Task 3: Make Async Detail Pages Safe

**Files:**

- Modify: `src/pages/invoice/ui/InvoiceInfoForm.tsx`
- Create: `test/pages/invoice/invoice-info-form.test.ts`
- Modify: `src/pages/record/editing/EditingPage.tsx`
- Modify: `src/app/router.tsx`
- Create: `test/pages/record/editing/editing-page.test.ts`

**Interfaces:**

- Invoice form derives `isEdit = Boolean(id)` and `isDisabled = isEdit && isLoading` on every render.
- Record editing renders detail children only when a `RecordEntry` exists.

- [x] **Step 1: Add the failing invoice regression**

Mock the invoice query so the first render returns `{ data: undefined, isLoading: true }`, then rerender with a valid invoice and `isLoading: false`. Assert the form changes from disabled to enabled and submitting calls `patchInvoiceMutate` with the current `id` and values. Confirm RED because the current empty-dependency memo and stale callback remain locked to the first render.

- [x] **Step 2: Fix invoice derivation and callback dependencies**

Replace both empty-dependency memos with direct boolean expressions, memoize `formOptions` only if all dependencies are complete, and make `onSave` depend on `id`, `isDisabled`, both mutations, and `navigate`. Keep list/detail invalidation in the existing entity hooks.

- [x] **Step 3: Add failing record-detail state tests**

With no location state, verify three hook results:

- `{ data: undefined, isLoading: true, isError: false }` renders a loading indicator and no detail children.
- `{ data: undefined, isLoading: false, isError: true }` renders the existing `common:error.loadFail` message and no detail children.
- `{ data: record, isLoading: false, isError: false }` renders Top/List/Footer with that record.

Confirm RED because the existing page immediately renders all children with `undefined`.

- [x] **Step 4: Implement explicit record states and guard the route**

Use `RecordEntry` instead of the deprecated `recordChildren` type in the page. Prefer a valid location-state record while a refresh is in flight. Without a record, render centered `SpinLoading` or `ErrorBlock`; only success renders Top/List/Footer. Change `editing/:id` from `lazyPage` to `lazyGuardedPage`.

- [x] **Step 5: Verify both detail flows**

Run:

```bash
pnpm test test/pages/invoice/invoice-info-form.test.ts test/pages/record/editing/editing-page.test.ts
npx eslint --fix src/pages/invoice/ui/InvoiceInfoForm.tsx src/pages/record/editing/EditingPage.tsx src/app/router.tsx test/pages/invoice/invoice-info-form.test.ts test/pages/record/editing/editing-page.test.ts
pnpm lint:type
```

Expected GREEN: both new files pass and TypeScript exits 0.

### Task 4: Submit Complete Calculator Expressions

**Files:**

- Modify: `src/pages/record/bookkeeping/model/useCalculator.ts`
- Modify: `src/pages/record/bookkeeping/keyboard.tsx`
- Modify: `test/pages/record/bookkeeping/keyboard.test.ts`

**Interfaces:**

- `resolveAmount(): string | undefined` is the only page-level gate for a submitted amount.
- Incomplete expressions such as `1 +` remain non-submittable.

- [x] **Step 1: Add failing addition and subtraction tests**

Using the existing keyboard component test harness, click `1`, `+`, `2`, `=` and expect `postRecord` amount `3`. In a separate test click `5`, `-`, `3`, `=` and expect amount `2`. Confirm RED because `handleSubmit` currently returns before `resolveAmount()`.

- [x] **Step 2: Make resolution validate both normal and expression states**

For an operator expression, `resolveAmount` returns `undefined` unless `addNum` is a complete number; otherwise it computes through the existing cent-scaled `changePing` path. For a normal amount, it returns `undefined` unless existing `canSubmit()` rules pass. Update dependencies accordingly.

- [x] **Step 3: Use resolution as the page's single submit gate**

Remove the preceding `calc.canSubmit()` early return in `keyboard.tsx`; immediately return only when `calc.resolveAmount()` is `undefined`.

- [x] **Step 4: Verify calculator behavior**

Run:

```bash
pnpm test test/pages/record/bookkeeping/keyboard.test.ts
npx eslint --fix src/pages/record/bookkeeping/model/useCalculator.ts src/pages/record/bookkeeping/keyboard.tsx test/pages/record/bookkeeping/keyboard.test.ts
pnpm lint:type
```

Expected GREEN: existing keyboard tests plus addition and subtraction pass.

### Task 5: Isolate Development Instrumentation and Pin the Toolchain

**Files:**

- Modify: `vite.config.ts`
- Modify: `package.json`
- Modify: `Dockerfile`
- Modify: `pnpm-workspace.yaml`

**Interfaces:**

- Vite dev server keeps React Dev Inspector behavior.
- Vite production builds contain no Inspector source-coordinate attributes.
- Local, CI, and Docker use pnpm `10.34.3`; Docker uses Node `24.15.0` and a frozen lockfile.

- [x] **Step 1: Capture the production leakage**

Run `pnpm build` and then:

```bash
rg -n "data-inspector-relative-path" dist/assets
```

Expected RED: at least one built JavaScript asset contains the attribute.

- [x] **Step 2: Restrict Inspector and restore the browser target**

Use `defineConfig(({ command }) => ...)`; include `inspectorServer()` and the Inspector Babel plugin only when `command === 'serve'`. Remove `build.target: 'esnext'` so Vite 8 uses `baseline-widely-available`. Keep React, HTML injection, aliases, Sass data, proxy, manifest, and CSS splitting unchanged.

- [x] **Step 3: Pin pnpm and make Docker installation reproducible**

Add `"packageManager": "pnpm@10.34.3"`. Change `build:docker` to `tsc -b && vite build --mode docker`. Use `FROM node:24.15.0-alpine`, install `pnpm@10.34.3`, copy `pnpm-workspace.yaml` with the manifest/lockfile, and run `pnpm install --frozen-lockfile`. Remove the non-boolean `electron` line from `allowBuilds`.

- [x] **Step 4: Verify config and production output**

Run:

```bash
npx eslint --fix vite.config.ts
pnpm lint:type
pnpm build
pnpm build:docker
test -z "$(rg -l 'data-inspector-relative-path' dist/assets || true)"
git diff --check
```

Expected GREEN: both builds exit 0 and the Inspector attribute check has no output.

### Task 6: Full Quality Gate and Audit Handoff

**Files:**

- Inspect: all files changed by Tasks 1-5
- Modify: this plan only to mark completed checkboxes and append measured verification evidence.

**Interfaces:**

- Produces: fresh evidence for every configured quality gate and an explicit remaining-risk handoff.

- [x] **Step 1: Run the complete gate from a clean dependency graph**

Run:

```bash
CI=true pnpm install --frozen-lockfile
pnpm lint:type
pnpm lint
pnpm test
pnpm build
pnpm build:docker
git diff --check
```

Expected: every command exits 0; lint warning count is at most 82; all tests pass without Node flags.

- [x] **Step 2: Check repository hygiene and production instrumentation**

Run:

```bash
git ls-files 'dist/**' '*.tsbuildinfo' 'coverage/**'
rg -n "data-inspector-relative-path" dist/assets || true
git status --short
```

Expected: no tracked build artifacts, no Inspector attributes, and only the planned source/test/config/docs changes are present before the final commit.

- [x] **Step 3: Record measured results**

Mark completed task checkboxes and append exact file/test/warning counts. Keep unresolved security, dependency, FSD, ErrorBoundary, warning cleanup, and accessibility work listed in the design document as future batches; do not claim they were fixed.

## Verification Evidence — 2026-07-19

Baseline: `dd54e93` (`build(client): stabilize production toolchain`). Tasks 1–5 changed 21 files: 15 source/configuration files, 5 test files, and 1 task report. This task adds this tracked evidence record only; `.superpowers/sdd/task-6-report.md` is an ignored external review artifact and is not part of this commit.

| Command | Result | Measured evidence |
| --- | --- | --- |
| `CI=true pnpm install --frozen-lockfile` | exit 0 | Lockfile already current; pnpm `10.34.3`. |
| `pnpm lint:type` | exit 0 | `tsc -b --noEmit` completed without diagnostics. |
| `pnpm lint` | exit 0 | 0 errors, 71 warnings (below the 82-warning ceiling). |
| `pnpm test` | exit 0 | 10 test files passed; 27 tests passed; no Node flags. |
| `pnpm build` | exit 0 | Production Vite 8 build completed; 5,610 modules transformed. |
| `pnpm build:docker` | exit 0 | Docker-mode Vite build completed; 5,610 modules transformed. |
| `git diff --check` | exit 0 | No whitespace errors. |
| `git ls-files 'dist/**' '*.tsbuildinfo' 'coverage/**'` | exit 0 | No tracked build, TypeScript, or coverage artifacts. |
| `rg -n "data-inspector-relative-path" dist/assets \|\| true` | exit 0 | No production Inspector attributes found. |
| `git status --short` | exit 0 | No output before Task 6 documentation edits. |

Remaining risks are intentionally deferred to future batches: the dependency/security audit and upgrades, FSD dependency-direction follow-up, an application-level `ErrorBoundary`, the remaining ESLint-warning cleanup, and accessibility work. The 71 warnings recorded here are not claimed resolved; the Vite builds also retain their existing large-chunk advisory.

# Task 3: Make Async Detail Pages Safe

## RED

Added the two requested regression files before production changes:

- `test/pages/invoice/invoice-info-form.test.ts`
  - Starts an invoice edit query with no data and `isLoading: true`, then rerenders with an invoice and `isLoading: false`.
  - Asserts that the form becomes enabled and that submit calls the patch mutation with the current invoice id and edited values.
  - Against baseline `16bbd74`, this failed at the enabled assertion: expected `false`, received `true`.
- `test/pages/record/editing/editing-page.test.ts`
  - Covers no-location-state loading, error, and successful record-detail rendering.
  - Against baseline `16bbd74`, loading failed because no loading indicator rendered; error failed because `common:error.loadFail` did not render. The existing page also mounted all three detail children with `undefined` state.

Initial RED command:

```bash
pnpm test test/pages/invoice/invoice-info-form.test.ts test/pages/record/editing/editing-page.test.ts
```

Result: 3 failures / 4 tests. The invoice failure was the stale disabled memo; the two record failures were the missing async states.

## GREEN

- `src/pages/invoice/ui/InvoiceInfoForm.tsx`
  - Derives `isEdit` and `isDisabled` each render.
  - Makes `onSave` depend on the current id, disabled state, both mutations, and navigation callback.
  - Removes the existing non-null query-param assertion and completes the form effect dependency list.
- `src/pages/record/editing/EditingPage.tsx`
  - Uses `RecordEntry`, accepts only record-shaped location state, and continues to query the latest record.
  - Shows centered `SpinLoading` while no record is available during load; otherwise shows `common:error.loadFail` in `ErrorBlock` when no record is available.
  - Renders Top/List/Footer only once a record exists; route-state data remains immediately usable while the refresh is pending.
- `src/app/router.tsx`
  - Guards `editing/:id` with `lazyGuardedPage`.

## Verification

Fresh GREEN checks:

```bash
pnpm test test/pages/invoice/invoice-info-form.test.ts test/pages/record/editing/editing-page.test.ts
# 2 files passed, 4 tests passed

npx eslint --fix src/pages/invoice/ui/InvoiceInfoForm.tsx src/pages/record/editing/EditingPage.tsx src/app/router.tsx test/pages/invoice/invoice-info-form.test.ts test/pages/record/editing/editing-page.test.ts
# no lint diagnostics (npm emitted unrelated existing user-config deprecation warnings)

pnpm lint:type
# exited 0

git diff --check
# exited 0
```

## Self-review

- Scoped changes to the five requested source/test files plus this report.
- Preserved existing entity-hook query invalidation, public page APIs, hash routing, and FSD import structure.
- Added no `any`, non-null assertions, or ESLint disables.
- Verified the form transition and real submitted patch payload; verified no detail child renders for missing-record loading/error states and all children render for success.

## Review follow-up

### RED

- Stabilized both invoice mutation mocks with `vi.hoisted`, then changed the form rerender from `invoice-7` to `invoice-9`. The save assertion now proves the live callback submits the new id while mutation identities stay stable.
- Added a route-state regression that renders a valid `RecordEntry` immediately while the query is loading, then rerenders with a refresh error and keeps the same detail children visible.
- Added a malformed route-state regression using `category: null`. Before the guard change, the targeted suite failed at the expected `ErrorBlock` assertion because the shallow guard accepted the malformed value and rendered detail children.

### GREEN

- Replaced the shallow `isRecordEntry` check with structural validation for every required record field, both allowed `type` values, optional `status`, and every nested category field. Arrays, null, missing fields, and wrong field types are rejected without assertions or `any`.

### Verification

```bash
pnpm test test/pages/invoice/invoice-info-form.test.ts test/pages/record/editing/editing-page.test.ts
# 2 files passed, 6 tests passed

npx eslint --fix src/pages/record/editing/EditingPage.tsx test/pages/invoice/invoice-info-form.test.ts test/pages/record/editing/editing-page.test.ts

pnpm lint:type

git diff --check
```

# `/detail` Ledger Switcher Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore only `/detail` to its centered switchable title, right-side search/calendar actions, and original three-item shortcut card.

**Architecture:** Keep `RecordOverviewHeader`, household pages, and custom-ledger pages unchanged. Reconfigure the personal detail adapter in `Top.tsx` to reuse the existing preference-gated `LedgerTitleSwitcher`, and freeze that page-specific contract in the existing workspace integration test.

**Tech Stack:** React 18, TypeScript, React Router 6, Ant Design Mobile 5, Vitest, jsdom

## Global Constraints

- Modify only the `/detail` adapter and its targeted test.
- Do not modify `RecordOverviewHeader` or any household/custom-ledger page.
- Keep the existing `isLedgerQuickSwitchEnabled` gate inside `LedgerTitleSwitcher`.
- Preserve current month, amount visibility, record list, and bottom navigation behavior.

---

### Task 1: Restore the personal detail header composition

**Files:**
- Modify: `test/pages/ledger/ledger-workspace-navigation.test.ts`
- Modify: `src/pages/record/detail/Top.tsx`

**Interfaces:**
- Consumes: `LedgerTitleSwitcher`, `RecordOverviewHeaderProps`, existing search/calendar navigation callbacks, and existing shortcut descriptors.
- Produces: the unchanged `useRecordOverviewHeader(options): RecordOverviewHeaderProps` adapter contract.

- [x] **Step 1: Write the failing integration assertions**

Update the `/detail` integration case so it requires a switcher button in the centered title slot, requires the search/calendar controls to be direct header actions, and requires exactly the original three shortcuts:

```ts
const title = container.querySelector('[data-testid="ledger-switcher-title"]');
const searchAction = container.querySelector('[data-testid="record-search-action"]');
const calendarAction = container.querySelector('[data-testid="record-calendar-action"]');
const shortcutButtons = header?.querySelectorAll('nav button') ?? [];

expect(title?.tagName).toBe('BUTTON');
expect(title?.className).toContain('left-1/2');
expect(title?.className).not.toContain('text-left');
expect(searchAction?.parentElement).toBe(calendarAction?.parentElement);
expect(searchAction?.parentElement?.parentElement).toBe(header);
expect(shortcutButtons).toHaveLength(3);
expect(Array.from(shortcutButtons).map(button => button.textContent)).toEqual([
  'bill:title',
  'budget:title',
  'common:commonFunctions.assetSteward',
]);
```

Use the existing action test IDs and scope the shortcut query to the existing header `nav`. Do not change the shared component solely to add selectors.

- [x] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm test test/pages/ledger/ledger-workspace-navigation.test.ts
```

Expected: the `/detail` case fails because the current title is an `H1`, the search/calendar controls are in the five-item shortcut card, and the shortcut card does not contain the original three-item set.

- [x] **Step 3: Restore the minimal `/detail` adapter configuration**

In `src/pages/record/detail/Top.tsx`:

```tsx
import { CalendarDays, Eye, EyeOff, Search } from 'lucide-react';
import { LedgerTitleSwitcher } from '@/features/ledger-switcher';

return {
  actions: (
    <>
      <button aria-label={t('search.title')} className="border-0 bg-transparent p-0" data-testid="record-search-action" onClick={handleSearch} type="button">
        <Search size={18} strokeWidth={2} />
      </button>
      <button aria-label={t('calendar.title')} className="border-0 bg-transparent p-0" data-testid="record-calendar-action" onClick={handleCalendar} type="button">
        <CalendarDays size={18} strokeWidth={2} />
      </button>
    </>
  ),
  renderTitle: className => <LedgerTitleSwitcher className={className} />,
  shortcuts: [
    {
      icon: <Icon name="bill" />,
      key: 'bill',
      label: t('bill:title'),
      onClick: () => navigate(ROUTES_PATH.BILL.getPath()),
    },
    {
      icon: <Icon name="budget" />,
      key: 'budget',
      label: t('budget:title'),
      onClick: () => navigate(ROUTES_PATH.BUDGET.getPath()),
    },
    {
      icon: <Icon name="asset-steward" />,
      key: 'asset-steward',
      label: t('common:commonFunctions.assetSteward'),
      onClick: () => navigate(ROUTES_PATH.ASSET.getPath()),
    },
  ],
};
```

Remove `config`, `Settings`, the search/calendar shortcut descriptors, and `titleAlignment: 'start'`. Keep all unrelated month and amount code byte-for-byte where practical.

- [x] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
pnpm test test/pages/ledger/ledger-workspace-navigation.test.ts test/features/ledger-switcher-header.test.ts
```

Expected: both files pass, proving the restored `/detail` composition and the preference-gated switcher behavior.

- [x] **Step 5: Run formatting, type, regression, and build checks**

Run:

```bash
npx eslint --fix src/pages/record/detail/Top.tsx test/pages/ledger/ledger-workspace-navigation.test.ts
pnpm lint:type
pnpm test
pnpm build
git diff --check
```

Expected: every command exits successfully with zero test failures and no whitespace errors.

- [x] **Step 6: Verify `/detail` visually and interactively**

Start the app with the repository's `pnpm dev` script, open `/detail` in a mobile-width browser, and verify both states:

1. Quick switch enabled: centered title with arrow opens the existing top popup; search/calendar remain at the upper right; shortcut card has three items.
2. Quick switch disabled: centered title is static without an arrow; the rest of `/detail` is unchanged.

Confirm the browser console has no new errors. Do not alter household or custom-ledger pages.

- [x] **Step 7: Commit and push**

```bash
git add src/pages/record/detail/Top.tsx test/pages/ledger/ledger-workspace-navigation.test.ts docs/superpowers/plans/2026-08-05-detail-ledger-switcher-restoration.md
git commit -m "fix(client): restore detail ledger switcher header"
git push origin feat/admin-base
```

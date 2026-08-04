# Scoped-ledger default-page presentations

Household and scoped-ledger record detail, record search, and budget routes reuse
the personal ledger's presentation seams. Page adapters continue to own their
queries, routes, mutations, URL filters, capabilities, and scope validation.

The customer-facing family/custom-ledger workspace uses the
`/ledgers/:ledgerId/...` route family. Its detail, search, and budget adapters are
`LedgerRecordDetailPage`, `LedgerRecordSearchPage`, and `LedgerBudgetPage`.
The older `/households/:householdId/...` route family uses the same seams but is
not the primary ledger workspace.

## Records overview

`entities/record/ui/RecordOverviewHeader` and `RecordOverviewList` own the
shared overview geometry used by personal, household, and custom-ledger record
pages. The header reserves separate title, period/metric, and shortcut rows so a
two-line household title cannot overlap the current month or totals.

`LedgerRecordsPage` uses the household-style current-month overview instead of
its former search-bar list. It retains ledger-scoped routing and capability
checks while reusing the same month selector, income/expense placement,
budget/search/calendar/settings shortcuts, compact date groups, category icons,
and amount privacy preference. Search remains available through the dedicated
ledger search route.

## Record detail

`entities/record/ui/RecordDetailPresentation` owns the category header, detail
rows, optional pin, and optional fixed actions. Its optional props default to the
personal `/editing/:id` presentation.

Household detail keeps the personal share pin and owner edit/delete footer,
then extends the row list with member, tag, counted, and clickable policy
fields. Scoped-ledger detail supplies capability-controlled edit/delete actions
and an optional family-policy row. Their routes own a
persistent `NavBar` outside both scope and record query states, and opt out of
the presentation's default navigation through `showNavigation={false}`. This
keeps loaded geometry aligned while retaining back navigation during loading,
error, and invalid-route states. The category block starts below the navigation
bar rather than using a negative offset into it.

## Record search

`shared/ui/record-search-header` owns both the fixed primary search header and
the page shell used by personal, household, and scoped-ledger search. Household
keyword and advanced fields remain URL search params. The route scope boundary
wraps query-backed results and the filter popup, while the shared header remains
available during scope failures.

Personal and household search results use `RecordOverviewList`'s default
geometry, which preserves the original personal record row dimensions. Household
home and calendar surfaces explicitly select the compact variant. Selection is
routed with the matching household or ledger detail route helper, which encodes
the scope ID before navigation.

## Budget

Budget presentation ownership and amount-percentage normalization are documented
in [budget-presentation.md](budget-presentation.md). The household period
dropdown is route chrome and remains outside scope states. Personal, household,
and scoped-ledger budget routes use `BudgetPageShell` for the same root geometry,
scrolling behavior, dropdown popup position, and third-party component
overrides. Scoped-ledger budget mutations and read-only behavior remain
capability-aware. Personal and scoped-ledger adapters preserve the personal
summary-first empty state, and the household adapter uses that same full-page
empty presentation before a summary budget exists. The household route uses the
same two-item month/year period dropdown as the personal budget route and derives
the active current-month or current-year API period without adding a separate
date selector.

The shared detail, overview-header, search, and budget presentation paths use
Tailwind utilities. Their previous CSS Modules were removed; third-party
selectors are expressed as scoped Tailwind arbitrary variants on the owning
component.

The React component inspector and React Query Devtools are disabled by default
because their floating launchers obscure mobile navigation and can be mistaken
for application icons. Local development can opt in with
`VITE_ENABLE_INSPECTOR=true` and `VITE_ENABLE_QUERY_DEVTOOLS=true`.

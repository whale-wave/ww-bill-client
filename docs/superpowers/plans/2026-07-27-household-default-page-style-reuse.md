# Household Default Page Style Reuse Plan

## Context

The household home, calendar, and charts already reuse the default ledger's
record-overview, calendar, and chart presentation seams. The household record
detail, search/records, and budget routes still use separately designed layouts
that do not match their default-ledger counterparts.

The default-ledger routes are the compatibility baselines:

- `/editing/:id` for record detail presentation.
- `/search-record` for search header, page rhythm, loading/empty states, and
  grouped result presentation.
- `/budget` for the budget period selector, summary/category budget rows,
  empty/loading states, edit affordances, and fixed add action.

The household counterparts are:

- `/households/:householdId/records/:recordId`.
- `/households/:householdId/records/search` and
  `/households/:householdId/records`.
- `/households/:householdId/budgets`.

Household settings, invitations, members, policy editing, and export do not have
equivalent default-ledger pages and are outside this visual-parity change.

## Global Constraints

- Household pages with a default-ledger counterpart must reuse the original
  default-ledger presentation components and visual hierarchy; do not maintain
  parallel markup that merely imitates them.
- The default-ledger routes `/editing/:id`, `/search-record`, `/detail`, and
  `/budget` are compatibility baselines. Their visible structure, spacing,
  styling, navigation, query behavior, and mutations must remain unchanged.
- When household data needs more fields, extend shared presentation components
  through optional typed props or slots whose defaults preserve the personal
  route exactly.
- Preserve household-scoped routes, URL filters, pagination, query keys,
  loading/error/empty states, owner-only policy action, native share behavior,
  optimistic version handling, conflict refresh behavior, and translations.
- Use existing Ant Design Mobile controls, `var(--ww-theme-color)` /
  `bg-primary`, the shared `Icon`, existing Tailwind/Sass tokens, and the
  small-radius mobile layout from `DESIGN.md`. Do not add a new visual system,
  icon library, font, brand color, large-radius card family, or decorative
  animation.
- Keep FSD import direction `app → pages → widgets → features → entities →
  shared`; shared record and budget presentation code must not import household
  page state, household hooks, or household routes.
- Existing household home, calendar, and chart alignment must remain intact.
- Follow TDD for each task. Run focused tests, ESLint on every changed code
  file, `pnpm lint:type`, `pnpm lint`, and the full `pnpm test` suite before
  completion.

## Task 1: Reuse the default record-detail presentation

Make the household record detail route use the original `/editing/:id` visual
structure rather than its separately designed hero/card/button layout.

Requirements:

1. Add failing tests first for a shared detail-presentation seam and both
   adapters. Cover that the personal route keeps its existing back behavior,
   category icon/name header, detail rows, share pin, and edit/delete footer.
2. Move the smallest presentation-only pieces from
   `pages/record/editing` into a dependency-safe record UI seam. The personal
   `EditingPage` remains the behavioral owner of personal queries, navigation,
   share, edit, and delete.
3. Render household detail with the same NavBar/header/list/fixed-action
   geometry, typography, borders, icon rendering, and page background as the
   personal detail baseline.
4. Extend the shared detail presentation only with optional inputs needed by
   household records: member attribution, tags, counted/policy status, and an
   optional action set. These inputs must not change personal defaults.
5. Preserve household behavior: invalid/loading/error handling, native share,
   owner-only policy action, encoded household routes, and no edit/delete
   controls for family records.
6. Remove the household-only primary-color hero, large rounded detail card,
   and standalone two-column action grid.

Acceptance criteria:

- Comparing the loaded pages at mobile width, household detail visibly uses the
  original `/editing/:id` structure and controls.
- Household-only values appear as additional rows/actions without changing the
  personal detail page.

## Task 2: Reuse the default record-search and record-list presentation

Make household search and the standalone household records surface use the
default search/list presentation while preserving the household's additional
filters.

Requirements:

1. Add failing tests first for a shared search header and result-list seam.
   Cover unchanged personal auto-focus, cancel/back behavior, `q` URL state,
   loading/empty states, and record navigation.
2. Extract the default `/search-record` fixed primary-color SearchBar header
   into a dependency-safe component with optional typed additions. Personal
   defaults must render unchanged.
3. Use that same header on household search. Keep `keyword` and all existing
   household filter values in URL search params. Put household-only advanced
   filters behind an optional Ant Design Mobile filter control/panel that uses
   existing form controls; do not keep the current always-visible bespoke card
   as the page's primary visual.
4. Render household search results through the shared
   `RecordOverviewList` geometry used by the default ledger: date groups,
   55px rows, shared category icons, neutral amount styling, and thin
   separators. Member, tags, and policy stay in the optional secondary line.
5. Make `/households/:householdId/records` use the same shared grouped list
   presentation and retain its month control, summary, pagination, search
   navigation, and detail navigation.
6. Preserve decoded household IDs, query enabling, pagination, loading/error/
   empty behavior, filter parsing, and translations.

Acceptance criteria:

- Household search begins with the same primary SearchBar header and result
  rhythm as `/search-record`; advanced household fields are available without
  defining a second visual system.
- Both household search and records routes use the shared category icon and
  grouped record-row presentation.

## Task 3: Reuse the default budget presentation

Make the household budget route use the original `/budget` presentation while
keeping household APIs and conflict/version semantics.

Requirements:

1. Add failing tests first for the shared budget-presentation seam. Cover the
   unchanged personal month/year dropdown, summary/category rows, empty state,
   edit actions, and fixed category-add action.
2. Generalize the smallest existing budget UI components so the visual layer
   accepts a typed view model and callbacks. The default budget page remains
   the owner of its existing query/mutations/context and must render unchanged.
3. Adapt household budget summary and category progress into the shared
   summary/category row geometry, ring chart, labels, period dropdown, loading/
   empty states, edit affordances, and fixed add-category action used by
   `/budget`.
4. Household-only inputs use the existing Ant Design Mobile modal/action-sheet
   interaction pattern rather than inline bespoke forms. Category selection
   may be an optional modal field; its absence must leave the personal modal
   unchanged.
5. Preserve household month/year and `periodStart` behavior, available-category
   filtering, create/edit/delete operations, optimistic versions, `409`
   refetch behavior, loading state, encoded household scope, and translations.
6. Remove the household-only segmented card, standalone month input, CSS
   conic-gradient progress ring, large rounded summary/category cards, and
   inline total/category forms.

Acceptance criteria:

- At mobile width, the loaded household budget page has the same period
  selector, budget rows, empty/loading states, edit flow, and bottom action
  rhythm as `/budget`.
- Household-specific data and mutations work without any visible or behavioral
  regression on the personal budget route.


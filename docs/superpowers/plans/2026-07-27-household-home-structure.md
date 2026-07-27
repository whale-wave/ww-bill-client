# Household Home Structure Plan

## Context

The current household home separates the title, month picker, action menu, summary card, record count, and flat record list into stacked blocks. The requested design should reuse the information hierarchy of the default ledger home while keeping the household-specific differences shown in the reference: a left-aligned household title, no back button, household settings access, household member attribution, sharing-policy context, and the two-tab household bottom navigation.

## Reference Artifacts

- Household target reference: `/var/folders/5n/crtch6xd5c92y1btkbff6pk00000gn/T/codex-clipboard-ee2ef82f-ef2e-4293-9c22-3fe76afb5618.png`
- Default ledger reference: `/var/folders/5n/crtch6xd5c92y1btkbff6pk00000gn/T/codex-clipboard-59c89db5-0c40-4ed9-9de0-62298ad84c1a.png`
- Current household implementation: `/var/folders/5n/crtch6xd5c92y1btkbff6pk00000gn/T/codex-clipboard-60da2f6c-2966-4e40-a9f8-9a6897f45974.png`

## Global Constraints

- Match the default ledger home's hierarchy: title/actions, month plus monthly income/expense, floating shortcut card, date-grouped record list, fixed bottom navigation.
- Preserve household-specific differences: the title is left aligned, the home has no back button, settings remains directly accessible, record rows retain member attribution and sharing-policy meaning, and the bottom navigation remains the existing household two-tab navigation.
- Use the existing `var(--ww-theme-color)` / `bg-primary`, gray scale, typography, icon system, small-radius card treatment, and mobile spacing from `DESIGN.md`; do not introduce a new theme, font, icon library, large-radius card system, or decorative animation.
- Keep the existing month filtering, household-scoped routes, record detail navigation, pagination, loading/error/empty states, query behavior, and translations working.
- Avoid raw category icon identifiers in the UI; category icons must render through the existing shared SVG icon component and stay inside their circular container.
- Other household record surfaces must keep their existing summary and list behavior unless an explicit home-only option is enabled.
- Follow TDD for the new home structure and home-only grouped-list behavior.

## Task 1: Align the household home with the default ledger structure

Update the household home and the smallest necessary household presentation components.

Requirements:

1. Add or update tests first so they fail for the missing structure. Cover:
   - the household home header has a left-aligned title, no back action, a settings action, month controls, and monthly income/expense values;
   - the shortcut card contains budget, search, calendar, and settings actions and preserves their household-scoped routes;
   - the home record list is grouped by record date and each date header exposes that day's income/expense totals;
   - the home list uses the shared category icon component rather than displaying the raw icon identifier;
   - existing pagination and record-detail navigation remain intact.
2. Restructure `HouseholdHomePage` so the title/actions and monthly summary occupy one primary-color top region. Keep the title left aligned and do not add a back button. Month controls, income, and expense should read as one horizontal summary row similar to the default ledger home.
3. Place the four household shortcuts in one white floating card overlapping or immediately following the top region, then let the records begin without the current standalone summary card and centered record-count spacer.
4. Add a home-only grouped/compact presentation path to the household records UI:
   - group records by local calendar date in their current order;
   - show a light date header for each group, including daily income and/or expense totals when non-zero;
   - render compact rows with a bounded circular category icon, primary remark, household member/tags as secondary text, amount aligned right, and a concise sharing-policy indication without increasing the row back to the current oversized card layout;
   - keep record IDs as stable keys and preserve selection behavior.
5. Keep non-home usages of `HouseholdRecordsPanel` compatible and visually unchanged by default.
6. Reuse existing translations and add localized strings only where the new date-group header requires them.
7. Run the focused household page tests, ESLint on every changed code file, `pnpm lint:type`, `pnpm lint`, and the full `pnpm test` suite. Commit the implementation and write the required report.

Acceptance criteria:

- At mobile width, the household home visibly follows the same structural rhythm as the default ledger home and the household target reference.
- The title and monthly figures are no longer split across a large hero plus a separate summary card.
- The records are scannable by day, no raw icon names overflow their circles, and the last content remains clear of the fixed bottom navigation.
- Household-specific navigation and data behavior remain unchanged.

## Shared record-overview seam

The personal detail home and household home use the same record-overview modules rather than maintaining parallel markup:

- `RecordOverviewHeader` preserves the original personal `/detail` header geometry, full-width month hit target, amount-visibility control, and shortcut-card styling. Personal and household pages only provide title alignment, actions, period control, values, and shortcut data; household differences must not redefine the personal layout.
- `RecordOverviewList` preserves the original personal `/detail` date headers, 55px rows, typography, neutral amount color, and row interaction. Household records keep member/policy text as a compact secondary line without changing that shared row geometry or amount styling.
- `Top.tsx`, `List.tsx`, and `FamilyRecordList.tsx` remain adapters for their domain-specific state, routing, visibility, member attribution, and sharing-policy semantics.
- `HouseholdRecordsPanelContent` accepts the already-owned household records query on the home page; other household surfaces keep using `HouseholdRecordsPanel`, which owns its query internally.

This seam belongs to the record entity because both personal and household feature code consume it. It must not import page routing, household types, ledger queries, or translation hooks.

The personal `/detail` page is the compatibility baseline. Shared-component changes must keep its visible structure and behavior unchanged; new household requirements are implemented as optional inputs rather than as new defaults.

The household home adapts its month input to the personal detail trigger shape (`MM` + localized month label + triangle) while keeping its own native month value and household query filters.

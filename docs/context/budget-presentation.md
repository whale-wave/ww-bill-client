# Shared budget presentation

The personal `/budget` route defines the budget presentation baseline. Its
period dropdown, summary and category rows, ring chart, empty/loading states,
edit affordances, and fixed add-category action are shared from
`entities/budget/ui`.

The shared layer accepts `BudgetPresentationItem` view models and callbacks. It
does not own requests, routes, mutation state, or household types. Page adapters
remain responsible for those concerns:

- `/budget` keeps its context-driven period state, URL/category navigation, and
  existing personal query and mutations.
- `/households/:householdId/budgets` keeps household period dates, optimistic
  versions, available-category filtering, conflict refetches, and encoded
  household scope. Its amount/category editors use Ant Design Mobile
  ActionSheet and Modal interactions.

Household category identity is the category key. The current API has no
budget-ID-based move operation, so category selection is immutable while editing
an existing category budget. Edit payloads use the category name/icon snapshots
and optimistic version captured when the editor opens.

The personal API supplies `remainingPercentage` on a 0–100 scale. The household
API supplies `remainingPercent` as a 0–1 ratio, so the household page adapter
multiplies it by 100 before constructing the presentation view model.

The empty summary action renders its icon and label in one inline flex content
row. Its primary background is applied explicitly so the global Ant Design
Mobile button background override cannot turn the create action into an
outline-style control.

# Household default-page presentations

Household record detail, record search, and budget routes reuse the personal
ledger's presentation seams. Page adapters continue to own household queries,
routes, mutations, URL filters, and scope validation.

## Record detail

`entities/record/ui/RecordDetailPresentation` owns the category header, detail
rows, optional pin, and optional fixed actions. Its optional props default to the
personal `/editing/:id` presentation.

Household detail supplies member, tag, counted, and policy rows without adding
family edit/delete controls. Its route owns a persistent `NavBar` outside both
scope and record query states, and opts out of the presentation's default
navigation through `showNavigation={false}`. This keeps loaded geometry aligned
while retaining back navigation during loading, error, and invalid-route states.

## Record search

`shared/ui/record-search-header` owns the fixed primary search header used by
personal and household search. Household keyword and advanced fields remain URL
search params. The household scope boundary wraps query-backed results and the
filter popup, while the shared header remains available during scope failures.

Household results use `HouseholdRecordsPanel` and the shared grouped record-list
geometry. Selection is routed with `ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL`, which
encodes the household ID before navigation.

## Budget

Budget presentation ownership and amount-percentage normalization are documented
in [budget-presentation.md](budget-presentation.md). The household period
dropdown is route chrome and remains outside scope states.

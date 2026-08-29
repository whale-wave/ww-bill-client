# Personal monthly bill detail

## Scope

`/bill/:month`, `/ledgers/:ledgerId/bill/:month`, and `/households/:householdId/records/bill/:month` are read-only month-detail views for personal, shared-ledger, and household bill scopes. Every monthly row is interactive and uses the matching scope-specific detail request. Household aggregation includes only records that are counted by the existing household policy.

## Time and money contracts

The service reads the clock once and creates a single `MonthBillDetailRange` in `Asia/Shanghai`. Every interval is half-open (`[startInclusive, endExclusive)`) and is sent to PostgreSQL as a local wall-clock string for `timestamp without time zone`; SQL must use `CAST(:boundary AS timestamp)`. Current-month statistics end at Shanghai tomorrow 00:00, while historical months use the complete calendar month.

All monetary response fields are two-decimal decimal strings, rounded by the service with HALF_UP. Percentages are numbers rounded to one decimal place; charts use the amount value, never the rounded percentage. Invalid, malformed, or future months return `BILL_MONTH_INVALID` with HTTP 400.

## Query and aggregation rules

The `MonthBillDetailService` resolves the system-default ledger through `LedgerService.ensureSystemDefaultLedger()`. It must not access the ledger repository directly. Aggregation query count is constant (recommended maximum three), with no loops by date, month, category, or record and no full historical entity collection in Node.js. Valid records are non-deleted `add`/`sub` records. Streak days are computed in the database from distinct valid record dates and returned only as an integer.

## Client and export

The client cache keys are scope-specific below the personal, ledger, or household bill roots, so record mutations invalidate the matching bill data without cross-scope reuse. The page model aggregates categories after the fifth item under `aggregate:other`; the API never creates a virtual category.

Image export mounts a separate 375px `ExportRenderer`, creates new ECharts instances, waits for fonts, images, QR generation, and chart `finished` events, then captures the full-height panel with html2canvas. It must not clone screen DOM or reuse screen chart instances. `exportStatus` is the sole state source. `VITE_PUBLIC_APP_URL` is optional; absent or failed QR generation hides the QR and still exports the brand footer.

The export masthead freezes the best-effort user profile and translated masthead copy in the export snapshot. A remote avatar is decorative: a valid, decoded image is accepted; an empty URL, CORS failure, load failure, or decode failure commits a circular grapheme-safe initial fallback. Avatar readiness is session-scoped and is a capture barrier, but avatar failure never fails the export. The footer remains the only brand/QR area. Monthly screen charts opt out of the shared chart hook's default `touchmove.preventDefault()` and use `touch-action: pan-y`; offscreen export charts retain the default behavior.

## Maintenance notes

- Keep the static month-detail controller route before `:id`.
- Do not introduce a second “current time” read in repository or statistic helpers.
- If adding another export format, reuse the data model and add a renderer rather than cloning the screen DOM.
- TODO: When product work resumes on link sharing to WeChat, SMS, or other apps, define a share object, privacy/permission model, and landing page first. Do not restore the removed image-share implementation directly.

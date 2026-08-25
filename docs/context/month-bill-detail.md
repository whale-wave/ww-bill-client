# Personal monthly bill detail

## Scope

`/bill/:month` is a read-only detail view for the user's system-default personal ledger. Month rows in yearly views, ordinary ledgers, and household ledgers remain non-interactive. The detail request is `GET /record/bill/month-detail?month=YYYY-MM` and does not accept a ledger id.

## Time and money contracts

The service reads the clock once and creates a single `MonthBillDetailRange` in `Asia/Shanghai`. Every interval is half-open (`[startInclusive, endExclusive)`) and is sent to PostgreSQL as a local wall-clock string for `timestamp without time zone`; SQL must use `CAST(:boundary AS timestamp)`. Current-month statistics end at Shanghai tomorrow 00:00, while historical months use the complete calendar month.

All monetary response fields are two-decimal decimal strings, rounded by the service with HALF_UP. Percentages are numbers rounded to one decimal place; charts use the amount value, never the rounded percentage. Invalid, malformed, or future months return `BILL_MONTH_INVALID` with HTTP 400.

## Query and aggregation rules

The `MonthBillDetailService` resolves the system-default ledger through `LedgerService.ensureSystemDefaultLedger()`. It must not access the ledger repository directly. Aggregation query count is constant (recommended maximum three), with no loops by date, month, category, or record and no full historical entity collection in Node.js. Valid records are non-deleted `add`/`sub` records. Streak days are computed in the database from distinct valid record dates and returned only as an integer.

## Client and export

The client cache key is `['record', 'bill', 'month-detail', month]`, nested below `recordKeys.bills()`, so record mutations invalidate it with other personal bill data. The page model aggregates categories after the fifth item under `aggregate:other`; the API never creates a virtual category.

Image export mounts a separate 375px `ExportRenderer`, creates new ECharts instances, waits for fonts, images, QR generation, and chart `finished` events, then captures the full-height panel with html2canvas. It must not clone screen DOM or reuse screen chart instances. `exportStatus` is the sole state source. `VITE_PUBLIC_APP_URL` is optional; absent or failed QR generation hides the QR and still exports the brand footer.

## Maintenance notes

- Keep the static month-detail controller route before `:id`.
- Do not introduce a second “current time” read in repository or statistic helpers.
- Keep household and ordinary-ledger bill flows unchanged.
- If adding another export format, reuse the data model and add a renderer rather than cloning the screen DOM.

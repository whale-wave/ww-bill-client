# Shared record editor

The default, custom-ledger, and household-originated record flows use one
`RecordEditorPresentation` and `useRecordEditorController`.

## Boundaries

- The shared editor owns the income/expense tabs, category grid, note and
  amount row, date picker, calculator keypad, validation, and single-flight
  submission state.
- Page adapters own queries, mutations, permissions, success/error messages,
  optimistic versions, and navigation.
- Custom-ledger tags are an optional first-class editor capability. Adapters
  must omit `tagIds` when the member cannot read tags so an update cannot clear
  tags the member was not allowed to load.
- Household pages do not have a record write API. They open the personal
  editor with a discriminated return context, write the current user's default
  ledger, and return to the originating household calendar or detail.

## Date and return compatibility

- `selectTime` is the canonical calendar-to-editor date parameter.
- Household calendars still read the legacy `month=YYYY-MM-01` parameter and
  replace it with `selectTime` on the next date change.
- Personal editing still accepts the legacy raw `RecordEntry` router state.
  New household navigation uses `RecordEditorLocationState`.
- Return targets are a closed `RecordEditorReturnContext` union. Do not replace
  it with an arbitrary return URL.

## Cache contract

Personal record mutations invalidate personal records, bills, charts,
budgets, navigation counts, and household record/calendar/chart/budget
aggregates. Scoped record mutations invalidate the matching ledger's records,
charts, budgets, and navigation count where applicable.

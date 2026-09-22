# Record images and tags

The shared record editor offers ledger-wide multi-select tags (up to 20). The picker keeps a local draft with search, individual removal, clear, cancel and Done. Closing or cancelling does not submit changes. Returning from tag management restores the selected IDs. Existing archived tags remain visible and removable, but cannot be newly selected on unrelated records.

Category and income/expense changes preserve tags. One record still has one category: a root or one of its children. Root selection opens child choices and also offers direct entry into the root. The management page groups children under collapsible roots; movement uses a preview with affected record count before confirmation.

Tag rankings use full amounts per tag and a distinct scoped total. They render rows and progress bars with an overlap explanation, never a pie. Root classification statistics and budgets include child spending; direct root spending appears as 未细分. Household child totals come from the server before pagination.

Image selection uses a single hidden file input so it works in browsers and Capacitor WebViews without a native picker dependency. The editor uploads a temporary private asset before record submission and blocks completion during upload.

Record detail media is requested as an authenticated Blob. Object URLs are component-local and released when replaced or unmounted; record metadata contains only attachment IDs and hashes, never a storage URL. Tag charts use their own ranking payload and do not treat tags as categories.

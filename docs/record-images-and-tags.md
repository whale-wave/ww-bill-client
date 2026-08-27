# Record images and tags

The shared record editor is intentionally single-select for new tag choices. Existing multi-tag records retain their complete tag list until the user selects or clears a tag. Opening the picker or loading tags does not write `tagIds`.

Image selection uses a single hidden file input so it works in browsers and Capacitor WebViews without a native picker dependency. The editor uploads a temporary private asset before record submission and blocks completion during upload.

Record detail media is requested as an authenticated Blob. Object URLs are component-local and released when replaced or unmounted; record metadata contains only attachment IDs and hashes, never a storage URL. Tag charts use their own ranking payload and do not treat tags as categories.

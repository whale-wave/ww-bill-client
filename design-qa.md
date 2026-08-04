# Message and Join Request Design QA

## Evidence

- Source visual truth:
  - `/Users/avan/.codex/attachments/813644f1-e1d2-4f7a-8baf-f045e9524466/image-1.png`
  - `/Users/avan/.codex/attachments/813644f1-e1d2-4f7a-8baf-f045e9524466/image-2.png`
  - `/Users/avan/.codex/attachments/813644f1-e1d2-4f7a-8baf-f045e9524466/image-3.png`
  - `/Users/avan/.codex/attachments/813644f1-e1d2-4f7a-8baf-f045e9524466/image-4.png`
  - `/Users/avan/.codex/attachments/813644f1-e1d2-4f7a-8baf-f045e9524466/image-5.png`
  - `/Users/avan/.codex/attachments/813644f1-e1d2-4f7a-8baf-f045e9524466/image-6.png`
- Browser-rendered implementation screenshots:
  - `/tmp/ww-bill-design-qa.gJWYu4/message-implementation-final.png`
  - `/tmp/ww-bill-design-qa.gJWYu4/detail-initial-implementation-final.png`
  - `/tmp/ww-bill-design-qa.gJWYu4/detail-popup-implementation-centered.png`
  - `/tmp/ww-bill-design-qa.gJWYu4/detail-viewer-implementation-final.png`
  - `/tmp/ww-bill-design-qa.gJWYu4/detail-bookkeeper-implementation-final.png`
  - `/tmp/ww-bill-design-qa.gJWYu4/detail-admin-implementation-final.png`
- Same-canvas full-view comparisons:
  - `/tmp/ww-bill-design-qa.gJWYu4/compare-message-final.png`
  - `/tmp/ww-bill-design-qa.gJWYu4/compare-detail-initial-final.png`
  - `/tmp/ww-bill-design-qa.gJWYu4/compare-detail-popup-centered-final.png`
  - `/tmp/ww-bill-design-qa.gJWYu4/compare-detail-viewer-final.png`
  - `/tmp/ww-bill-design-qa.gJWYu4/compare-detail-bookkeeper-final.png`
  - `/tmp/ww-bill-design-qa.gJWYu4/compare-detail-admin-final.png`

## Normalization

- Reference pixels: `628 × 1398` for every source image.
- Reference phone-screen crop: `604 × 1306` from `(12, 75)`, normalized to `375 × 812` for comparison.
- Implementation viewport and screenshot: `375 × 812` CSS pixels, `deviceScaleFactor: 1`, rendered in the Codex in-app browser at `http://localhost:3233/`.
- Each comparison image is `750 × 812`: normalized reference on the left and implementation on the right.
- The reference device status bar, rounded phone frame, and home/device chrome are not app-owned surfaces and were excluded from mismatch severity. The intentional yellow-to-Whale-Wave-blue brand substitution was required by the user.
- State coverage: message item; role unselected; role picker; viewer; bookkeeper; administrator.

## Findings

No actionable P0, P1, or P2 mismatch remains.

- Fonts and typography: the implementation preserves the reference hierarchy of centered navigation title, compact row labels, secondary descriptions, and reduced metadata. Recent timestamps now read as past time (`4分钟前`) rather than future time.
- Spacing and layout rhythm: message metadata is stacked like the source; approval information rows, permission captions, vertical permission descriptions, popup height, and action-button spacing follow the normalized source proportions.
- Colors and tokens: reference yellow is intentionally mapped to `--ww-theme-color`; white surfaces, grey section backgrounds, separators, subdued secondary text, disabled states, and overlay opacity remain equivalent in role.
- Image quality and asset fidelity: the message item uses the supplied high-resolution Whale Wave app icon; applicant rows use the real API avatar when present and the existing theme-colored user fallback otherwise. No CSS art, emoji, placeholder raster, or handcrafted SVG replaces a source asset.
- Copy and content: all visible Chinese role names, explanations, permission groups, approval actions, and message action match the source meaning and approved product vocabulary.
- Icons: existing project and Ant Design Mobile icons provide the back, user, chevron, close, and selected states with consistent stroke weight.
- Accessibility and behavior: role choices are semantic options, the selected role is announced, approval is disabled until selection, controls retain focus treatment, and the popup supports mask/close behavior.

Focused-region comparison was necessary for the message metadata block, role-picker heading/options, permission-description wrapping, and bottom action spacing; those regions are visible in the six same-canvas comparisons above.

## Comparison History

### Iteration 1 — blocked

- P1: approval actions were fixed to the viewport bottom, while the source places them after the permission content with a consistent gap.
- P1: permission descriptions were right-aligned beside titles instead of stacked below them.
- P2: message time was right-aligned beside the title and the extra “全部已读” action changed the source header hierarchy.
- P2: the popup heading was left-aligned instead of centered.
- P2: recent notification time was rendered as future time.

### Fixes

- Moved the action group into document flow with the source-matched `56px` section gap.
- Changed permission rows to vertical title/description groups.
- Stacked message title/time, removed the extra main-header action, and retained notification management on the legacy notification-center route.
- Centered the popup heading.
- Corrected `showDate` direction and added a regression test.
- Replaced the transparent mascot crop with the supplied square Whale Wave application icon.

### Iteration 2 — passed

- Post-fix evidence: all six `*-final.png` comparisons listed above.
- No remaining P0/P1/P2 mismatch was found across typography, spacing, colors, imagery, copy, icons, or core interaction states.
- Browser console errors/warnings checked: none.
- Primary browser interactions tested: role popup open, close-by-selection, and viewer/bookkeeper/admin state transitions. Approval/ignore payload behavior and safe notification navigation are covered by focused automated tests to avoid mutating backend data during visual QA.

## Follow-up Polish

- P3: real applicant photos will naturally differ from the fixture fallback avatar used for browser capture; production rendering already consumes `request.applicant.avatar`.
- P3: device status-bar height and rounded phone frame differ because those belong to the reference emulator, not the web application.

final result: passed

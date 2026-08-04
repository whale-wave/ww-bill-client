# `/detail` Ledger Switcher Restoration Visual QA

Date: 2026-08-05

Browser: Codex in-app browser for unauthenticated routing check; authenticated Chrome tab for the rendered `/detail` state

Viewport: 372 × 666 CSS px, device scale factor 1

## Evidence

- Closed-state source visual truth: `/var/folders/hf/1k96vc9n0rb2lmlc91nb64mc0000gn/T/codex-clipboard-e129a5c9-10d8-4c61-80ad-e04fdffb5471.png`
- Popup-structure source visual truth: `/var/folders/hf/1k96vc9n0rb2lmlc91nb64mc0000gn/T/codex-clipboard-ded12c68-2aac-45df-930f-0631066ee177.png`
- Closed implementation screenshot: `/tmp/ww-bill-detail-switcher-closed.png`
- Open implementation screenshot: `/tmp/ww-bill-detail-switcher-open.png`
- Combined comparison input: `/tmp/ww-bill-detail-switcher-comparison.png`

The closed source and implementation are both 372 × 666 pixels and were compared at 1:1 density. The popup reference is 628 × 1398 pixels and includes a device frame; it was normalized to 372 × 666 only for structural comparison with the 372 × 666 implementation. Its yellow palette and device chrome are reference-product details, not Whale Wave targets.

## State and Interactions

- Quick switching was enabled in the authenticated runtime.
- The centered “鲸浪账本” title rendered as a button with a disclosure arrow.
- Keyboard activation opened the top popup and changed the trigger to its expanded state.
- The popup rendered “默认账本” first with 74 records and current-item semantics, followed by “公司账本”.
- “创建账本” and “账本管理” rendered side by side at the popup footer.
- Search and calendar remained direct top-right actions.
- The shortcut card contained only “账单”“预算”“资产管家”.
- The quick-switch-disabled static-title state remains covered by `test/features/ledger-switcher-header.test.ts` without changing the user preference during browser QA.
- Browser console check returned zero warnings and zero errors.

## Full-view Comparison

The combined comparison shows the original Whale Wave blue theme and spacing retained while applying the requested layout correction: the title is centered, search/calendar are at the upper right, and the shortcut card returns to three items. The open state follows the reference hierarchy—ledger rows, current selection, and two footer actions—while intentionally retaining Whale Wave colors and existing icons.

The authenticated Chrome screenshot contains third-party extension overlays on the far-right edge. They are not app-owned DOM, do not appear in tests or production code, and were excluded from app-level findings.

## Required Fidelity Surfaces

- Fonts and typography: existing system Chinese font stack, sizes, weights, amount styling, and truncation behavior are unchanged; the title inherits the shared header typography.
- Spacing and layout rhythm: the existing 182px header, statistics geometry, 68px shortcut card, and bottom navigation remain unchanged. Popup rows and two-column footer follow the existing switcher component.
- Colors and visual tokens: Whale Wave's `--ww-theme-color` blue remains authoritative. The reference app's yellow palette was not copied.
- Image quality and asset fidelity: no new raster imagery, CSS drawings, inline SVGs, or placeholder assets were introduced. Existing project and icon-library assets remain in use.
- Copy and content: “鲸浪账本”, “默认账本”, ledger name, record count, “创建账本”, and “账本管理” are correct. Search, calendar, bill, budget, and asset labels remain project-localized.

## Focused-region Comparison

A separate crop was not needed: at the 372px source width, the entire header and popup occupy the full screen width and remain legible in the full-view comparison. The DOM snapshot separately confirmed the popup's dialog/listbox/option semantics and expanded trigger state.

## Findings

- No actionable P0, P1, or P2 mismatch remains.
- P3 observation: keyboard activation shows the existing high-contrast focus outline on the selected ledger row. This is an intentional accessibility state and is not visible after ordinary pointer activation.

## Comparison History

- Pass 1: no P0/P1/P2 differences were found after normalizing the viewport and separating the blue-theme source from the popup-structure reference. No visual fix iteration was required.

## Implementation Checklist

- [x] Centered preference-gated ledger title on `/detail`.
- [x] Direct search and calendar actions at the upper right.
- [x] Three-item shortcut card restored.
- [x] Existing ledger popup structure and interaction retained.
- [x] Shared header, household pages, and custom-ledger pages unchanged.
- [x] Console checked with no warnings or errors.

final result: passed

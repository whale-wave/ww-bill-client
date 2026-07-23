# Ledger Management Visual QA

Date: 2026-07-23  
Viewport: 390 × 844  
Browser: Codex in-app browser  
Artifact root: `.superpowers/sdd/artifacts/ledger-management-qa`

## Method

Each required state was rendered from the real client against the disposable
Nest/PostgreSQL runtime. Reference screenshots were normalized to 390 × 844
and placed beside the implementation screenshots before judging differences.
The implementation intentionally uses the Whale Wave theme tokens and official
icon components instead of copying the competitor's yellow/blue brand palette.
Per the design specification, browser screenshots do not draw a device frame,
status bar, traffic lights, or Dynamic Island.

## Required States

| State | Evidence | Result |
|---|---|---|
| Two custom ledgers | `compare-management-two-ledgers.png` | Passed: two 107 × 146 cards, 20px page gutter, fixed create footer |
| Three ledgers with one shared | `compare-management-three-ledgers.png` | Passed: three-column layout, shared member badge, non-truncated titles |
| Sort mode | `compare-management-sort-mode.png` | Passed: three remove badges, fixed save action, fallback bottom spacing plus `SafeArea` |
| Empty join form | `compare-join-empty-final.png` | Passed: guided labels, official ADM inputs, 6-character code field, 1–30 character remark, disabled submit |
| Quick-switch enabled | `compare-preferences-enabled.png` | Passed: themed `NavBar`, official `List`/`Switch`, correct enabled state |
| Original records header | `.superpowers/sdd/ledger-title-switcher-closed-comparison.png` | Passed: existing themed header, statistics, search, calendar, function card, and bottom navigation remain in place; only the centered title gained a disclosure arrow |
| Title switcher open | `.superpowers/sdd/ledger-title-switcher-open-comparison.png` | Passed: “默认账本” is first and selected, followed by ordered custom ledgers with member counts and create/manage actions |

## Findings Resolved

- **P1 — management route shadowed by `:ledgerId`:** added the static
  `/ledgers/management` route before the dynamic route and regression tests.
- **P1 — join form used a compact settings-card layout:** rebuilt it with
  reference-aligned guide copy, field blocks, vertical rhythm, and button
  placement while retaining official Ant Design Mobile controls.
- **P2 — long ledger titles could truncate too early:** tightened card padding
  and fixed the title at the specified 17px size.
- **P2 — create footer icon was not centered with its label:** grouped the icon
  and copy in one centered inline-flex wrapper.
- **P2 — sort save button touched the viewport when the browser exposed no
  bottom inset:** added an 8px fallback while retaining
  `SafeArea position="bottom"` for devices with a real inset.
- **P2 — join remark box and disabled button differed from the reference:** reduced
  the textarea to the reference height and corrected the disabled foreground
  and background colors.
- **P1 — first implementation replaced the existing record-home header:** removed
  the mini-program capsule, restored the original header geometry and direct
  search/calendar controls, and attached switching only to the centered title.
- **P1 — default navigation item was labeled “个人账本”:** changed the
  client-owned navigation view model to the fixed label “默认账本”; the
  service-side name and private default-ledger ID remain hidden.

## Layout and Interaction Checks

- No required state has horizontal overflow at 390px.
- Card controls, remove badges, title trigger, switcher options, and fixed
  footer actions remain keyboard reachable.
- The switcher uses dialog/listbox/option semantics, traps Tab, handles Escape,
  restores focus, and keeps a visible keyboard focus indicator.
- The desktop QA viewport exposes a zero CSS safe-area inset. Top and bottom
  `SafeArea` components remain in production markup; no fake status bar was
  added for screenshots.
- The closed and open states were tested in the in-app browser at 390 × 844.
  The open dialog exposed “默认账本 1266 笔记录 当前账本”, “家庭账本 2 人”,
  and “生意账本” without “系统默认账本” or a private ledger ID.
- No application error was emitted during the final interaction. Browser logs
  contained only development tooling and Vite connection messages.

## Final Result

final result: passed

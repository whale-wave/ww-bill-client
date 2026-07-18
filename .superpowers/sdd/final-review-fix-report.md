# Final Review Fix Report

Date: 2026-07-19
Base: `348f814`

## Scope

- Calculator submissions now require a finite numeric result greater than zero before expression state can be completed or a mutation can run.
- Keyboard tests exercise zero, negative, repeated completion, `1 + =`, and `1 + . =` through rendered controls and real clicks.
- Password recovery is covered through the three rendered pages in a real `createMemoryRouter` / `RouterProvider` context, including missing-parameter replacement redirects.
- The `jsdom.window.localStorage` type is declared only in `test/setup.ts`; the project-wide `vitest/jsdom` type was removed.
- No dependency or lockfile change was made. The three password-recovery production pages have no final diff.

## Calculator RED / GREEN evidence

### RED

After adding the click-path tests and before changing `useCalculator`:

```text
$ pnpm test test/pages/record/bookkeeping/keyboard.test.ts
Test Files  1 failed (1)
Tests       2 failed | 7 passed (9)
exit code   1
```

- `1 - 1 =` followed by a second completion click called the create mutation once with `amount: "0"`.
- Editing from `1`, then clicking `- 2 =` followed by a second completion click called the update mutation twice with `amount: "-1"`.
- These failures proved that the invalid result was written into ordinary calculator state before validation.
- The two incomplete-expression tests (`1 + =` and `1 + . =`) already passed and asserted both create and update mocks remained uncalled.

### GREEN

The minimal fix validates cent-scaled addition/subtraction results before changing calculator state and applies the same finite-and-positive rule to ordinary amounts.

```text
$ pnpm test test/pages/record/bookkeeping/keyboard.test.ts
Test Files  1 passed (1)
Tests       9 passed (9)
exit code   0
```

Positive addition (`1 + 2 = 3`), positive subtraction (`5 - 3 = 2`), and ordinary amount submission remain covered and green.

## Password page flow and mutation evidence

The page suite renders actual password-recovery page components under a memory router. Network calls, visual controls, sound, and the email-format gate are deterministic test boundaries; page state, query-parameter readers/builders, navigation, and API payload composition use production code. The format gate is fixed to pass so the Unicode/plus payload specifically exercises routing rather than the shared email regex, which is outside this review scope.

Initial page-flow result:

```text
$ pnpm test test/pages/auth/forget-password-flow.test.ts
Test Files  1 passed (1)
Tests       6 passed (6)
exit code   0
```

Coverage includes:

- entered `鲸浪+test@example.com` is sent to the email API and arrives unchanged at verify-code;
- verify-code reads that email, submits `captcha: "123456"`, and replaces the route with both reset parameters;
- reset submits the same email and captcha with both entered passwords;
- verify-code without email redirects to `/forget-password` with `REPLACE`;
- reset without either email or captcha redirects to `/forget-password` with `REPLACE`.

### Non-committed original-regression mutation

`VerifyCodePage` was temporarily changed from the production `email` reader to:

```ts
urlSearchParams.get('login.email') ?? '';
```

The same page test then produced the expected RED result:

```text
$ pnpm test test/pages/auth/forget-password-flow.test.ts
Test Files  1 failed (1)
Tests       2 failed | 4 passed (6)
exit code   1
```

Observed failures:

- the first-page flow reached verify-code, whose mutated reader treated email as missing and replaced the route back to `/forget-password`;
- the verify-code page did not render the routed Unicode/plus email.

The mutation was restored without committing it. Re-running the identical command returned 6/6 GREEN, and `git diff -- src/pages/auth/forget-password/VerifyCodePage.tsx` produced no output.

## Required verification

```text
$ pnpm test test/pages/record/bookkeeping/keyboard.test.ts test/pages/auth/forget-password-flow.test.ts
Test Files  2 passed (2)
Tests       15 passed (15)
exit code   0

$ npx eslint --fix src/pages/record/bookkeeping/model/useCalculator.ts test/pages/record/bookkeeping/keyboard.test.ts test/pages/auth/forget-password-flow.test.ts test/setup.ts
exit code   0

$ pnpm lint:type
tsc -b --noEmit
exit code   0

$ pnpm test
Test Files  11 passed (11)
Tests       37 passed (37)
exit code   0

$ git diff --check
exit code   0
```

`npx eslint` emitted only two npm warnings about existing user config keys `python` and `home`; ESLint itself reported no problem.

## Self-review

- Final functional changes are limited to `useCalculator`, its keyboard tests, the new password page-flow test, localized test setup typing, and removal of the global ambient type.
- `.superpowers/sdd/final-review-fix-report.md` is the only additional artifact.
- No `any`, non-null assertion, inline ESLint suppression, dependency upgrade, or broad lint exception was added.
- `pnpm-lock.yaml` is unchanged.
- Calculator rejection happens before invalid expression results can be written into the ordinary-amount state, so repeated completion remains rejected.
- Both create and update mocks are checked in every new rejected-input test.

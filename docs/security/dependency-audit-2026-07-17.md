# Client Dependency Audit — 2026-07-17

## Scope and evidence

- Repository: `ww-bill-client`; branch `feat/p10-stabilization`; audited commit
  `08b63b19fa227f8e671a01e302c9ee6ef94e9061`.
- Audit timestamp: `2026-07-17T03:46:57Z`.
- Toolchain: Node.js `v24.15.0`, pnpm `10.34.3`.
- `package.json` and the current `pnpm-lock.yaml` are the manifest and resolved-version
  authorities. No dependency was changed by this task.
- Raw JSON was written only to `/tmp/ww-bill-client-{prod-audit,all-audit,outdated}.json`
  and is not part of the repository.

| Command                       | Exit | Result                                                      |
| ----------------------------- | ---: | ----------------------------------------------------------- |
| `pnpm audit --prod --json`    |    1 | 33 production advisories across 121 production dependencies |
| `pnpm audit --json`           |    1 | 39 advisories across 976 total dependencies                 |
| `pnpm outdated --format json` |    1 | 42 outdated direct dependencies                             |

Exit code `1` is expected here because the commands found vulnerabilities or outdated
packages; all three outputs were valid JSON.

| Scope                  | Critical | High | Moderate | Low | Total |
| ---------------------- | -------: | ---: | -------: | --: | ----: |
| Production audit       |        0 |   18 |       14 |   1 |    33 |
| Full audit             |        0 |   20 |       17 |   2 |    39 |
| Development-only delta |        0 |    2 |        3 |   1 |     6 |

## Method

Every Critical/High package was checked with `pnpm why PACKAGE_NAME` and a scoped
`rg` import/reachability search over `src`, `test`, and the repository. The seven
unique packages were `@remix-run/router`, `axios`, `form-data`, `js-cookie`,
`lodash`, `tmp`, and `xlsx`. Dependency paths below come from the current lockfile
graph, not from manifest ranges. A row is `Yes` when its affected runtime code family
is loaded by this browser application; `No` means the vulnerable code is excluded by
the browser build or belongs only to a development command. Exploit preconditions are
not treated as proof of safety.

Each advisory appears exactly once below. The category totals reconcile to the full
audit counts. The advisory link in the Package cell is the package-to-advisory key.

### Reachable High code evidence

- Router family: `src/app/router.tsx:2` imports `createHashRouter` from
  `react-router-dom`, and line 31 executes it. That direct runtime dependency resolves
  the vulnerable `react-router` and `@remix-run/router` packages in the lockfile path.
- Axios family: `src/shared/api/http.ts:3` imports axios and line 15 creates the shared
  request instance; `src/shared/lib/audio-web.ts:1` also imports axios and line 64
  executes a request. The browser-reachable Axios rows are therefore active code, not
  lockfile-only findings.
- Spreadsheet family: `src/shared/lib/export-data.ts:2` imports `xlsx`; its export flow
  invokes `xlsx.utils` at lines 46 and 64–66, then `xlsx.writeFile` at line 72. Both
  `xlsx` High advisories are on an executed production path.

## Critical

No Critical advisory was reported by either fresh audit.

## High — runtime reachable

| Package                                                                                        | Direct/Transitive                                     | Production/Dev | Severity | Installed | Patched    | Runtime Reachable | Resolution |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------- | -------- | --------- | ---------- | ----------------- | ---------- |
| [`@remix-run/router` / GHSA-2w69-qvjg-hvjx](https://github.com/advisories/GHSA-2w69-qvjg-hvjx) | Transitive — `react-router-dom` → `@remix-run/router` | Production     | High     | `1.17.1`  | `>=1.23.2` | Yes               | Upgrade    |
| [`axios` / GHSA-8hc4-vh64-cxmj](https://github.com/advisories/GHSA-8hc4-vh64-cxmj)             | Direct — root → `axios`                               | Production     | High     | `1.6.0`   | `>=1.7.4`  | Yes               | Upgrade    |
| [`axios` / GHSA-jr5f-v2jv-69x6](https://github.com/advisories/GHSA-jr5f-v2jv-69x6)             | Direct — root → `axios`                               | Production     | High     | `1.6.0`   | `>=1.8.2`  | Yes               | Upgrade    |
| [`axios` / GHSA-pf86-5x62-jrwf](https://github.com/advisories/GHSA-pf86-5x62-jrwf)             | Direct — root → `axios`                               | Production     | High     | `1.6.0`   | `>=1.15.1` | Yes               | Upgrade    |
| [`axios` / GHSA-43fc-jf86-j433](https://github.com/advisories/GHSA-43fc-jf86-j433)             | Direct — root → `axios`                               | Production     | High     | `1.6.0`   | `>=1.13.5` | Yes               | Upgrade    |
| [`axios` / GHSA-hfxv-24rg-xrqf](https://github.com/advisories/GHSA-hfxv-24rg-xrqf)             | Direct — root → `axios`                               | Production     | High     | `1.6.0`   | `>=1.16.0` | Yes               | Upgrade    |
| [`axios` / GHSA-3g43-6gmg-66jw](https://github.com/advisories/GHSA-3g43-6gmg-66jw)             | Direct — root → `axios`                               | Production     | High     | `1.6.0`   | `>=1.15.2` | Yes               | Upgrade    |
| [`xlsx` / GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)              | Direct — root → `xlsx`                                | Production     | High     | `0.18.5`  | `<0.0.0`   | Yes               | Replace    |
| [`xlsx` / GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9)              | Direct — root → `xlsx`                                | Production     | High     | `0.18.5`  | `<0.0.0`   | Yes               | Replace    |

## Moderate — runtime reachable

| Package                                                                                   | Direct/Transitive                                | Production/Dev | Severity | Installed | Patched    | Runtime Reachable | Resolution |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------- | -------- | --------- | ---------- | ----------------- | ---------- |
| [`axios` / GHSA-w9j2-pvgh-6h63](https://github.com/advisories/GHSA-w9j2-pvgh-6h63)        | Direct — root → `axios`                          | Production     | Moderate | `1.6.0`   | `>=1.15.1` | Yes               | Upgrade    |
| [`axios` / GHSA-3w6x-2g7m-8v23](https://github.com/advisories/GHSA-3w6x-2g7m-8v23)        | Direct — root → `axios`                          | Production     | Moderate | `1.6.0`   | `>=1.15.2` | Yes               | Upgrade    |
| [`axios` / GHSA-xx6v-rp6x-q39c](https://github.com/advisories/GHSA-xx6v-rp6x-q39c)        | Direct — root → `axios`                          | Production     | Moderate | `1.6.0`   | `>=1.15.1` | Yes               | Upgrade    |
| [`axios` / GHSA-62hf-57xw-28j9](https://github.com/advisories/GHSA-62hf-57xw-28j9)        | Direct — root → `axios`                          | Production     | Moderate | `1.6.0`   | `>=1.15.1` | Yes               | Upgrade    |
| [`axios` / GHSA-898c-q2cr-xwhg](https://github.com/advisories/GHSA-898c-q2cr-xwhg)        | Direct — root → `axios`                          | Production     | Moderate | `1.6.0`   | `>=1.16.0` | Yes               | Upgrade    |
| [`echarts` / GHSA-fgmj-fm8m-jvvx](https://github.com/advisories/GHSA-fgmj-fm8m-jvvx)      | Direct — root → `echarts`                        | Production     | Moderate | `5.6.0`   | `>=6.1.0`  | Yes               | Upgrade    |
| [`react-router` / GHSA-9jcx-v3wj-wh4m](https://github.com/advisories/GHSA-9jcx-v3wj-wh4m) | Transitive — `react-router-dom` → `react-router` | Production     | Moderate | `6.24.1`  | `>=6.30.2` | Yes               | Upgrade    |
| [`react-router` / GHSA-2j2x-hqr9-3h42](https://github.com/advisories/GHSA-2j2x-hqr9-3h42) | Transitive — `react-router-dom` → `react-router` | Production     | Moderate | `6.24.1`  | `>=6.30.4` | Yes               | Upgrade    |

## Low — runtime reachable

| Package                                                                            | Direct/Transitive       | Production/Dev | Severity | Installed | Patched    | Runtime Reachable | Resolution |
| ---------------------------------------------------------------------------------- | ----------------------- | -------------- | -------- | --------- | ---------- | ----------------- | ---------- |
| [`axios` / GHSA-xhjh-pmcv-23jw](https://github.com/advisories/GHSA-xhjh-pmcv-23jw) | Direct — root → `axios` | Production     | Low      | `1.6.0`   | `>=1.15.1` | Yes               | Upgrade    |

## Development-only

| Package                                                                             | Direct/Transitive                                                  | Production/Dev | Severity | Installed | Patched     | Runtime Reachable | Resolution |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------- | -------- | --------- | ----------- | ----------------- | ---------- |
| [`lodash` / GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | Transitive — `commitizen` → `lodash`                               | Dev            | High     | `4.17.21` | `>=4.18.0`  | No                | Upgrade    |
| [`lodash` / GHSA-f23m-r3pf-42rh](https://github.com/advisories/GHSA-f23m-r3pf-42rh) | Transitive — `commitizen` → `lodash`                               | Dev            | Moderate | `4.17.21` | `>=4.18.0`  | No                | Upgrade    |
| [`lodash` / GHSA-xxjr-mmjv-4gpg](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg) | Transitive — `commitizen` → `lodash`                               | Dev            | Moderate | `4.17.21` | `>=4.17.23` | No                | Upgrade    |
| [`tmp` / GHSA-ph9p-34f9-6g65](https://github.com/advisories/GHSA-ph9p-34f9-6g65)    | Transitive — `commitizen` → `inquirer` → `external-editor` → `tmp` | Dev            | High     | `0.0.33`  | `>=0.2.6`   | No                | Upgrade    |
| [`tmp` / GHSA-52f5-9888-hmc6](https://github.com/advisories/GHSA-52f5-9888-hmc6)    | Transitive — `commitizen` → `inquirer` → `external-editor` → `tmp` | Dev            | Low      | `0.0.33`  | `>=0.2.4`   | No                | Upgrade    |
| [`yaml` / GHSA-48c2-rrv3-qjmp](https://github.com/advisories/GHSA-48c2-rrv3-qjmp)   | Transitive — `lint-staged` → `yaml`                                | Dev            | Moderate | `2.4.5`   | `>=2.8.3`   | No                | Upgrade    |

The source imports `lodash-es`, not the vulnerable `lodash`; `pnpm why lodash` shows
the vulnerable `4.17.21` only under commitizen while ahooks resolves a separate,
non-vulnerable `lodash@4.18.1` production copy.

## False positive / unreachable

These are real advisories in the installed graph, but the affected implementation is
not in this browser runtime. They remain upgrade targets so the lockfile graph is clean.

| Package                                                                                | Direct/Transitive                                        | Production/Dev | Severity | Installed | Patched    | Runtime Reachable | Resolution |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------- | -------- | --------- | ---------- | ----------------- | ---------- |
| [`axios` / GHSA-4hjh-wcwx-xvwj](https://github.com/advisories/GHSA-4hjh-wcwx-xvwj)     | Direct — root → `axios` (Node data-URL adapter)          | Production     | High     | `1.6.0`   | `>=1.12.0` | No                | Upgrade    |
| [`axios` / GHSA-pmwg-cvhr-8vh7](https://github.com/advisories/GHSA-pmwg-cvhr-8vh7)     | Direct — root → `axios` (Node `NO_PROXY`)                | Production     | High     | `1.6.0`   | `>=1.15.1` | No                | Upgrade    |
| [`axios` / GHSA-6chq-wfr3-2hj9](https://github.com/advisories/GHSA-6chq-wfr3-2hj9)     | Direct — root → `axios` (Node HTTP adapter)              | Production     | High     | `1.6.0`   | `>=1.15.1` | No                | Upgrade    |
| [`axios` / GHSA-q8qp-cvcw-x6jj](https://github.com/advisories/GHSA-q8qp-cvcw-x6jj)     | Direct — root → `axios` (Node HTTP adapter)              | Production     | High     | `1.6.0`   | `>=1.15.2` | No                | Upgrade    |
| [`axios` / GHSA-p92q-9vqr-4j8v](https://github.com/advisories/GHSA-p92q-9vqr-4j8v)     | Direct — root → `axios` (Node HTTP redirects)            | Production     | High     | `1.6.0`   | `>=1.16.0` | No                | Upgrade    |
| [`axios` / GHSA-j5f8-grm9-p9fc](https://github.com/advisories/GHSA-j5f8-grm9-p9fc)     | Direct — root → `axios` (Node proxy redirects)           | Production     | High     | `1.6.0`   | `>=1.16.0` | No                | Upgrade    |
| [`axios` / GHSA-35jp-ww65-95wh](https://github.com/advisories/GHSA-35jp-ww65-95wh)     | Direct — root → `axios` (Node HTTP proxy)                | Production     | High     | `1.6.0`   | `>=1.16.0` | No                | Upgrade    |
| [`axios` / GHSA-3p68-rc4w-qgx5](https://github.com/advisories/GHSA-3p68-rc4w-qgx5)     | Direct — root → `axios` (Node `NO_PROXY`)                | Production     | Moderate | `1.6.0`   | `>=1.15.0` | No                | Upgrade    |
| [`axios` / GHSA-445q-vr5w-6q77](https://github.com/advisories/GHSA-445q-vr5w-6q77)     | Direct — root → `axios` (Node form-data stream)          | Production     | Moderate | `1.6.0`   | `>=1.15.1` | No                | Upgrade    |
| [`axios` / GHSA-m7pr-hjqh-92cm](https://github.com/advisories/GHSA-m7pr-hjqh-92cm)     | Direct — root → `axios` (Node `NO_PROXY`)                | Production     | Moderate | `1.6.0`   | `>=1.15.1` | No                | Upgrade    |
| [`axios` / GHSA-5c9x-8gcm-mpgx](https://github.com/advisories/GHSA-5c9x-8gcm-mpgx)     | Direct — root → `axios` (Node HTTP upload stream)        | Production     | Moderate | `1.6.0`   | `>=1.15.1` | No                | Upgrade    |
| [`axios` / GHSA-vf2m-468p-8v99](https://github.com/advisories/GHSA-vf2m-468p-8v99)     | Direct — root → `axios` (Node HTTP response stream)      | Production     | Moderate | `1.6.0`   | `>=1.15.1` | No                | Upgrade    |
| [`axios` / GHSA-fvcv-3m26-pcqx](https://github.com/advisories/GHSA-fvcv-3m26-pcqx)     | Direct — root → `axios` (Node HTTP/cloud metadata chain) | Production     | Moderate | `1.6.0`   | `>=1.15.0` | No                | Upgrade    |
| [`form-data` / GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) | Transitive — `axios` → `form-data`                       | Production     | High     | `4.0.5`   | `>=4.0.6`  | No                | Upgrade    |
| [`js-cookie` / GHSA-qjx8-664m-686j](https://github.com/advisories/GHSA-qjx8-664m-686j) | Transitive — `ahooks` → `js-cookie`                      | Production     | High     | `2.2.1`   | `>=3.0.7`  | No                | Upgrade    |

Axios maps its Node HTTP adapter and Node `FormData` class to browser-safe modules.
The application uses only `useDebounce`, `useMount`, and `useUnmount` from ahooks;
`js-cookie` is isolated behind unused `useCookieState`, ahooks declares
`sideEffects: false`, and the current built assets contain no js-cookie signature.

## Outdated inventory and proposed batches

The outdated result contains 18 production and 24 development direct dependencies;
26 of the 42 latest versions cross a major-version boundary. This is inventory, not
authorization for a bulk upgrade.

1. **HTTP and routing security:** update direct `axios` to a release satisfying
   `>=1.16.0`, and update `react-router-dom` within v6 to at least `6.30.4`. Verify
   request/error behavior and route/login guards. These two direct updates resolve the
   reachable Axios/router advisories and the transitive `form-data` advisory.
2. **Hooks transitive cleanup:** update `ahooks` `3.8.0` to a reviewed compatible 3.x
   release. Current `ahooks@3.9.7` declares `js-cookie@^3.0.5`, allowing the patched
   `3.0.7`; verify the lockfile resolves it and rerun chart/debounce tests.
3. **Spreadsheet export:** `xlsx@0.18.5` is direct and used by
   `src/shared/lib/export-data.ts`; pnpm reports no patched npm version (`<0.0.0`).
   Replace it in a dedicated batch and retain export format/filename tests.
4. **Chart security:** `echarts@5.6.0` requires `>=6.1.0`, a major upgrade. Stop for
   migration review before changing it, then test all chart renderers and tooltip data.
5. **Remaining production freshness:** review the other outdated production packages
   separately. Major candidates include React/React DOM 19, TanStack Query 5,
   i18next/react-i18next, mathjs, tailwind-merge, and zustand; they must not be mixed
   into the security batches above.
6. **Development toolchain:** handle commitizen/inquirer/tmp/lodash and
   lint-staged/yaml first, then review the remaining 24 development updates in small
   lint, test, and build-tool batches. Major ESLint, TypeScript, Tailwind, and test
   runner changes require their own migration checks.

After every batch, rerun frozen install, lint/typecheck, tests, build,
`pnpm audit --prod --json`, `pnpm audit --json`, and `git diff --check`; explain every
manifest and lockfile change before committing.

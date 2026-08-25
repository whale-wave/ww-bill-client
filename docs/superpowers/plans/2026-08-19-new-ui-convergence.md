# New-UI 收敛实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 8 个 UI 问题收敛为 4 个共享基础组件规范（ContentStack/SectionStack、FormField/SelectField/ActionField、圆形头像、PageLoadingState）+ 修复 SheetHeader、分类停用区收起、跨账本迁移数据方向，并把规则落档到 DESIGN.md / AGENTS.md ×3。

**Architecture:** 业务代码全部在 `ww-bill-client`（分支 `refactor/new-ui`）；工程规则同步三份 AGENTS.md，三仓各自提交。共享组件放 `src/shared/ui/`（FSD shared 层）。测试用 Vitest + `createElement/createRoot` 直渲。校验：`npx eslint --fix` -> `pnpm lint:type` -> `pnpm test`。

**Tech Stack:** React 18 + TS + Tailwind 3 + antd-mobile 5 + Vitest + i18next（en / zh-CN）。

**Repos:** `ww-bill-client`、`ww-bill-admin`、`ww-bill-service` 是三个独立 GitHub 仓库。三仓分别 commit。

## 执行状态

- [x] Task 1: ContentStack / SectionStack
- [x] Task 2: FormField id + SelectField + ActionField
- [x] Task 3: 成员详情可编辑态改造
- [x] Task 4: 成员展示层头像圆形化 + 全仓审计
- [x] Task 5: PageLoadingState + 最近删除 + 三个状态组件
- [x] Task 5b: SpinLoading sweep
- [x] Task 6: SheetHeader + AppBottomSheet
- [x] Task 7: 分类停用区收起
- [x] Task 8: 跨账本迁移方向翻转
- [x] Task 9: 规范落档 + 三仓分别提交

---

## Task 1: ContentStack / SectionStack
Create `src/shared/ui/content-stack/ContentStack.tsx` + `index.ts`；Modify `src/shared/ui/index.ts`；Test `test/shared/ui/content-stack.test.tsx`

ContentStack: `gap=12` 默认（`gap-3`），`gap=16`（`gap-4`）；SectionStack = ContentStack gap=16 别名。实现用 `cn('flex min-w-0 flex-col', gap===16?'gap-4':'gap-3', className)`。

接入：`LedgerJoinRequestDetailPage.tsx:145-251`（四个 GradientPanel 包 `<SectionStack><ContentStack>…</ContentStack>{actions}</SectionStack>`，删 mt-2/mt-4）；`MemberEditorPresentation.tsx:9`（space-y-4 -> ContentStack）。

## Task 2: FormField id + SelectField + ActionField
Modify `src/shared/ui/form-field/FormField.tsx`（加 `id?: string` 透传，`inputId = id ?? useId()`）；Create `SelectField.tsx`、`ActionField.tsx`；Modify `form-field/index.ts`；Test `test/shared/ui/form-field.test.tsx`

SelectField: label + native select（`h-[54px] appearance-none rounded-[16px] border-border-primary bg-white/90 shadow-ww-xs`）+ ChevronDown。ActionField: label + button（同 FormField 视觉，右侧 ChevronRight，`disabled:opacity-45`，`testId` 透传）。

## Task 3: 成员详情可编辑态改造（#2 + #4）
Modify `src/pages/ledger-member-detail/LedgerMemberDetailPage.tsx`（292-322）；Test `test/pages/ledger/ledger-collaboration-pages.test.ts`

children 槽包 `<ContentStack>`：可编辑昵称 -> `FormField id="member-nickname"`；不可编辑 -> `StaticInfoRow`（`data-testid="member-static-row"`）。可管理角色 -> `ActionField testId="member-role-row"`；不可管理 -> `StaticInfoRow`。测试 :363 改断言为静态行。

## Task 4: 成员展示层头像圆形化 + 全仓审计
Modify `src/features/workspace-settings/ui/MemberCardsPresentation.tsx:19,24`、`MemberEditorPresentation.tsx:15,20`（`rounded-[17px]` -> `rounded-full`）；Test `test/features/workspace-settings-presentations.test.ts`（补圆形断言）；审计 `rg -n "avatar" src --glob "*.tsx"` 确认无遗漏方形人物头像（分类/账本图标不动）。

## Task 5: PageLoadingState + 最近删除 + 三个状态组件
Create `src/shared/ui/page-loading-state/PageLoadingState.tsx` + `page-loading-state.scss` + `index.ts`、派生 `src/assets/brand/whale-loading-加载图120x120.png`（`sips -Z 120 src/assets/brand/whale-logo-transparent-透明背景原图.png --out src/assets/brand/whale-loading-加载图120x120.png`，验 <50KB）；Modify `src/shared/ui/index.ts`、`LedgerRecoveryPage.tsx`、`features/ledger-collaboration/ui.tsx`、`features/household/ui/HouseholdPageState.tsx`；i18n `recovery.empty`；Test `test/shared/ui/page-loading-state.test.tsx`、更新 `test/features/ledger-collaboration-ui.test.ts:66-73`

`label: ReactNode` 必传（无硬编码）；`<img src={whaleLoading} className="ww-page-loading__whale" />` + scss 呼吸/上浮 keyframes + `prefers-reduced-motion` 关动画；`compact` prop（min-h-[160px] + h-10 w-10）。接入 Recovery（+空态）+ CollaborationQueryState loading（compact）+ HouseholdPageState loading。测试断言从 `.adm-spin-loading` 改 `[data-testid="collaboration-loading"]` + `role="status"`。

## Task 5b: SpinLoading sweep
审计 `rg -n "SpinLoading" src --glob "*.tsx"`；迁移页面/区块状态 14 处到 `PageLoadingState`/`compact`：LedgerRecordDetailPage:72、LedgerCenterPage:201、EditingPage:70、LedgerChartsPage:166、RecordListContainer:65、LedgerRecordCreatePage:118、RecordOverviewPresentation:58、CategoryManagement:575、LedgerDetailPage:105、BillWorkspaceView:52、LedgerScopeBoundary:54、MessagePage:98、SystemNotifyPage:291、UserInfoPage:96。保留内嵌/小控件：ChartCategoryPage:200/242、LedgerCreatePage:99、LedgerTemplatesPage:62、AssetTrendChart:217、AssetRanking:67、CurNetAssetStatus:48、CurAssetStatus:71、RecordCalendarPresentation:168、RecordEditorPresentation:124、RecordSearchPresentation:191、WorkspaceSwitcherPanel:184、LedgerSwitcherPanel:133。更新测试 mock：editing-page.test.ts、message-page.test.ts、system-notify-page.test.ts。

## Task 6: SheetHeader + AppBottomSheet
Create `src/shared/ui/app-overlay/SheetHeader.tsx`；Modify `AppBottomSheet.tsx`（删 `closeIconAlign`）、`app-overlay.scss`（删 `--close-heading`）、`LedgerSettingsPage.tsx`（长 Sheet 用 SheetHeader）、`HouseholdMembersPage.tsx`+`HouseholdSettingsPage.tsx`（短 Sheet 仅删 closeIconAlign）；Test 保留 `app-overlay-close-icon.test.ts`（删 closeIconAlign 断言、保留默认 X 断言）+ 新增 `sheet-header.test.tsx`

SheetHeader: `closeLabel: string` prop（LedgerSettings 两分支传 `t('common:nav.close')`）；无 sticky（flex-col + shrink-0 已足够）；半透明白底 + 底分隔线 + X。长 Sheet：`bodyStyle={{ height: 'min(82dvh, 720px)', overflow: 'hidden' }}` + `showCloseButton={false}` + `flex h-full flex-col` + 内容 `overflow-y-auto`。短 Sheet：删 `closeIconAlign="heading"`、保留默认 X + auto 高度。删 prop 前 `rg -n "closeIconAlign" src/` 确认 0 剩余。

## Task 7: 分类停用区收起
Modify `src/features/category-management/ui/CategoryManagement.tsx`；i18n `{en,zh-CN}/ledger.json`（`categories.moreCount`）；Test `test/features/category-management-collapse.test.tsx`

`showArchived` state 默认 false；标题改 button（`moreCount` 计数 + ChevronDown rotate）；section 包 `{showArchived && …}`；归档后不自动展开；`setType` 切换时 `setShowArchived(false)`；恢复保持当前展开态。

## Task 8: 跨账本迁移方向翻转
Modify `src/pages/ledger-transfer/LedgerTransferPage.tsx` + `model.ts`；i18n `{en,zh-CN}/ledger.json`；Test `test/pages/ledger/ledger-transfer-model.test.ts` + `ledger-transfer-page.test.ts`

model: `buildSourceLedgerOptions(ledgers: LedgerListItem[], currentLedgerId)` 筛 `DATA_TRANSFER` + `RECORD_READ` 且排除当前。`createIdempotencyKey` fallback 改 `Date.now() + Math.random().toString(36).slice(2)`。页面：`sourceLedgerId` state；recordsQuery 挂 source + `enabled: Boolean(sourceLedgerId)`；categories/tags 挂当前 `ledgerId`；下拉用 `buildSourceLedgerOptions`；`buildRequest` 传 `sourceLedgerId / targetLedgerId: ledgerId`；`handleRequestChange`（重建 key + 清 preview）；`handleSourceChange`（清 selectedIds/mappings + handleRequestChange）。SelectField + ContentStack 替换散落间距。i18n：`transfer.source/chooseSource/chooseSourceHint` 新增、`noRecords` 改、删 `target/chooseTarget`。测试 mock `crypto.randomUUID` 无限序列 `key-${++n}`，断言"payload 改变后 key 不等"。

## Task 9: 规范落档 + 三仓分别提交
Modify `ww-bill-client/DESIGN.md`、三份 `AGENTS.md`

DESIGN.md（仅 client，视觉）：卡片 12px / section 16px；人物头像 `rounded-full`；SheetHeader 视觉；loading 鲸鱼呼吸动画。AGENTS.md ×3（纯工程规则，不写视觉数字）：堆叠优先 ContentStack/SectionStack；人物头像走共享组件、视觉遵循 DESIGN；页面级 loading 复用 PageLoadingState、禁裸放 SpinLoading（内嵌小控件除外）；长滚动 Sheet 用统一 header/content 结构。校验：`shasum -a 256` 三份一致 + `git -C <repo> diff --check`。提交：client 显式 `git add AGENTS.md DESIGN.md docs/superpowers/plans/2026-08-19-new-ui-convergence.md`（新文件不用 -a）；admin/service 各 `git add AGENTS.md && git commit`。收尾 client：`pnpm lint && pnpm lint:type && pnpm test`。

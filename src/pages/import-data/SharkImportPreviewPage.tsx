import type { SharkImportDraftRow, SharkImportResult, SharkImportRow } from '@/entities/record-import';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Info, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { assetKeys } from '@/entities/asset';
import { categoryKeys } from '@/entities/category';
import { chartKeys } from '@/entities/chart';
import { ledgerDataKeys } from '@/entities/ledger-data';
import { recordKeys } from '@/entities/record';
import { commitSharkImport, getSharkImport, saveSharkImportDraft } from '@/entities/record-import';
import { ROUTES_PATH } from '@/shared/config/routes';
import { ActionField, AppButton, AppDatePicker, AppSheet, FieldFrame, FormField, MetricGrid, PageHeader, PageLoadingState, SelectField, SheetHeader, Surface } from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';
import './shark-import.scss';

const PAGE_SIZE = 100;
const amountFormatter = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function displayAmount(value: string) {
  return /^\d+(?:\.\d+)?$/u.test(value) ? amountFormatter.format(Number(value)) : value;
}

function formatAssetLabel(asset: { name: string; cardId?: string; groupName?: string }) {
  return [asset.name, asset.cardId ? `尾号 ${asset.cardId.slice(-4)}` : '', asset.groupName].filter(Boolean).join(' · ');
}

function toDraft(row: SharkImportRow): SharkImportDraftRow {
  return {
    sourceRow: row.sourceRow,
    include: row.include,
    date: row.date,
    type: row.type,
    categoryName: row.categoryName,
    amount: row.amount,
    remark: row.remark,
    tagNames: row.tagNames,
    assetId: row.assetId,
    assetMode: row.assetMode,
  };
}

export default function SharkImportPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { batchId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const ledgerId = searchParams.get('ledgerId') ?? '';
  const queryClient = useQueryClient();
  const queryKey = ['record-import', 'shark', ledgerId, batchId] as const;
  const previewQuery = useQuery({
    queryKey,
    queryFn: () => getSharkImport(ledgerId, batchId),
    enabled: Boolean(ledgerId && batchId),
  });
  const preview = previewQuery.data;
  const [editing, setEditing] = useState<SharkImportRow | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [result, setResult] = useState<SharkImportResult | null>(null);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<'all' | 'issues'>('all');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleEdit = (row: SharkImportRow) => {
    setEditing({ ...row, tagNames: [...row.tagNames] });
    setTagInput(row.tagNames.join('、'));
  };

  const handleCloseEditor = () => {
    setEditing(null);
    setIsDatePickerOpen(false);
  };

  const handleFilter = (value: 'all' | 'issues') => {
    setFilter(value);
    setPage(0);
  };

  const updateEditing = (field: string, changes: Partial<SharkImportRow>) => {
    setEditing(current => current
      ? { ...current, ...changes, issues: current.issues.filter(issue => issue.field !== field) }
      : null);
  };

  const handleTagInputChange = (value: string) => {
    setTagInput(value);
    updateEditing('tagNames', {});
  };

  const saveRows = async (rows: SharkImportDraftRow[]) => {
    if (!preview || isSaving)
      return false;
    setIsSaving(true);
    try {
      const updated = await saveSharkImportDraft(ledgerId, batchId, preview.revision, rows);
      queryClient.setQueryData(queryKey, updated);
      return true;
    }
    catch (error) {
      showAppError(error);
      await previewQuery.refetch();
      return false;
    }
    finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!preview || !editing)
      return;
    const changed = {
      ...editing,
      tagNames: Array.from(new Set(tagInput.split(/[、,，]/u).map(value => value.trim()).filter(Boolean))),
    };
    const rows = preview.rows.map(row => toDraft(row.sourceRow === changed.sourceRow ? changed : row));
    if (await saveRows(rows))
      setEditing(null);
  };

  const handleToggleRow = async (row: SharkImportRow) => {
    if (!preview)
      return;
    await saveRows(preview.rows.map(item => toDraft(item.sourceRow === row.sourceRow
      ? { ...item, include: !item.include }
      : item)));
  };

  const handleRefreshAnalysis = async () => {
    if (preview)
      await saveRows(preview.rows.map(toDraft));
  };

  const handleBack = () => {
    if ((location.state as { fromImportData?: boolean } | null)?.fromImportData) {
      navigate(-1);
      return;
    }
    navigate(`${ROUTES_PATH.IMPORT_DATA.getPath()}?ledgerId=${encodeURIComponent(ledgerId)}`, { replace: true });
  };

  const handleCommit = async () => {
    if (!preview || isCommitting)
      return;
    setIsCommitting(true);
    try {
      const completed = await commitSharkImport(ledgerId, batchId, preview.revision);
      setResult(completed);
      await previewQuery.refetch();
      void Promise.all([
        queryClient.invalidateQueries(recordKeys.all),
        queryClient.invalidateQueries(categoryKeys.all),
        queryClient.invalidateQueries(assetKeys.all),
        queryClient.invalidateQueries({ queryKey: chartKeys.ledgerRoot(ledgerId) }),
        queryClient.invalidateQueries({ queryKey: ledgerDataKeys.tagsRoot(ledgerId) }),
        queryClient.invalidateQueries({ queryKey: ['ledger', 'navigation'] }),
      ]);
    }
    catch (error) {
      showAppError(error);
      await previewQuery.refetch();
    }
    finally {
      setIsCommitting(false);
    }
  };

  const completed = result ?? preview?.result;
  const filteredRows = preview?.rows.filter(row => filter === 'all' || (row.include && row.issues.length > 0)) ?? [];
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="shark-import-preview-page page-new relative flex h-full flex-col overflow-hidden">
      <PageHeader
        backLabel="返回导入"
        onBack={handleBack}
        title={completed ? '导入完成' : '鲨鱼记账导入预览'}
      />

      {completed
        ? (
            <main className="min-h-0 flex-1 overflow-y-auto px-[18px] py-7">
              <Surface className="mx-auto max-w-[520px] p-6 text-center" material="raised">
                <CheckCircle2 className="mx-auto text-primary-deep" size={42} />
                <h1 className="mt-4 text-[20px] font-extrabold text-ww-ink">
                  已导入
                  {completed.imported}
                  {' '}
                  条记录
                </h1>
                <p className="mt-2 text-[13px] text-ww-mid">
                  跳过
                  {completed.skipped}
                  {' '}
                  条；可到账本明细中查看。
                </p>
                <AppButton className="mt-6" fullWidth onClick={() => navigate(ROUTES_PATH.LEDGER_RECORDS.getPath(ledgerId))} size="large">查看账本明细</AppButton>
              </Surface>
            </main>
          )
        : (
            <>
              <main className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-6 pt-3">
                {previewQuery.isLoading && <PageLoadingState compact label="正在分析导入记录" />}
                {previewQuery.isError && (
                  <Surface className="mx-auto max-w-[520px] p-5" material="raised">
                    <p className="text-[14px] font-semibold text-feedback-danger">预览暂时无法加载</p>
                    <p className="mt-2 text-[13px] text-ww-mid">请重试；如果草稿已过期，可以返回重新上传。</p>
                    <AppButton className="mt-4" fullWidth onClick={() => void previewQuery.refetch()} variant="secondary">重新加载</AppButton>
                  </Surface>
                )}
                {preview && (
                  <div className="mx-auto max-w-[960px]">
                    <Surface className="p-4" material="raised">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-[15px] font-extrabold text-ww-ink">待导入记录</h2>
                        <span className="shrink-0 rounded-full bg-primary-light px-3 py-1 font-number text-[13px] font-extrabold text-primary-deep">
                          {preview.summary.included}
                          {' '}
                          条
                        </span>
                      </div>
                      <MetricGrid
                        className="mt-4"
                        columns={2}
                        density="standard"
                        items={[
                          { key: 'income', label: '收入', value: `¥${displayAmount(preview.summary.income)}`, tone: 'income' },
                          { key: 'expense', label: '支出', value: `¥${displayAmount(preview.summary.expense)}`, tone: 'expense' },
                        ]}
                      />
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border-primary pt-3 text-[12px] leading-5 text-ww-mid">
                        <span>
                          新建类别
                          {preview.summary.newCategories}
                        </span>
                        <span>
                          新建标签
                          {preview.summary.newTags}
                        </span>
                        {preview.assetLinkAllowed && (
                          <>
                            <span>
                              计入资产
                              {preview.summary.posted}
                            </span>
                            <span>
                              只关联资产
                              {preview.summary.linkOnly}
                            </span>
                          </>
                        )}
                      </div>
                    </Surface>

                    {!preview.assetLinkAllowed && (
                      <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-border-primary bg-white/75 px-4 py-3">
                        <Info aria-hidden="true" className="mt-0.5 shrink-0 text-primary-deep" size={18} />
                        <p className="text-[12px] leading-5 text-ww-mid">此账本不支持关联个人资产。原账户仅供预览核对，导入时自动不关联资产，也不会改变资产余额。</p>
                      </div>
                    )}

                    <div className={`mt-4 flex items-start gap-3 rounded-[16px] border px-4 py-3 ${preview.summary.problems > 0 ? 'border-feedback-danger/30 bg-feedback-danger/5' : 'border-border-primary bg-white/75'}`}>
                      {preview.summary.problems > 0 ? <AlertCircle className="mt-0.5 shrink-0 text-feedback-danger" size={18} /> : <CheckCircle2 className="mt-0.5 shrink-0 text-primary-deep" size={18} />}
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-ww-ink">{preview.summary.problems > 0 ? `${preview.summary.problems} 项需要处理` : '所有待导入记录均可确认'}</p>
                        <p className="mt-1 text-[12px] leading-5 text-ww-mid">{preview.summary.problems > 0 ? '编辑或删除有问题的记录后，才能确认导入。' : preview.assetLinkAllowed ? '请核对金额、类别和资产处理方式。' : '请核对金额、类别和备注。'}</p>
                      </div>
                    </div>

                    <div className="mb-3 mt-5 flex items-center justify-between gap-3">
                      <div className="inline-flex rounded-[13px] border border-border-primary bg-white/80 p-1">
                        {([['all', '全部'], ['issues', `待处理 ${preview.summary.problems}`]] as const).map(([value, label]) => (
                          <button
                            aria-pressed={filter === value}
                            className={`min-h-11 rounded-[10px] px-3 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${filter === value ? 'bg-primary-light text-primary-deep' : 'text-ww-mid'}`}
                            key={value}
                            onClick={() => handleFilter(value)}
                            type="button"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <button className="min-h-11 px-1 text-[12px] font-bold text-primary-deep disabled:opacity-45" disabled={isSaving} onClick={handleRefreshAnalysis} type="button">重新分析</button>
                    </div>
                    <p className="mb-2 px-1 text-[12px] leading-5 text-ww-mid">左侧操作固定，表格可左右滑动查看全部字段。</p>

                    {visibleRows.length === 0
                      ? <p className="rounded-[16px] border border-border-primary bg-white/75 px-4 py-6 text-center text-[13px] text-ww-mid">没有待处理记录，可切回“全部”继续核对。</p>
                      : (
                          <div aria-label="待导入记录表格，左右滑动查看更多字段" className="overflow-x-auto rounded-[18px] border border-border-primary bg-white" tabIndex={0}>
                            <table className={`${preview.assetLinkAllowed ? 'min-w-[980px]' : 'min-w-[840px]'} border-collapse text-left text-[13px] text-ww-ink`}>
                              <thead className="bg-ww-surface-tint text-[12px] text-ww-mid">
                                <tr>
                                  <th className="sticky left-0 z-10 w-[112px] min-w-[112px] bg-ww-surface-tint px-2 py-3 font-bold" scope="col">行与操作</th>
                                  {['类别 / 备注', '金额', '日期', '收支', '标签', '源账户', ...(preview.assetLinkAllowed ? ['资产处理'] : []), '问题 / 提示'].map(label => <th className="whitespace-nowrap px-3 py-3 font-bold" key={label} scope="col">{label}</th>)}
                                </tr>
                              </thead>
                              <tbody>
                                {visibleRows.map(row => (
                                  <tr className="border-t border-border-primary/70 align-top" key={row.sourceRow}>
                                    <td className="sticky left-0 z-10 w-[112px] min-w-[112px] border-r border-border-primary bg-white px-1 py-2">
                                      <div className="flex items-center justify-between gap-1 px-1">
                                        <span className="font-number text-[12px] font-bold text-ww-mid">
                                          #
                                          {row.sourceRow}
                                        </span>
                                        <span className={`text-[11px] font-bold ${!row.include ? 'text-ww-mid' : row.issues.length ? 'text-feedback-danger' : 'text-primary-deep'}`}>
                                          {!row.include ? '已排除' : row.issues.length ? '待处理' : '可导入'}
                                        </span>
                                      </div>
                                      <div className="mt-1 flex gap-1">
                                        <button aria-label={`编辑第 ${row.sourceRow} 行`} className="flex h-11 min-w-11 flex-1 items-center justify-center gap-1 rounded-[10px] text-[12px] font-bold text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:bg-primary-light" onClick={() => handleEdit(row)} type="button">
                                          <Pencil size={14} />
                                          编辑
                                        </button>
                                        <button aria-label={`${row.include ? '删除' : '恢复'}第 ${row.sourceRow} 行`} className="flex h-11 w-11 items-center justify-center rounded-[10px] text-ww-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:bg-primary-light disabled:opacity-45" disabled={isSaving} onClick={() => void handleToggleRow(row)} type="button">
                                          {row.include ? <Trash2 size={16} /> : <RotateCcw size={16} />}
                                        </button>
                                      </div>
                                    </td>
                                    <td className="w-[130px] min-w-[130px] max-w-[130px] px-2 py-3">
                                      <span className={`block font-bold ${row.include ? 'text-ww-ink' : 'text-ww-mid'}`}>
                                        {row.categoryName || '待修正'}
                                        {!row.categoryId && row.categoryName ? ' · 新建' : ''}
                                      </span>
                                      <span className="mt-1 block truncate text-[12px] text-ww-mid" title={row.remark}>{row.remark || '无备注'}</span>
                                    </td>
                                    <td className="min-w-[104px] whitespace-nowrap px-2 py-3 font-number font-extrabold tabular-nums">
                                      ¥
                                      {displayAmount(row.amount)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 font-number text-ww-mid">{row.date}</td>
                                    <td className="whitespace-nowrap px-3 py-3">{row.type === 'add' ? '收入' : row.type === 'sub' ? '支出' : '待修正'}</td>
                                    <td className="min-w-[100px] max-w-[180px] px-3 py-3">{row.tagNames.join('、') || '—'}</td>
                                    <td className="min-w-[150px] max-w-[230px] px-3 py-3">{row.sourceAccount || '—'}</td>
                                    {preview.assetLinkAllowed && <td className="whitespace-nowrap px-3 py-3">{row.assetMode === 'POST' ? '计入余额' : row.assetMode === 'LINK_ONLY' ? '只关联' : row.assetMode === 'UNRESOLVED' ? '待选择' : '不关联'}</td>}
                                    <td className={`min-w-[190px] max-w-[260px] px-3 py-3 ${row.issues.length ? 'text-feedback-danger' : 'text-ww-mid'}`}>{row.issues.map(issue => issue.message).join('；') || row.warnings.join('；') || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                    {pageCount > 1 && (
                      <div className="mt-3 flex items-center justify-center gap-3 text-[13px] text-ww-mid">
                        <button className="min-h-11 rounded-[10px] px-3 disabled:opacity-45" disabled={page === 0} onClick={() => setPage(value => value - 1)} type="button">上一页</button>
                        <span className="font-number tabular-nums">
                          {page + 1}
                          {' '}
                          /
                          {' '}
                          {pageCount}
                        </span>
                        <button className="min-h-11 rounded-[10px] px-3 disabled:opacity-45" disabled={page >= pageCount - 1} onClick={() => setPage(value => value + 1)} type="button">下一页</button>
                      </div>
                    )}
                  </div>
                )}
              </main>
              {preview && (
                <footer className="shrink-0 border-t border-border-primary bg-white/95 px-[18px] pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
                  <div className="mx-auto max-w-[520px]">
                    <p className="mb-2 text-center text-[12px] font-semibold text-ww-mid">
                      待导入
                      {' '}
                      {preview.summary.included}
                      {' '}
                      条
                      {preview.summary.problems > 0 ? ` · ${preview.summary.problems} 项待处理` : ''}
                    </p>
                    <AppButton
                      disabled={preview.summary.problems > 0 || preview.summary.included === 0 || isSaving}
                      fullWidth
                      loading={isCommitting}
                      loadingLabel="正在导入…"
                      onClick={handleCommit}
                      size="large"
                    >
                      确认导入
                      {' '}
                      {preview.summary.included}
                      {' '}
                      条
                    </AppButton>
                  </div>
                </footer>
              )}
            </>
          )}

      <AppSheet
        bodyClassName="shark-import-editor-sheet max-h-[90dvh] overflow-hidden"
        destroyOnClose
        onClose={handleCloseEditor}
        onMaskClick={handleCloseEditor}
        position="bottom"
        showCloseButton={false}
        visible={editing !== null}
      >
        {editing && (
          <div className="flex max-h-[90dvh] flex-col">
            <SheetHeader closeLabel="关闭" description={`源文件第 ${editing.sourceRow} 行`} onClose={handleCloseEditor} title="编辑导入记录" />
            <div className="min-h-0 space-y-4 overflow-y-auto px-4 pb-5 pt-4">
              {editing.issues.length > 0 && <p className="rounded-[12px] bg-feedback-danger/5 px-3 py-2 text-[12px] leading-5 text-feedback-danger" role="alert">{editing.issues.map(issue => issue.message).join('；')}</p>}
              <div className="grid grid-cols-2 gap-3">
                <ActionField label="日期" onClick={() => setIsDatePickerOpen(true)} value={editing.date || '选择日期'} />
                <SelectField
                  label="收支"
                  onChange={value => updateEditing('type', { type: value as SharkImportRow['type'] })}
                  options={[{ label: '支出', value: 'sub' }, { label: '收入', value: 'add' }]}
                  placeholder="请选择"
                  value={editing.type}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField errorMessage={editing.issues.find(issue => issue.field === 'categoryName')?.message} label="类别" onChange={value => updateEditing('categoryName', { categoryName: value })} value={editing.categoryName} />
                <FormField errorMessage={editing.issues.find(issue => issue.field === 'amount')?.message} inputMode="decimal" label="金额" onChange={value => updateEditing('amount', { amount: value })} value={editing.amount} />
              </div>
              <label className="block min-w-0">
                <span className="mb-2 block text-[12px] font-bold leading-[18px] text-ww-mid">备注</span>
                <FieldFrame className="items-start py-3">
                  <textarea className="min-h-20 w-full resize-none border-0 bg-transparent text-[15px] leading-6 text-ww-ink outline-none" onChange={event => updateEditing('remark', { remark: event.target.value })} value={editing.remark} />
                </FieldFrame>
              </label>
              <FormField errorMessage={editing.issues.find(issue => issue.field === 'tagNames')?.message} label="标签（用顿号分隔）" onChange={handleTagInputChange} value={tagInput} />
              <div className="border-t border-border-primary pt-4">
                <p className="mb-2 text-[12px] font-bold text-ww-mid">源账户</p>
                <p className="break-all text-[14px] font-semibold text-ww-ink">{editing.sourceAccount || '未关联'}</p>
              </div>
              {preview?.assetLinkAllowed && (
                <>
                  <SelectField
                    label="资产关联"
                    onChange={(value) => {
                      updateEditing('assetId', {
                        assetId: value === 'UNRESOLVED' || !value ? null : value,
                        assetMode: value === 'UNRESOLVED' ? 'UNRESOLVED' : value ? 'LINK_ONLY' : 'NONE',
                      });
                    }}
                    options={[
                      ...(editing.assetMode === 'UNRESOLVED' ? [{ label: '请选择关联方式', value: 'UNRESOLVED' }] : []),
                      { label: '明确不关联资产', value: '' },
                      ...preview.assets.map(asset => ({ label: formatAssetLabel(asset), value: asset.id })),
                    ]}
                    value={editing.assetId ?? (editing.assetMode === 'UNRESOLVED' ? 'UNRESOLVED' : '')}
                  />
                  <p className="text-[12px] leading-5 text-ww-mid">
                    {preview.assets.length === 0
                      ? '当前没有可选的个人资产，可以明确选择不关联。'
                      : '调整余额当天及更早的记录只关联资产，不改变余额。'}
                  </p>
                </>
              )}
            </div>
            <div className="shrink-0 border-t border-border-primary bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
              <AppButton fullWidth loading={isSaving} onClick={handleSaveEdit} size="large">保存修改</AppButton>
            </div>
          </div>
        )}
      </AppSheet>
      <AppDatePicker
        className="shark-import-date-picker"
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={(value) => {
          const year = value.getFullYear();
          const month = String(value.getMonth() + 1).padStart(2, '0');
          const day = String(value.getDate()).padStart(2, '0');
          updateEditing('date', { date: `${year}-${month}-${day}` });
          setIsDatePickerOpen(false);
        }}
        title="选择记账日期"
        value={editing?.date && !Number.isNaN(Date.parse(`${editing.date}T12:00:00`)) ? new Date(`${editing.date}T12:00:00`) : undefined}
        visible={isDatePickerOpen}
      />
    </div>
  );
}

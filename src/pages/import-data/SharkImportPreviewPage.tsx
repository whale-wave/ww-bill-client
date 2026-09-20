import type { SharkImportDraftRow, SharkImportResult, SharkImportRow } from '@/entities/record-import';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { assetKeys } from '@/entities/asset';
import { categoryKeys } from '@/entities/category';
import { chartKeys } from '@/entities/chart';
import { ledgerDataKeys } from '@/entities/ledger-data';
import { recordKeys } from '@/entities/record';
import { commitSharkImport, getSharkImport, saveSharkImportDraft } from '@/entities/record-import';
import { ROUTES_PATH } from '@/shared/config/routes';
import { AppButton, AppSheet, PageHeader, SheetHeader, Surface } from '@/shared/ui';
import { showAppError } from '@/shared/ui/app-feedback';

const PAGE_SIZE = 100;

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

  const handleEdit = (row: SharkImportRow) => {
    setEditing({ ...row, tagNames: [...row.tagNames] });
    setTagInput(row.tagNames.join('、'));
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
  const pageCount = Math.max(1, Math.ceil((preview?.rows.length ?? 0) / PAGE_SIZE));
  const visibleRows = preview?.rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) ?? [];

  return (
    <div className="page-new relative flex h-full flex-col overflow-hidden">
      <PageHeader
        backLabel="返回导入"
        onBack={() => navigate(`${ROUTES_PATH.IMPORT_DATA.getPath()}?ledgerId=${encodeURIComponent(ledgerId)}`)}
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
                {previewQuery.isLoading && <p className="py-10 text-center text-[13px] text-ww-mid">正在加载预览…</p>}
                {previewQuery.isError && <p className="py-10 text-center text-[13px] text-feedback-danger">预览无法加载，请返回重新上传。</p>}
                {preview && (
                  <div className="mx-auto max-w-[960px]">
                    <Surface className="p-4" material="raised">
                      <p className="text-[13px] font-bold text-ww-ink">确认前请核对每一条记录</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-ww-mid sm:grid-cols-4">
                        <span>
                          待导入
                          {preview.summary.included}
                          {' '}
                          条
                        </span>
                        <span>
                          收入 ¥
                          {preview.summary.income}
                        </span>
                        <span>
                          支出 ¥
                          {preview.summary.expense}
                        </span>
                        <span>
                          待处理
                          {preview.summary.problems}
                          {' '}
                          项
                        </span>
                        <span>
                          新建类别
                          {preview.summary.newCategories}
                          {' '}
                          个
                        </span>
                        <span>
                          新建标签
                          {preview.summary.newTags}
                          {' '}
                          个
                        </span>
                        <span>
                          资产记账
                          {preview.summary.posted}
                          {' '}
                          条
                        </span>
                        <span>
                          只关联资产
                          {preview.summary.linkOnly}
                          {' '}
                          条
                        </span>
                      </div>
                      <button className="mt-3 text-[12px] font-bold text-primary-deep" disabled={isSaving} onClick={handleRefreshAnalysis} type="button">重新分析资产余额基准</button>
                    </Surface>

                    <p className="mb-2 mt-5 px-1 text-[12px] text-ww-mid">左右滑动查看全部字段，点击“编辑”修改。删除的行可以恢复。</p>
                    <div className="overflow-x-auto rounded-[18px] border border-border-primary bg-white/90">
                      <table className="w-full min-w-[1060px] border-collapse text-left text-[12px]">
                        <thead className="bg-ww-surface-tint text-ww-mid">
                          <tr>
                            {['行号', '日期', '收支', '类别', '金额', '备注', '标签', '源账户', '资产处理', '问题', '操作'].map(label => <th className="whitespace-nowrap px-3 py-3 font-bold" key={label}>{label}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRows.map(row => (
                            <tr className={`border-t border-border-primary/60 ${row.include ? '' : 'opacity-45'}`} key={row.sourceRow}>
                              <td className="px-3 py-3">{row.sourceRow}</td>
                              <td className="whitespace-nowrap px-3 py-3">{row.date}</td>
                              <td className="px-3 py-3">{row.type === 'add' ? '收入' : row.type === 'sub' ? '支出' : '待修正'}</td>
                              <td className="px-3 py-3">
                                {row.categoryName || '待修正'}
                                {row.categoryId ? '' : ' · 新建'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 font-bold">
                                ¥
                                {row.amount}
                              </td>
                              <td className="max-w-[150px] truncate px-3 py-3">{row.remark || '—'}</td>
                              <td className="max-w-[130px] truncate px-3 py-3">{row.tagNames.join('、') || '—'}</td>
                              <td className="max-w-[150px] truncate px-3 py-3">{row.sourceAccount || '—'}</td>
                              <td className="whitespace-nowrap px-3 py-3">{row.assetMode === 'POST' ? '计入余额' : row.assetMode === 'LINK_ONLY' ? '只关联' : row.assetMode === 'UNRESOLVED' ? '待选择' : '不关联'}</td>
                              <td className="max-w-[210px] px-3 py-3 text-feedback-danger">{row.issues.map(issue => issue.message).join('；') || row.warnings.join('；') || '—'}</td>
                              <td className="whitespace-nowrap px-3 py-3">
                                <button aria-label={`编辑第 ${row.sourceRow} 行`} className="mr-3 inline-flex items-center gap-1 text-primary-deep" onClick={() => handleEdit(row)} type="button">
                                  <Pencil size={14} />
                                  编辑
                                </button>
                                <button aria-label={`${row.include ? '删除' : '恢复'}第 ${row.sourceRow} 行`} className="inline-flex items-center gap-1 text-ww-mid" disabled={isSaving} onClick={() => void handleToggleRow(row)} type="button">
                                  {row.include ? <Trash2 size={14} /> : <RotateCcw size={14} />}
                                  {row.include ? '删除' : '恢复'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {pageCount > 1 && (
                      <div className="mt-3 flex items-center justify-center gap-4 text-[12px] text-ww-mid">
                        <button disabled={page === 0} onClick={() => setPage(value => value - 1)} type="button">上一页</button>
                        <span>
                          {page + 1}
                          {' '}
                          /
                          {' '}
                          {pageCount}
                        </span>
                        <button disabled={page >= pageCount - 1} onClick={() => setPage(value => value + 1)} type="button">下一页</button>
                      </div>
                    )}
                  </div>
                )}
              </main>
              {preview && (
                <footer className="shrink-0 border-t border-border-primary bg-white/95 px-[18px] pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
                  <div className="mx-auto max-w-[520px]">
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
                    {preview.summary.problems > 0 && <p className="mt-2 text-center text-[12px] text-feedback-danger">请先编辑或删除有问题的记录</p>}
                  </div>
                </footer>
              )}
            </>
          )}

      <AppSheet
        bodyClassName="max-h-[90dvh]"
        destroyOnClose
        onClose={() => setEditing(null)}
        onMaskClick={() => setEditing(null)}
        position="bottom"
        showCloseButton={false}
        visible={editing !== null}
      >
        {editing && (
          <div className="max-h-[88dvh] overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3">
            <SheetHeader closeLabel="关闭" description={`源文件第 ${editing.sourceRow} 行`} onClose={() => setEditing(null)} title="编辑导入记录" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-[12px] font-bold text-ww-mid">
                日期
                <input className="mt-1 min-h-11 w-full rounded-xl border border-border-primary bg-white px-3 text-ww-ink" onChange={event => setEditing({ ...editing, date: event.target.value })} type="date" value={editing.date} />
              </label>
              <label className="text-[12px] font-bold text-ww-mid">
                收支
                <select className="mt-1 min-h-11 w-full rounded-xl border border-border-primary bg-white px-3 text-ww-ink" onChange={event => setEditing({ ...editing, type: event.target.value as SharkImportRow['type'] })} value={editing.type}>
                  <option value="">请选择</option>
                  <option value="sub">支出</option>
                  <option value="add">收入</option>
                </select>
              </label>
              <label className="text-[12px] font-bold text-ww-mid">
                类别
                <input className="mt-1 min-h-11 w-full rounded-xl border border-border-primary bg-white px-3 text-ww-ink" onChange={event => setEditing({ ...editing, categoryName: event.target.value })} value={editing.categoryName} />
              </label>
              <label className="text-[12px] font-bold text-ww-mid">
                金额
                <input className="mt-1 min-h-11 w-full rounded-xl border border-border-primary bg-white px-3 text-ww-ink" inputMode="decimal" onChange={event => setEditing({ ...editing, amount: event.target.value })} value={editing.amount} />
              </label>
            </div>
            <label className="mt-3 block text-[12px] font-bold text-ww-mid">
              备注
              <textarea className="mt-1 min-h-20 w-full rounded-xl border border-border-primary bg-white p-3 text-ww-ink" onChange={event => setEditing({ ...editing, remark: event.target.value })} value={editing.remark} />
            </label>
            <label className="mt-3 block text-[12px] font-bold text-ww-mid">
              标签（用顿号分隔）
              <input className="mt-1 min-h-11 w-full rounded-xl border border-border-primary bg-white px-3 text-ww-ink" onChange={event => setTagInput(event.target.value)} value={tagInput} />
            </label>
            <p className="mt-3 text-[12px] text-ww-mid">
              源账户：
              {editing.sourceAccount || '未关联'}
            </p>
            <label className="mt-2 block text-[12px] font-bold text-ww-mid">
              关联资产
              <select
                className="mt-1 min-h-11 w-full rounded-xl border border-border-primary bg-white px-3 text-ww-ink"
                onChange={event => setEditing({
                  ...editing,
                  assetId: event.target.value || null,
                  assetMode: event.target.value ? 'LINK_ONLY' : 'NONE',
                })}
                value={editing.assetId ?? (editing.assetMode === 'UNRESOLVED' ? 'UNRESOLVED' : '')}
              >
                {editing.assetMode === 'UNRESOLVED' && <option disabled value="UNRESOLVED">请选择处理方式</option>}
                <option value="">明确不关联资产</option>
                {preview?.assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                    {asset.cardId ? ` (${asset.cardId.slice(-4)})` : ''}
                    {' '}
                    ·
                    {asset.groupName}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-[11px] leading-4 text-ww-soft">资产余额处理由最近一次手动调整日期决定；调整当天及更早的记录只关联，不影响余额。</p>
            {editing.issues.length > 0 && <p className="mt-3 text-[12px] text-feedback-danger">{editing.issues.map(issue => issue.message).join('；')}</p>}
            <AppButton className="mt-5" fullWidth loading={isSaving} onClick={handleSaveEdit} size="large">保存修改</AppButton>
          </div>
        )}
      </AppSheet>
    </div>
  );
}

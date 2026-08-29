import type { RecordEditorSeed } from './types';
import type { CategoryAmountType, CategoryEntity } from '@/entities/category';
import type { ShortcutDraft } from '@/entities/shortcut-bookkeeping';
import dayjs from 'dayjs';

type ShortcutCategory = Pick<CategoryEntity, 'icon' | 'id' | 'name' | 'type'>;

const CATEGORY_KEYWORDS: ReadonlyArray<{
  categoryNames: readonly string[];
  keywords: readonly string[];
}> = [
  { categoryNames: ['餐饮', '餐饮费'], keywords: ['餐饮', '外卖', '美团', '饿了么', '咖啡', '奶茶', '餐厅', '肯德基', '麦当劳'] },
  { categoryNames: ['交通', '交通费'], keywords: ['滴滴', '打车', '出租车', '地铁', '公交', '高铁', '火车', '机票', '加油', '停车'] },
  { categoryNames: ['购物', '购物费'], keywords: ['淘宝', '天猫', '京东', '拼多多', '购物'] },
  { categoryNames: ['医疗', '医疗费'], keywords: ['医院', '诊所', '药店', '挂号', '体检'] },
  { categoryNames: ['娱乐', '娱乐费'], keywords: ['电影', '游戏', 'KTV', '演出', '会员'] },
  { categoryNames: ['服饰', '服装'], keywords: ['服装', '衣服', '鞋', '优衣库'] },
  { categoryNames: ['住房', '房租'], keywords: ['房租', '物业', '水费', '电费', '燃气费'] },
];

function getShortcutText(draft: ShortcutDraft) {
  return `${draft.merchantCandidate}\n${draft.rawText}`.toLowerCase();
}

export function inferShortcutRecordType(draft: ShortcutDraft): CategoryAmountType {
  return /退款|收款到账|转入|收入/.test(getShortcutText(draft))
    ? 'add'
    : 'sub';
}

export function inferShortcutCategory(
  categories: readonly ShortcutCategory[],
  draft: ShortcutDraft,
): ShortcutCategory | undefined {
  const text = getShortcutText(draft);
  const candidates = new Map<number, ShortcutCategory>();
  const addCategoriesByName = (names: readonly string[]) => {
    categories.filter(category => names.includes(category.name))
      .forEach(category => candidates.set(category.id, category));
  };

  categories
    .filter(category => category.name.length > 1 && text.includes(category.name.toLowerCase()))
    .forEach(category => candidates.set(category.id, category));
  CATEGORY_KEYWORDS
    .filter(group => group.keywords.some(keyword => text.includes(keyword.toLowerCase())))
    .forEach(group => addCategoriesByName(group.categoryNames));

  return candidates.size === 1 ? [...candidates.values()][0] : undefined;
}

export function createShortcutRecordSeed(
  draft: ShortcutDraft,
  recordType: CategoryAmountType,
): RecordEditorSeed {
  const amount = draft.amountCandidate?.trim();
  const hasValidAmount = Boolean(
    amount
    && /^(?=.*[1-9])(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(amount),
  );
  return {
    ...(hasValidAmount ? { amount } : {}),
    recordType,
    remark: draft.merchantCandidate,
    time: draft.capturedAt && dayjs(draft.capturedAt).isValid()
      ? dayjs(draft.capturedAt).toISOString()
      : dayjs().toISOString(),
  };
}

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

function getStandaloneOcrAmount(rawText: string) {
  const lines = rawText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const standalone = lines
    .map(line => line.trim().match(/^[+\-−—–]?\s*(\d[\d,]*(?:\.\d{1,2})?)$/)?.[1])
    .find((amount): amount is string => Boolean(amount));
  if (standalone)
    return standalone.replace(/,/g, '');

  const candidates = lines.flatMap((line, lineIndex) =>
    [...line.matchAll(/[+\-−—–]?\s*\d[\d,]*(?:\.\d{1,2})?/g)].flatMap((match) => {
      const token = match[0];
      const start = match.index ?? 0;
      const before = line[start - 1] ?? '';
      const after = line[start + token.length] ?? '';
      if (/[a-z]/i.test(before) || /[a-z]/i.test(after))
        return [];
      const amount = token.trim().replace(/^[+\-−—–]\s*/, '').replace(/,/g, '');
      if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(amount) || !/[1-9]/.test(amount))
        return [];
      const [integerPart] = amount.split('.');
      const identifier = /订单号|流水号|交易号|商户单号|手机号|卡号|支付时间|日期|时间/.test(line);
      const moneyContext = /支付|付款|实付|订单金额|金额|合计|总计|应付|消费|扣款|服务费|费用|价格/.test(line);
      return [{
        amount,
        index: lineIndex,
        score: (moneyContext ? 60 : 0)
          + (/[¥￥]/.test(line) ? 50 : 0)
          + (/^[+\-−—–]/.test(token.trim()) ? 40 : 0)
          + (amount.includes('.') ? 20 : 0)
          - (identifier ? 160 : 0)
          - (integerPart.length >= 9 ? 100 : 0)
          - (/^(?:19|20)\d{2}$/.test(integerPart) ? 40 : 0),
      }];
    }),
  );
  return candidates
    .sort((left, right) => right.score - left.score || left.index - right.index)[0]
    ?.amount;
}

function getShortcutAmount(draft: ShortcutDraft) {
  const candidate = draft.amountCandidate?.trim();
  if (candidate && /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(candidate))
    return candidate;
  return getStandaloneOcrAmount(draft.rawText) ?? '0';
}

function getShortcutRemark(draft: ShortcutDraft) {
  if (draft.merchantCandidate.trim())
    return draft.merchantCandidate.trim();

  const lines = draft.rawText.split(/\r?\n/)
    .map(line => line.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
  const fallback = lines
    .map((line, index) => {
      const isField = /订单号|流水号|交易号|商户单号|手机号|卡号|支付时间|日期|时间|状态|全部订单|账单详情/.test(line);
      const isMostlyNumeric = !/[\p{L}\p{Script=Han}]/u.test(line) || /^[+\-−—–\d\s.,¥￥]+$/.test(line);
      const followedByAmount = /[+\-−—–]?\s*\d[\d,]*(?:\.\d{1,2})?/.test(lines[index + 1] ?? '');
      return {
        index,
        value: line.slice(0, 80),
        score: (followedByAmount ? 40 : 0) + (index < 3 ? 10 : 0)
          - (isField ? 100 : 0) - (isMostlyNumeric ? 100 : 0),
      };
    })
    .filter(candidate => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)[0];
  return fallback?.value ?? (lines.join(' ').slice(0, 80) || '待核对订单');
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
  const scores = new Map<number, number>();
  const addScore = (category: ShortcutCategory, score: number) => {
    scores.set(category.id, (scores.get(category.id) ?? 0) + score);
  };

  categories
    .filter(category => category.name.length > 1 && text.includes(category.name.toLowerCase()))
    .forEach(category => addScore(category, 4));
  CATEGORY_KEYWORDS
    .forEach((group) => {
      const matchedKeywords = group.keywords.filter(keyword => text.includes(keyword.toLowerCase()));
      if (matchedKeywords.length === 0)
        return;
      categories
        .filter(category => group.categoryNames.includes(category.name))
        .forEach(category => addScore(category, matchedKeywords.length * 2));
    });

  const bestCategory = categories.reduce<ShortcutCategory | undefined>((best, category) => {
    if (!best || (scores.get(category.id) ?? 0) > (scores.get(best.id) ?? 0))
      return category;
    return best;
  }, undefined);
  if (bestCategory && (scores.get(bestCategory.id) ?? 0) > 0)
    return bestCategory;

  return categories.find(category => /^(?:其他|其它)$/.test(category.name))
    ?? categories.find(category => category.name === '日用')
    ?? categories[0];
}

export function createShortcutRecordSeed(
  draft: ShortcutDraft,
  recordType: CategoryAmountType,
): RecordEditorSeed {
  const amount = getShortcutAmount(draft);
  return {
    amount,
    recordType,
    remark: getShortcutRemark(draft),
    time: draft.capturedAt && dayjs(draft.capturedAt).isValid()
      ? dayjs(draft.capturedAt).toISOString()
      : dayjs().toISOString(),
  };
}

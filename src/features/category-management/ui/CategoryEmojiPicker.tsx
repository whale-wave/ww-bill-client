import type { CategoryIconCatalogItem } from '@/entities/category';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CategoryIcon } from '@/entities/category';
import { useTranslation } from '@/shared/i18n';

const EMOJI_GROUPS = [
  'emoji-smileys',
  'emoji-people',
  'emoji-animals',
  'emoji-food',
  'emoji-travel',
  'emoji-activities',
  'emoji-objects',
  'emoji-symbols',
  'emoji-flags',
] as const;

type EmojiGroup = typeof EMOJI_GROUPS[number];
type EmojiTab = EmojiGroup | 'popular';

const POPULAR_EMOJIS = new Set([
  '🍔',
  '🍕',
  '🍜',
  '🍱',
  '☕',
  '🧋',
  '🍎',
  '🛒',
  '🚌',
  '🚕',
  '✈️',
  '🏠',
  '💊',
  '🎮',
  '🎬',
  '📚',
  '🐱',
  '🐶',
  '🎁',
  '💰',
  '💸',
  '💼',
]);

const PAGE_SIZE = 100;

function getInitialTab(icons: CategoryIconCatalogItem[], selectedKey?: string): EmojiTab {
  const selected = icons.find(item => item.key === selectedKey);
  if (selected && selected.group !== 'emoji' && !POPULAR_EMOJIS.has(selected.key.slice('emoji:'.length)))
    return selected.group as EmojiGroup;
  return 'popular';
}

export function CategoryEmojiPicker({
  icons,
  onSelect,
  selectedKey,
}: {
  icons: CategoryIconCatalogItem[];
  onSelect: (key: string) => void;
  selectedKey?: string;
}) {
  const { i18n, t } = useTranslation('ledger');
  const [initialSelectedKey] = useState(selectedKey);
  const [chosenTab, setChosenTab] = useState<EmojiTab>();
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isChinese = i18n.resolvedLanguage?.startsWith('zh');
  const normalizedQuery = query.trim().normalize('NFKC').toLocaleLowerCase();
  const initialTab = useMemo(() => getInitialTab(icons, initialSelectedKey), [icons, initialSelectedKey]);
  const activeTab = chosenTab ?? initialTab;

  const matches = useMemo(() => {
    const filtered = icons.filter((item) => {
      if (normalizedQuery) {
        const searchable = [item.name.zh, item.name.en, ...(item.keywords ?? [])]
          .join(' ')
          .normalize('NFKC')
          .toLocaleLowerCase();
        return searchable.includes(normalizedQuery);
      }
      return activeTab === 'popular'
        ? POPULAR_EMOJIS.has(item.key.slice('emoji:'.length))
        : item.group === activeTab;
    });
    if (!normalizedQuery && initialSelectedKey) {
      const selectedIndex = filtered.findIndex(item => item.key === initialSelectedKey);
      if (selectedIndex > 0)
        filtered.unshift(...filtered.splice(selectedIndex, 1));
    }
    return filtered;
  }, [activeTab, icons, initialSelectedKey, normalizedQuery]);

  const hasMore = matches.length > visibleCount;
  useEffect(() => {
    if (!hasMore || !loadMoreRef.current || typeof IntersectionObserver === 'undefined')
      return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting)
        setVisibleCount(count => Math.min(count + PAGE_SIZE, matches.length));
    }, { rootMargin: '200px 0px' });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [activeTab, hasMore, matches.length, normalizedQuery, visibleCount]);

  return (
    <section aria-label={t('categories.iconSources.emoji')} className="mt-5">
      <label className="flex min-h-11 items-center gap-2 rounded-[16px] border border-solid border-border-primary bg-ww-surface px-3 text-ww-mid shadow-ww-xs">
        <Search aria-hidden size={18} />
        <input
          aria-label={t('categories.emojiSearch')}
          className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-ww-ink outline-none placeholder:text-ww-soft"
          onChange={(event) => {
            setQuery(event.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder={t('categories.emojiSearch')}
          type="search"
          value={query}
        />
      </label>
      {!normalizedQuery && (
        <div aria-label={t('categories.emojiGroupsLabel')} className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2" role="group">
          {(['popular', ...EMOJI_GROUPS] as EmojiTab[]).map(group => (
            <button
              aria-pressed={activeTab === group}
              className={`min-h-11 shrink-0 rounded-full border-0 px-4 text-[12px] font-bold ${activeTab === group ? 'bg-primary text-action-primary-foreground shadow-ww-xs' : 'bg-ww-surface-tint text-ww-mid'}`}
              key={group}
              onClick={() => {
                setChosenTab(group);
                setVisibleCount(PAGE_SIZE);
              }}
              type="button"
            >
              {t(`categories.emojiGroups.${group}`)}
            </button>
          ))}
        </div>
      )}
      {matches.length > 0
        ? (
            <>
              <div className="mt-3 grid grid-cols-5 gap-x-3 gap-y-4">
                {matches.slice(0, visibleCount).map(item => (
                  <button
                    aria-label={isChinese ? item.name.zh : item.name.en}
                    aria-pressed={selectedKey === item.key}
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-0 transition ${selectedKey === item.key ? 'bg-primary shadow-ww' : 'bg-ww-surface-tint'}`}
                    key={item.key}
                    onClick={() => onSelect(item.key)}
                    type="button"
                  >
                    <CategoryIcon iconKey={item.key} size={22} />
                  </button>
                ))}
              </div>
              {hasMore && <div aria-hidden className="h-px" ref={loadMoreRef} />}
            </>
          )
        : <p className="py-8 text-center text-[13px] text-ww-mid">{t('categories.emojiNoResults')}</p>}
    </section>
  );
}

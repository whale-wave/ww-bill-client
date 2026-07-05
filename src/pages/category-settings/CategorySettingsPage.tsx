import type { FC } from 'react';
import type { CategoryAmountType, CategoryEntity } from '@/entities/category';
import { ErrorBlock, SpinLoading } from 'antd-mobile';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCategoryQuery } from '@/entities/category';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { Icon, NavBar } from '@/shared/ui';
import styles from './index.module.scss';

interface CategoryTab {
  key: CategoryAmountType;
  label: string;
}

interface CategoryListProps {
  data: CategoryEntity[];
  isError: boolean;
  isLoading: boolean;
  tabLabel: string;
  t: (key: string, options?: any) => string;
}

const CategoryList: FC<CategoryListProps> = ({
  data,
  isError,
  isLoading,
  tabLabel,
  t,
}) => {
  if (isLoading) {
    return (
      <div className={styles.state}>
        <SpinLoading />
        <span>
          {t('categorySettings.loading')}
          {tabLabel}
          {t('categorySettings.category')}
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.empty}>
        <ErrorBlock
          status="default"
          title={`${tabLabel}${t('categorySettings.loadFail')}`}
          description={t('categorySettings.loadFailDesc')}
        />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={styles.empty}>
        <ErrorBlock
          status="empty"
          title={`${t('empty')}${tabLabel}${t('categorySettings.category')}`}
          description={t('categorySettings.emptyDesc')}
        />
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {data.map(item => (
        <div className={styles.item} key={item.id}>
          <div className={styles.icon}>
            <Icon name={item.icon} />
          </div>
          <div className={styles.itemMain}>
            <div className={styles.name}>{item.name}</div>
            <div className={styles.meta}>
              {tabLabel}
              {t('categorySettings.category')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CategorySettings: FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState<CategoryAmountType>('sub');
  const subCategoryQuery = useGetCategoryQuery({
    params: {
      type: 'sub',
    },
  });
  const addCategoryQuery = useGetCategoryQuery({
    params: {
      type: 'add',
    },
  });

  const categoryTabs = useMemo((): CategoryTab[] => [
    {
      key: 'sub',
      label: t('amount.expend'),
    },
    {
      key: 'add',
      label: t('amount.income'),
    },
  ], [t]);

  const activeTab = useMemo(() => {
    return categoryTabs.find(item => item.key === activeKey) || categoryTabs[0];
  }, [activeKey, categoryTabs]);
  const activeQuery = activeKey === 'sub' ? subCategoryQuery : addCategoryQuery;

  const handleBack = () => {
    playSound.turnPage();
    navigate(-1);
  };

  const handleChangeTab = (key: CategoryAmountType) => {
    if (key === activeKey)
      return;

    playSound.click();
    setActiveKey(key);
  };

  return (
    <div className="page">
      <NavBar back={t('nav.back')} onBack={handleBack}>
        {t('categorySettings.title')}
      </NavBar>
      <div className={styles.wrapper}>
        <div className={styles.notice}>
          {t('categorySettings.notice')}
        </div>
        <div className={styles.segmented} role="tablist" aria-label={`${t('categorySettings.category')}类型`}>
          {categoryTabs.map(tab => (
            <button
              aria-selected={activeKey === tab.key}
              className={activeKey === tab.key ? styles.segmentedActive : styles.segmentedItem}
              key={tab.key}
              onClick={() => handleChangeTab(tab.key)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <CategoryList
          data={activeQuery.data}
          isError={activeQuery.isError}
          isLoading={activeQuery.isLoading}
          tabLabel={activeTab.label}
          t={t}
        />
      </div>
    </div>
  );
};

export default CategorySettings;

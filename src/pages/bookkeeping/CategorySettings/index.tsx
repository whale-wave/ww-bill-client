import type { FC } from 'react';
import type { CategoryAmountType, CategoryEntity } from '@/api';
import { ErrorBlock, SpinLoading } from 'antd-mobile';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, NavBar } from '@/components/ui/index.ts';
import { useGetCategoryQuery } from '@/hooks';
import { playSound } from '@/modules';
import styles from './index.module.scss';

interface CategoryTab {
  key: CategoryAmountType;
  label: string;
}

const categoryTabs: CategoryTab[] = [
  {
    key: 'sub',
    label: '支出',
  },
  {
    key: 'add',
    label: '收入',
  },
];

interface CategoryListProps {
  data: CategoryEntity[];
  isError: boolean;
  isLoading: boolean;
  tabLabel: string;
}

const CategoryList: FC<CategoryListProps> = ({
  data,
  isError,
  isLoading,
  tabLabel,
}) => {
  if (isLoading) {
    return (
      <div className={styles.state}>
        <SpinLoading />
        <span>
          正在加载
          {tabLabel}
          分类
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.empty}>
        <ErrorBlock
          status="default"
          title={`${tabLabel}分类加载失败`}
          description="请稍后返回重试。"
        />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={styles.empty}>
        <ErrorBlock
          status="empty"
          title={`暂无${tabLabel}分类`}
          description="接口暂未返回可查看分类。"
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
              分类
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CategorySettings: FC = () => {
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

  const activeTab = useMemo(() => {
    return categoryTabs.find(item => item.key === activeKey) || categoryTabs[0];
  }, [activeKey]);
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
      <NavBar back="返回" onBack={handleBack}>
        类别设置
      </NavBar>
      <div className={styles.wrapper}>
        <div className={styles.notice}>
          当前仅支持查看，新增/编辑/删除待接口能力确认后开放。
        </div>
        <div className={styles.segmented} role="tablist" aria-label="分类类型">
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
        />
      </div>
    </div>
  );
};

export default CategorySettings;

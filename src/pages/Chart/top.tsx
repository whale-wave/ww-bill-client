import { FC, useRef, useState } from 'react';
import style from './top.module.scss';
import './top.module.scss';
// import { Icon } from 'bw-mobile';
import '../../components/tab-bar/tab-bar.scss';
import classNames from 'classnames';
import { Dropdown } from 'antd-mobile';
import { DemoBlock } from '@/components/demos/demo-block';
import { Icon } from 'bw-mobile';
import { DropdownRef } from 'antd-mobile/es/components/dropdown';

const Top: FC = () => {
  type selectedType = {
    moneyType: string;
    icon: string;
    duigo: string;
  };
  const [list] = useState(['周', '月', '年']);
  const [selectedActive, setSelectedActive] = useState(0);
  const ref = useRef<DropdownRef>(null);
  const [selectedAmountType] = useState<selectedType[]>([
    {
      moneyType: '支出',
      icon: 'huankuanzhichu-copy',
      duigo: 'duigou-cu',
    },
    {
      moneyType: '收入',
      icon: 'jiekuanshouru-copy',
      duigo: 'duigou-cu',
    },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);

  const itemListFn = (index: number) => {
    console.log(index, 'index');
    setActiveIndex(index);
  };

  const selectedFn = (index: number) => {
    console.log(index, 'index');
    setSelectedActive(index);
  };

  return (
    <div className={style.topContent}>
      <div className={style.top}>
        {/*<div>{AmountType}</div>*/}
        {/*<Icon name="xialaxuanze"></Icon>*/}
        <DemoBlock title="" padding={'0'}>
          <Dropdown
            ref={ref}
            closeOnClickAway={false}
            className={classNames(style.admDropdown)}
          >
            <Dropdown.Item
              key="sorter"
              title={selectedAmountType[selectedActive].moneyType}
              className={style.admDropdownItemActive}
            >
              <div
                className={classNames(style.downContent)}
                onClick={() => {
                  ref.current?.close();
                }}
              >
                {selectedAmountType.map((item, index) => (
                  <div
                    key={item.icon}
                    className={classNames(style['itemSelected'])}
                    onClick={() => selectedFn(index)}
                  >
                    <div>
                      <Icon
                        name={item.icon}
                        className={style['tab-icon']}
                      ></Icon>
                    </div>
                    <div>
                      <span className={style.name}>{item.moneyType}</span>
                      {index === selectedActive ? (
                        <Icon
                          name={item.duigo}
                          className={style['tab-icon-duigo']}
                        ></Icon>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Dropdown.Item>
          </Dropdown>
        </DemoBlock>
      </div>
      <div className={style.dateDay}>
        {list.map((item, i) => (
          <div
            className={classNames(
              style.itemList,
              activeIndex === i ? style.active : '',
            )}
            key={item}
            onClick={() => itemListFn(i)}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Top;

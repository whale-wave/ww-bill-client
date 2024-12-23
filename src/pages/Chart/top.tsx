import type { FC } from 'react';
import { useRef, useState } from 'react';
import classNames from 'classnames';
import { Dropdown } from 'antd-mobile';
import { Icon, NavBar } from 'bw-mobile';
import type { DropdownRef } from 'antd-mobile/es/components/dropdown';
import { useNavigate } from 'react-router-dom';
import style from './top.module.scss';
import '../../components/tab-bar/tab-bar.scss';

interface SelectedType {
  moneyType: string;
  icon: string;
  duigo: string;
}

interface StatusType {
  statusDetails: string;
}

const Top: FC<StatusType> = ({ statusDetails }) => {
  const [list] = useState(['周', '月', '年']);
  const [selectedActive, setSelectedActive] = useState(0);
  const dropdownWrapperRef = useRef<HTMLDivElement>(null);
  const ref = useRef<DropdownRef>(null);
  const [selectedAmountType] = useState<SelectedType[]>([
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
  const navigate = useNavigate();

  const itemListFn = (index: number) => {
    setActiveIndex(index);
  };

  const selectedFn = (index: number) => {
    setSelectedActive(index);
  };

  return (
    <div className={classNames(style.topContent)}>
      {/* eslint-disable-next-line style/multiline-ternary */}
      {statusDetails === '1' ? (
        <div className={style.top} ref={dropdownWrapperRef}>
          {/* <div>{AmountType}</div> */}
          {/* <Icon name="xialaxuanze"></Icon> */}
          <Dropdown
            ref={ref}
            closeOnClickAway={false}
            className={classNames(style.admDropdown)}
            getContainer={dropdownWrapperRef.current}
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
                    className={classNames(style.itemSelected)}
                    onClick={() => selectedFn(index)}
                  >
                    <div>
                      <Icon
                        name={item.icon}
                        className={style['tab-icon']}
                      >
                      </Icon>
                    </div>
                    <div>
                      <span className={style.name}>{item.moneyType}</span>
                      {index === selectedActive
                        ? (
                            <Icon
                              name={item.duigo}
                              className={style['tab-icon-duigo']}
                            >
                            </Icon>
                          )
                        : (
                            ''
                          )}
                    </div>
                  </div>
                ))}
              </div>
            </Dropdown.Item>
          </Dropdown>
        </div>
      ) : (
        <NavBar back="" onBack={() => navigate(-1)}>
          购物
        </NavBar>
      )}

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

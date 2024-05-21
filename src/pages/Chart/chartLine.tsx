import { FC } from 'react';
import styles from './chartLine.module.scss';
import { Line } from '@ant-design/charts';
import classNames from 'classnames';
// import { Icon } from 'bw-mobile';

type arrType = [
  {
    icon: string;
    year: string;
    name: string;
    value: number;
  },
];

const ChartLine: FC = () => {
  const data = [
    {
      year: '1991',
      value: 5,
      data: [
        {
          icon: '',
          year: '21/10/24',
          name: '优衣库',
          value: 298,
        },
        {
          icon: '',
          year: '21/10/24',
          name: '优衣库',
          value: 298,
        },
        {
          icon: '',
          year: '21/10/24',
          name: '优衣库',
          value: 298,
        },
      ],
    },
    {
      year: '1992',
      value: 4,
    },
    {
      year: '1993',
      value: 3.5,
    },
    {
      year: '1994',
      value: 5,
    },
    {
      year: '1995',
      value: 4.9,
    },
    {
      year: '1996',
      value: 6,
    },
    {
      year: '1997',
      value: 0,
    },
    {
      year: '1998',
      value: 9,
    },
    {
      year: '1999',
      value: 0,
    },
    {
      year: '2000',
      value: 14,
    },
    {
      year: '2002',
      value: 20,
    },
    {
      year: '2023',
      value: 50,
    },
  ];
  const config = {
    data,
    yField: 'value',
    xField: 'year',
    padding: [13, 8, 22, 8],
    autoFit: true,
    tooltip: {
      customContent: (title: any, items: any) => {
        return (
          <>
            <div className={styles.selectedItem}>
              <h5
                style={{
                  marginTop: 6,
                  display: 'flex',
                  justifyContent: 'center',
                }}
                className={styles.title}
              >
                最大三笔交易
              </h5>

              <ul style={{ paddingLeft: 0 }}>
                {items?.map((item: any) => {
                  const data = item.data.data as arrType;
                  console.log(item, 'item');
                  return (
                    <>
                      {data.map((t: any, i: any) => {
                        return (
                          <li
                            key={i}
                            className={classNames(
                              'g2-tooltip-list-item',
                              styles.chartList,
                            )}
                            data-index={i}
                          >
                            {/*<Icon name={item.icon} style={{ fontSize: 30 }} />*/}
                            <span
                              style={{
                                marginLeft: '8px',
                                marginRight: '8px',
                              }}
                            >
                              {t.year}
                            </span>
                            <span
                              style={{
                                marginRight: '8px',
                              }}
                            >
                              {t.name}
                            </span>
                            <span>{t.value}</span>
                          </li>
                        );
                      })}
                    </>
                  );
                })}
              </ul>
            </div>
          </>
        );
      },
    },
    point: {
      size: 5,
      shape: 'custom-point',
      style: function (a: any) {
        if (a.value === 0) {
          return {
            fill: 'white',
          };
        }
        return {
          fill: '#AEEEFF',
        };
      },
    },
    color: '#636363',
    /*
     * 显示数据的数量
     * */
    // label: {
    //   position: 'middle',
    //   style: {
    //     fill: '#000000',
    //     opacity: 0.6,
    //   },
    // },
    /*
     * 网格线
     * */
    // xAxis: {
    //   grid: { line: false, label: true },
    //   line: { style: { stroke: 'pink' } },
    // },
    xAxis: {
      //网格
      grid: null,
      tickLine: null,
      // line: { style: { stroke: 'pink' } },
    },

    // xAxis: {
    //   line: false,
    //   grid: {
    //     line: false,
    //     label: false,
    //   },
    //   // label: false,
    // },
    animation: {
      // 配置图表第一次加载时的入场动画
      appear: {
        animation: 'wave-in', // 动画效果
        duration: 2000, // 动画执行时间
      },
    },
  };
  return (
    <>
      <Line
        {...config}
        style={{
          width: '100%',
          minHeight: '28%',
          padding: '5px',
        }}
        className={styles.chart_wrapper}
        onReady={(plot) => {
          plot.on('plot:click', (evt: any) => {
            console.log(evt, 'evt');
            const { x, y } = evt;
            const { xField } = plot.options;
            console.log(xField, 'xField');
            const tooltipData = plot.chart.getTooltipItems({ x, y });
            console.log(tooltipData);
          });
        }}
      />
    </>
  );
};
export default ChartLine;

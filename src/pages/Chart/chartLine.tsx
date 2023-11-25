import { FC } from 'react';
import styles from './chartLine.module.scss';
import { Line } from '@ant-design/charts';

const ChartLine: FC = () => {
  const data = [
    {
      year: '1991',
      value: 3,
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
            <h5 style={{ marginTop: 16 }}>标题:{title}</h5>
            <ul style={{ paddingLeft: 0 }}>
              {items?.map((item: any, index: any) => {
                const { name, value, color } = item;
                console.log(item, 'item');
                return (
                  <li
                    key={item.data.year}
                    className="g2-tooltip-list-item"
                    data-index={index}
                    style={{
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      className="g2-tooltip-marker"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span
                      className={styles.span}
                      style={{
                        display: 'inline-flex',
                        flex: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ marginRight: 16 }}>name:{name}:</span>
                      <span className="g2-tooltip-list-item-value">
                        {value}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
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
          height: '22%',
          padding: '5px',
        }}
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

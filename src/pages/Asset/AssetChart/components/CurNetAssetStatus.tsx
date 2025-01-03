import type { FC } from 'react';
import { useAssetSummaryInfo } from '@/hooks';
import { formatAmount, math } from '@/utils';
import { THEME_COLOR } from '@/assets/styles/reset';

export const CurNetAssetStatus: FC = () => {
  const { info } = useAssetSummaryInfo();
  const total = math.add(info.addAsset, info.subAsset);
  let addPercent = total.isZero() ? 0.45 : math.divide(info.addAsset, total).toNumber();
  let subPercent = total.isZero() ? 0.55 : math.divide(info.subAsset, total).toNumber();
  if (addPercent > 0.85) {
    addPercent = 0.85;
    subPercent = 0.15;
  }
  else if (subPercent > 0.85) {
    subPercent = 0.85;
    addPercent = 0.15;
  }
  const subBgColor = '#3e414a';

  return (
    <div className="flex flex-col">
      <div className="text-base py-3">当前净资产状况</div>
      <div className="flex justify-between text-sm px-2 pb-2">
        <div>{formatAmount(info.addAsset)}</div>
        <div>{formatAmount(info.subAsset)}</div>
      </div>
      <div className="progress-bar h-[40px] flex font-bold">
        <div
          className="progress flex items-center pl-4 assets relative rounded-l-lg"
          style={{
            flex: addPercent,
            background: THEME_COLOR,
          }}
        >
          资产
          {
            addPercent > subPercent && (
              <>
                <div
                  className="absolute right-[-1px] top-0 w-[38px] h-[40.5px] bg-white"
                  style={{
                    clipPath: `polygon(30px 0, 100% 0, 30px 100%, 0 100%)`,
                  }}
                >
                </div>
                <div
                  className="absolute right-[-1px] top-[-0.5px] w-[30px] h-[40.5px]"
                  style={{
                    clipPath: `polygon(30px 0, 100% 0, 30px 100%, 0 100%)`,
                    background: subBgColor,
                  }}
                >
                </div>
              </>
            )
          }
        </div>
        <div
          className="progress flex items-center justify-end pr-4 liabilities relative rounded-r-lg text-[#fff]"
          style={{
            flex: subPercent,
            background: subBgColor,
          }}
        >
          负债
          {
            subPercent > addPercent && (
              <>
                <div
                  className="absolute left-[-1px] top-0 w-[38px] h-[41px] bg-[white]"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 8px 100%, 0 100%)`,
                  }}
                >
                </div>
                <div
                  className="absolute left-[-1px] top-0 w-[30px] h-[41px]"
                  style={{
                    clipPath: `polygon(0 0, 0 100%, 0 100%, 100% 0)`,
                    background: THEME_COLOR,
                  }}
                >
                </div>
              </>
            )
          }
        </div>
      </div>
      <div className="flex justify-between text-sm px-2 py-3 mt-3">
        <div>净资产</div>
        <div>{formatAmount(info.totalAsset)}</div>
      </div>
      <div className="flex justify-between text-sm px-2 py-3">
        <div>资产负债率</div>
        <div>
          {Number(info.addAsset) === 0
            ? '0'
            : formatAmount(
              math.multiply(math.divide(info.subAsset, info.addAsset), 100).toNumber(),
            )}
          %
        </div>
      </div>
    </div>
  );
};

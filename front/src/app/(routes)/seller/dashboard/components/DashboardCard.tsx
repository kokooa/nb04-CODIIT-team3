import { SalesData } from "@/types/dashboard";
import { Fragment } from "react";

const Labels = ["오늘", "이번 주", "이번 달", "올해"];
interface DashboardCardProps {
  data: SalesData | undefined;
}

const DashboardCard = ({ data }: DashboardCardProps) => {
  const formattedData = [data?.today, data?.week, data?.month, data?.year];

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-5">
        {formattedData.map((item, index) => {
          const totalOrders = item !== undefined && item.changeRate ? item?.changeRate.totalOrders : 0;
          const totalSales = item !== undefined && item.changeRate ? item?.changeRate.totalSales : 0;

          return (
            <Fragment key={index}>
              <div className="border-gray03 rounded-xl border p-5">
                <p className="text-black02 mb-7.5 text-base leading-none font-bold">{Labels[index]} 판매 건수</p>
                <p className="text-gray01 mb-2.5 text-sm leading-none">
                  이전 대비 {totalOrders === 0 ? null : totalOrders > 0 ? "▲" : "▼"}
                  {Math.abs(totalOrders)}%
                </p>
                <p className="text-[1.75rem] leading-none font-extrabold">
                  {item?.current.totalOrders.toLocaleString()}건
                </p>
              </div>

              <div className="border-gray03 rounded-xl border p-5">
                <p className="text-black02 mb-7.5 text-base leading-none font-bold">{Labels[index]} 판매 금액</p>
                <p className="text-gray01 mb-2.5 text-sm leading-none">
                  이전 대비 {totalSales === 0 ? null : totalSales > 0 ? "▲" : "▼"}
                  {Math.abs(totalSales)}%
                </p>
                <p className="text-[1.75rem] leading-none font-extrabold">
                  {item?.current.totalSales.toLocaleString()}원
                </p>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardCard;

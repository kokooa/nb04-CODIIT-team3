import { CustomPayloadEntry } from "@/types/dashboard";
import React from "react";

interface PieChartLegend {
  payload?: CustomPayloadEntry[];
}

const PieChartLegend = ({ payload }: PieChartLegend) => {
  if (!payload) return null;

  return (
    <div className="w-81 -translate-x-5 space-y-5">
      {payload.map((entry, index) => {
        const { value, color, payload: item } = entry;
        return (
          <div
            key={`item-${index}`}
            className="text-black01 flex gap-3 text-base leading-none font-bold"
          >
            <p className="text-lg leading-none font-extrabold">{index + 1}</p>
            <div
              className={`size-4.25 shrink-0 rounded-full`}
              style={{ backgroundColor: color }}
            />
            <p className="w-full overflow-hidden font-normal text-ellipsis whitespace-nowrap">{value}</p>
            <p className="text-gray01 shrink-0">{item.totalOrders}</p>
            {item.totalPrice && <p className="shrink-0">{item.totalPrice.toLocaleString()}원</p>}
          </div>
        );
      })}
    </div>
  );
};

export default PieChartLegend;

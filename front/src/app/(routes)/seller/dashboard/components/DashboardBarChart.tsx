import { PriceRange } from "@/types/dashboard";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis } from "recharts";

const COLORS = ["#55E39B", "#896DFF", "#2BD7E5", "#FFAA06", "#FFD600"];

interface BarChartProps {
  data: PriceRange[] | undefined;
}

const DashboardBarChart = ({ data }: BarChartProps) => {
  return (
    <div className="border-gray03 h-79 w-full rounded-xl border">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{ top: 40, right: 20, left: 20, bottom: 20 }}
        >
          <XAxis
            dataKey="priceRange"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 16, fill: "#2d2d2d" }}
          />

          <Bar
            dataKey="percentage"
            barSize={12}
          >
            {data?.map((_, i) => (
              <Cell
                key={i}
                fill={COLORS[i % COLORS.length]}
                radius={24}
              />
            ))}
            <LabelList
              dataKey="percentage"
              position="top"
              formatter={(value: number) => `${value}%`}
              fill="#A2A2A2"
              offset={15}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardBarChart;

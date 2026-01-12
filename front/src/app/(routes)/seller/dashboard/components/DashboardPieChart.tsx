import { TopSale } from "@/types/dashboard";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import PieChartLabel from "./PieChartLabel";
import PieChartLegend from "./PieChartLegend";

const COLORS = ["#896DFF", "#55E39B", "#2BD7E5", "#FFAA06", "#FFD600"];

interface PieChartProps {
  data: TopSale[] | undefined;
}

const DashboardPieChart = ({ data }: PieChartProps) => {
  const formattedData = data?.map((item) => {
    return {
      id: item.product.id,
      name: item.product.name,
      totalOrders: item.totalOrders,
      totalPrice: item.product.price * item.totalOrders,
    };
  });

  return (
    <div className="border-gray03 h-79 w-full rounded-xl border">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart margin={{ top: 10, right: 10, left: 30, bottom: 10 }}>
          <Pie
            data={formattedData}
            dataKey="totalOrders"
            nameKey="name"
            cx="40%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            fill="#8884d8"
            label={PieChartLabel}
            labelLine={false}
          >
            {formattedData?.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value}개`}
            labelStyle={{ fill: "#a2a2a2" }}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ color: "#a2a2a2", fill: "#a2a2a2" }}
            content={<PieChartLegend />}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardPieChart;

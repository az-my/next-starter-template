import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";

const chartData = [
  { name: "Jan", value: 30 },
  { name: "Feb", value: 50 },
  { name: "Mar", value: 40 },
  { name: "Apr", value: 60 },
  { name: "May", value: 80 },
  { name: "Jun", value: 70 },
];

export function ChartAreaInteractive() {
  return (
    <div className="bg-card rounded-xl p-6 shadow">
      <h3 className="font-semibold mb-4">Monthly Activity</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 
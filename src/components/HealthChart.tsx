import { HealthData } from '@/services/healthData';
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface HealthChartProps {
  data: HealthData[];
}

export const HealthChart = ({ data }: HealthChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(time) => new Date(time).toLocaleTimeString()}
        />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip
          labelFormatter={(label) => new Date(label).toLocaleString()}
          formatter={(value, name) => [value, name === 'heartRate' ? 'Heart Rate' : 'Oxygen Level']}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="heartRate"
          stroke="#ff4d4f"
          dot={false}
          name="Heart Rate"
        />
        <Bar
          yAxisId="right"
          dataKey="oxygenLevel"
          fill="#4096ff"
          name="Oxygen Level"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
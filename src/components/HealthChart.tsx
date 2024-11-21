import { HealthData } from '@/services/healthData';
import {
  CartesianGrid,
  Line,
  LineChart,
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
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(time) => new Date(time).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
        />
        <YAxis yAxisId="heartRate" />
        <YAxis yAxisId="bloodOxygen" orientation="right" />
        <Tooltip
          labelFormatter={(label) => new Date(label).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
          formatter={(value, name) => {
            if (name === 'Heart Rate') return [`${value} BPM`, name];
            return [`${value}%`, name];
          }}
        />
        <Line
          yAxisId="heartRate"
          type="monotone"
          dataKey="heartRate"
          stroke="#ff4d4f"
          dot={false}
          name="Heart Rate"
        />
        <Line
          yAxisId="bloodOxygen"
          type="monotone"
          dataKey="bloodOxygen"
          stroke="#4096ff"
          dot={false}
          name="Blood Oxygen"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
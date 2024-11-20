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
        <YAxis />
        <Tooltip
          labelFormatter={(label) => new Date(label).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
          formatter={(value) => [`${value} BPM`, 'Heart Rate']}
        />
        <Line
          type="monotone"
          dataKey="heartRate"
          stroke="#ff4d4f"
          dot={false}
          name="Heart Rate"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
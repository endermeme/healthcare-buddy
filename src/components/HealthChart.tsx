import { HealthData } from '@/services/healthData';
import {
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
      <LineChart 
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <XAxis
          dataKey="timestamp"
          tickFormatter={(time) => new Date(time).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
          stroke="#94a3b8"
          fontSize={12}
          interval="preserveStartEnd"
          minTickGap={50}
          style={{
            strokeWidth: 1,
          }}
        />
        <YAxis 
          yAxisId="heartRate" 
          stroke="#94a3b8"
          fontSize={12}
          domain={[60, 100]}
          ticks={[60, 70, 80, 90, 100]}
          tickLine={true}
          axisLine={true}
          style={{
            strokeWidth: 1,
          }}
          interval={0}
        />
        <YAxis 
          yAxisId="bloodOxygen" 
          orientation="right" 
          stroke="#94a3b8"
          fontSize={12}
          domain={[90, 100]}
          ticks={[90, 95, 100]}
          tickLine={true}
          axisLine={true}
          style={{
            strokeWidth: 1,
          }}
          interval={0}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
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
          strokeWidth={2}
          dot={false}
          name="Heart Rate"
        />
        <Line
          yAxisId="bloodOxygen"
          type="monotone"
          dataKey="bloodOxygen"
          stroke="#4096ff"
          strokeWidth={2}
          dot={false}
          name="Blood Oxygen"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
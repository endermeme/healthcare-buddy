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
          tickFormatter={(time) => new Date(time).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
          })}
          stroke="#94a3b8"
          fontSize={14}
          interval={Math.ceil(data.length / 5)}
          tickLine={false}
          axisLine={true}
        />
        <YAxis 
          yAxisId="heartRate" 
          stroke="#94a3b8"
          fontSize={14}
          domain={[60, 100]}
          ticks={[60, 70, 80, 90, 100]}
          tickLine={false}
          axisLine={true}
          orientation="left"
          tickCount={5}
        />
        <YAxis 
          yAxisId="bloodOxygen" 
          orientation="right" 
          stroke="#94a3b8"
          fontSize={14}
          domain={[90, 100]}
          ticks={[90, 95, 100]}
          tickLine={false}
          axisLine={true}
          tickCount={3}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelFormatter={(label) => new Date(label).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
          })}
          formatter={(value, name) => {
            if (name === 'Heart Rate') return [`${value} BPM`, name];
            return [`${value}%`, name];
          }}
        />
        <Line
          yAxisId="heartRate"
          type="monotone"
          dataKey="heartRate"
          stroke="#ef4444"
          strokeWidth={3}
          dot={true}
          activeDot={{ r: 6 }}
          name="Heart Rate"
        />
        <Line
          yAxisId="bloodOxygen"
          type="monotone"
          dataKey="bloodOxygen"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={true}
          activeDot={{ r: 6 }}
          name="Blood Oxygen"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
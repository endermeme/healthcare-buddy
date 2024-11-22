import { HealthData } from '@/services/healthData';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface HealthChartProps {
  data: HealthData[];
}

export const HealthChart = ({ data }: HealthChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart 
        data={data}
        margin={{ top: 40, right: 40, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(time) => new Date(time).toLocaleTimeString('vi-VN', { 
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit'
          })}
          stroke="#94a3b8"
          fontSize={12}
          dy={10}
          tickLine={false}
          axisLine={{ strokeWidth: 1 }}
        />
        <YAxis 
          yAxisId="heartRate" 
          stroke="#94a3b8"
          fontSize={12}
          tickCount={6}
          domain={['dataMin - 10', 'dataMax + 10']}
          dx={-10}
          tickLine={false}
          axisLine={{ strokeWidth: 1 }}
        />
        <YAxis 
          yAxisId="bloodOxygen" 
          orientation="right" 
          stroke="#94a3b8"
          fontSize={12}
          tickCount={6}
          domain={['dataMin - 5', 'dataMax + 5']}
          dx={10}
          tickLine={false}
          axisLine={{ strokeWidth: 1 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          labelFormatter={(label) => new Date(label).toLocaleString('vi-VN', { 
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit'
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
          stroke="#ff4d4f"
          strokeWidth={2.5}
          dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 2 }}
          name="Heart Rate"
          connectNulls
        />
        <Line
          yAxisId="bloodOxygen"
          type="monotone"
          dataKey="bloodOxygen"
          stroke="#4096ff"
          strokeWidth={2.5}
          dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 2 }}
          name="Blood Oxygen"
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
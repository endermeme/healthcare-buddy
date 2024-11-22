import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { HealthData } from '@/services/healthData';

interface HealthChartProps {
  data: HealthData[];
}

export const HealthChart = ({ data }: HealthChartProps) => {
  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] p-2 md:p-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{ top: 30, right: 40, left: 30, bottom: 30 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            horizontal={true}
            vertical={false}
          />
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
            padding={{ left: 30, right: 30 }}
          />
          <YAxis 
            yAxisId="heartRate" 
            stroke="#94a3b8"
            fontSize={12}
            tickCount={10}
            domain={[0, 'dataMax + 20']}
            dx={-10}
            tickLine={false}
            axisLine={{ strokeWidth: 1 }}
          />
          <YAxis 
            yAxisId="bloodOxygen" 
            orientation="right" 
            stroke="#94a3b8"
            fontSize={12}
            tickCount={10}
            domain={[0, 100]}
            dx={10}
            tickLine={false}
            axisLine={{ strokeWidth: 1 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
            labelFormatter={(label) => new Date(label).toLocaleString('vi-VN', { 
              timeZone: 'Asia/Ho_Chi_Minh',
              hour: '2-digit',
              minute: '2-digit'
            })}
            formatter={(value, name) => {
              if (name === 'Heart Rate') return [`${value} BPM`, 'Nhịp tim'];
              return [`${value}%`, 'SpO2'];
            }}
          />
          <Line
            yAxisId="heartRate"
            type="monotone"
            dataKey="heartRate"
            stroke="#ff4d4f"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 5, strokeWidth: 2 }}
            name="Heart Rate"
            connectNulls
          />
          <Line
            yAxisId="bloodOxygen"
            type="monotone"
            dataKey="bloodOxygen"
            stroke="#4096ff"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
            activeDot={{ r: 5, strokeWidth: 2 }}
            name="Blood Oxygen"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
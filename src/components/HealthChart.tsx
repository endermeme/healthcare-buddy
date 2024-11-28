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
  const maxHeartRate = Math.max(...data.map(d => d.heartRate));
  const maxBloodOxygen = Math.max(...data.map(d => d.bloodOxygen));
  const maxValue = Math.max(maxHeartRate, maxBloodOxygen);
  const yAxisMax = Math.ceil((maxValue + 10) / 10) * 10;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="text-sm font-medium">
            {new Date(label).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
          <p className="text-sm text-red-500">
            Nhịp tim: {payload[0].value} BPM
          </p>
          <p className="text-sm text-blue-500">
            SpO2: {payload[1].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[550px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{ top: 20, right: 0, left: -10, bottom: 20 }}
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
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
            stroke="#94a3b8"
            fontSize={12}
            dy={10}
            tickLine={false}
            axisLine={{ strokeWidth: 1 }}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis 
            yAxisId="heartRate" 
            stroke="#94a3b8"
            fontSize={12}
            tickCount={8}
            domain={[0, yAxisMax]}
            dx={0}
            tickLine={false}
            axisLine={{ strokeWidth: 1 }}
          />
          <YAxis 
            yAxisId="bloodOxygen" 
            orientation="right" 
            stroke="#94a3b8"
            fontSize={12}
            tickCount={8}
            domain={[0, yAxisMax]}
            dx={0}
            tickLine={false}
            axisLine={{ strokeWidth: 1 }}
          />
          <Tooltip content={<CustomTooltip />} />
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
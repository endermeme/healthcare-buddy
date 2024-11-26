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
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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
            {format(new Date(label), 'HH:mm:ss', { locale: vi })}
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
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(time) => format(new Date(time), 'HH:mm:ss', { locale: vi })}
          />
          <YAxis domain={[0, yAxisMax]} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="heartRate"
            stroke="#ff4d4f"
            name="Nhịp tim"
            dot={{ strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="bloodOxygen"
            stroke="#4096ff"
            name="SpO2"
            dot={{ strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
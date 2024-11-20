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
  // Check if we have any heart rate or oxygen level data
  const hasHeartRate = data.some(d => d.heartRate !== undefined);
  const hasOxygenLevel = data.some(d => d.oxygenLevel !== undefined);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(time) => new Date(time).toLocaleTimeString()}
        />
        
        {/* Only show heart rate axis and line if we have heart rate data */}
        {hasHeartRate && (
          <>
            <YAxis 
              yAxisId="left" 
              label={{ value: 'Heart Rate (BPM)', angle: -90, position: 'insideLeft' }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="heartRate"
              stroke="#ff4d4f"
              dot={false}
              name="Heart Rate"
            />
          </>
        )}

        {/* Only show oxygen level axis and bar if we have oxygen level data */}
        {hasOxygenLevel && (
          <>
            <YAxis 
              yAxisId="right" 
              orientation="right"
              label={{ value: 'Oxygen Level (%)', angle: 90, position: 'insideRight' }}
            />
            <Bar
              yAxisId="right"
              dataKey="oxygenLevel"
              fill="#4096ff"
              name="Oxygen Level"
            />
          </>
        )}

        <Tooltip
          labelFormatter={(label) => new Date(label).toLocaleString()}
          formatter={(value, name) => [value, name === 'heartRate' ? 'Heart Rate' : 'Oxygen Level']}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
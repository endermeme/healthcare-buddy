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
import { TimeRange } from '@/hooks/useHealthData';

interface HealthChartProps {
  data: HealthData[];
  timeRange?: TimeRange;
}

export const HealthChart = ({ data, timeRange = '10m' }: HealthChartProps) => {
  const maxHeartRate = Math.max(...data.map(d => d.heartRate));
  const maxBloodOxygen = Math.max(...data.map(d => d.bloodOxygen));
  const maxValue = Math.max(maxHeartRate, maxBloodOxygen);
  const yAxisMax = Math.ceil((maxValue + 10) / 10) * 10;

  // Transform data to include validity state
  const transformedData = data.map(d => ({
    ...d,
    validHeartRate: d.bloodOxygen > 0 ? d.heartRate : null,
    invalidHeartRate: d.bloodOxygen === 0 ? 0 : null, // Set to 0 for bottom line
  }));

  const getTickCount = () => {
    switch (timeRange) {
      case '10m':
        return 10;
      case '1h':
        return 12;
      case '1d':
        return 24;
      default:
        return 10;
    }
  };

  const formatXAxisTick = (timestamp: string) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '10m':
        return date.toLocaleTimeString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour: '2-digit',
          minute: '2-digit'
        });
      case '1h':
        return date.toLocaleTimeString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour: '2-digit',
          minute: '2-digit'
        });
      case '1d':
        return date.toLocaleTimeString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour: '2-digit'
        });
      default:
        return date.toLocaleTimeString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[550px] overflow-x-auto">
        <div className="min-w-[800px] h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={transformedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e2e8f0" 
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxisTick}
                stroke="#94a3b8"
                fontSize={12}
                dy={10}
                tickLine={false}
                axisLine={{ strokeWidth: 1 }}
                padding={{ left: 20, right: 20 }}
                interval="preserveStartEnd"
                minTickGap={80}
                ticks={Array.from({ length: getTickCount() }, (_, i) => {
                  const firstTimestamp = new Date(data[0]?.timestamp || Date.now()).getTime();
                  const lastTimestamp = new Date(data[data.length - 1]?.timestamp || Date.now()).getTime();
                  return firstTimestamp + (i * (lastTimestamp - firstTimestamp) / (getTickCount() - 1));
                })}
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
                  if (name === 'validHeartRate') return [`${value} BPM`, 'Nhịp tim (có SpO2)'];
                  if (name === 'invalidHeartRate') return [`${value} BPM`, 'Nhịp tim (không có SpO2)'];
                  return [`${value}%`, 'SpO2'];
                }}
              />
              {/* Invalid heart rate data (green line at bottom) */}
              <Line
                yAxisId="heartRate"
                type="monotone"
                dataKey="invalidHeartRate"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Invalid Heart Rate"
                connectNulls
              />
              {/* Valid heart rate data (red line) */}
              <Line
                yAxisId="heartRate"
                type="monotone"
                dataKey="validHeartRate"
                stroke="#ff4d4f"
                strokeWidth={2}
                dot={false}
                name="Valid Heart Rate"
                connectNulls
              />
              {/* Blood oxygen data (blue line) */}
              <Line
                yAxisId="bloodOxygen"
                type="monotone"
                dataKey="bloodOxygen"
                stroke="#4096ff"
                strokeWidth={2}
                dot={false}
                name="Blood Oxygen"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#ff4d4f] rounded-sm"></div>
          <span>Nhịp tim (có SpO2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#22c55e] rounded-sm"></div>
          <span>Nhịp tim (không có SpO2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#4096ff] rounded-sm"></div>
          <span>SpO2</span>
        </div>
      </div>
    </div>
  );
};
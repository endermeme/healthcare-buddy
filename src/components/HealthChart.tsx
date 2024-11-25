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

  // Tính toán số điểm dữ liệu hiển thị trên trục X
  const getTickCount = () => {
    switch (timeRange) {
      case '10m':
        return 10; // Mỗi phút
      case '1h':
        return 12; // Mỗi 5 phút
      case '1d':
        return 24; // Mỗi giờ
      default:
        return 10;
    }
  };

  // Format nhãn thời gian tùy theo khoảng thời gian
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
            tickFormatter={formatXAxisTick}
            stroke="#94a3b8"
            fontSize={12}
            dy={10}
            tickLine={false}
            axisLine={{ strokeWidth: 1 }}
            padding={{ left: 0, right: 0 }}
            interval="preserveStartEnd"
            minTickGap={50}
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
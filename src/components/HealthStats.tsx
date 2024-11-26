import { HealthData } from '@/services/healthData';
import { Heart, Droplets } from 'lucide-react';
import { TimeRange } from '@/hooks/useHealthData';

interface HealthStatsProps {
  data: HealthData | null;
  averages: {
    avgHeartRate: number;
    avgBloodOxygen: number;
  };
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
}

export const HealthStats = ({ data, timeRange, onTimeRangeChange }: HealthStatsProps) => {
  return (
    <div className="space-y-6">
      {/* Heart Rate Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-black" />
          <h3 className="text-lg font-medium">Nhịp tim</h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold">-</span>
          <span className="text-lg">BPM</span>
        </div>
      </div>

      {/* Blood Oxygen Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-black" />
          <h3 className="text-lg font-medium">SpO2</h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold">-</span>
          <span className="text-lg">%</span>
        </div>
      </div>

      {/* Time Range Buttons */}
      <div className="flex gap-2 text-sm">
        <button 
          onClick={() => onTimeRangeChange('5m')}
          className={`px-3 py-1 rounded-full border ${timeRange === '5m' ? 'bg-gray-200 border-gray-300' : 'border-gray-300'}`}
        >
          5 phút
        </button>
        <button 
          onClick={() => onTimeRangeChange('15m')}
          className={`px-3 py-1 rounded-full border ${timeRange === '15m' ? 'bg-gray-200 border-gray-300' : 'border-gray-300'}`}
        >
          15 phút
        </button>
        <button 
          onClick={() => onTimeRangeChange('30m')}
          className={`px-3 py-1 rounded-full border ${timeRange === '30m' ? 'bg-gray-200 border-gray-300' : 'border-gray-300'}`}
        >
          30 phút
        </button>
        <button 
          onClick={() => onTimeRangeChange('1h')}
          className={`px-3 py-1 rounded-full border ${timeRange === '1h' ? 'bg-gray-200 border-gray-300' : 'border-gray-300'}`}
        >
          1 giờ
        </button>
      </div>
    </div>
  );
};
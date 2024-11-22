import { HealthData } from '@/services/healthData';
import { Heart, Droplets } from 'lucide-react';
import { TimeRange } from '@/hooks/useHealthData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HealthStatsProps {
  data: HealthData | null;
  averages: {
    avgHeartRate: number;
    avgBloodOxygen: number;
  };
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
}

export const HealthStats = ({ data, averages, timeRange, onTimeRangeChange }: HealthStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="health-card bg-stats-health">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-medium">Nhịp tim</h3>
          </div>
          <Select
            value={timeRange}
            onValueChange={onTimeRangeChange}
          >
            <SelectTrigger className="w-[80px] h-7 text-xs">
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60s">1 phút</SelectItem>
              <SelectItem value="1h">1 giờ</SelectItem>
              <SelectItem value="6h">6 giờ</SelectItem>
              <SelectItem value="24h">24 giờ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums">{data?.heartRate || '--'}</span>
            <span className="text-xs text-gray-500">BPM</span>
          </div>
          <div className="text-xs text-gray-500 tabular-nums">
            {data ? `TB: ${averages.avgHeartRate}` : ''}
          </div>
        </div>
      </div>

      <div className="health-card bg-stats-water">
        <div className="flex items-center gap-1.5 mb-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-medium">SpO2</h3>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums">{data?.bloodOxygen || '--'}</span>
            <span className="text-xs text-gray-500">%</span>
          </div>
          <div className="text-xs text-gray-500 tabular-nums">
            {data ? `TB: ${averages.avgBloodOxygen}%` : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
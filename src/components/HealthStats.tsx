import { HealthData } from '@/services/healthData';
import { Heart, Droplets } from 'lucide-react';

interface HealthStatsProps {
  data: HealthData | null;
  averages: {
    avgHeartRate: number;
    avgBloodOxygen: number;
  };
}

export const HealthStats = ({ data, averages }: HealthStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto px-4">
      <div className="health-card bg-white shadow-sm">
        <div className="flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-medium">Nhịp tim</h3>
        </div>
        <div className="mt-1.5 flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tabular-nums sm:text-2xl">{data?.heartRate || '--'}</span>
            <span className="text-xs text-gray-500">BPM</span>
          </div>
          <div className="text-xs text-gray-500 tabular-nums">
            {data ? `TB: ${averages.avgHeartRate}` : ''}
          </div>
        </div>
      </div>

      <div className="health-card bg-white shadow-sm">
        <div className="flex items-center gap-1.5">
          <Droplets className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-medium">SpO2</h3>
        </div>
        <div className="mt-1.5 flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tabular-nums sm:text-2xl">{data?.bloodOxygen || '--'}</span>
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
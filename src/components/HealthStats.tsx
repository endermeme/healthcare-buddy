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
    <div className="grid grid-cols-2 gap-4">
      <div className="health-card bg-stats-health">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="text-red-500" />
          <h3 className="font-semibold">Heart Rate</h3>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-3xl font-bold">{data?.heartRate || '--'}</span>
            <span className="text-gray-500 ml-2">BPM</span>
          </div>
          <div className="text-sm text-gray-500">
            {data ? `Avg: ${averages.avgHeartRate} BPM` : ''}
          </div>
        </div>
      </div>

      <div className="health-card bg-stats-health">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="text-blue-500" />
          <h3 className="font-semibold">Blood Oxygen</h3>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-3xl font-bold">{data?.bloodOxygen || '--'}</span>
            <span className="text-gray-500 ml-2">%</span>
          </div>
          <div className="text-sm text-gray-500">
            {data ? `Avg: ${averages.avgBloodOxygen}%` : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
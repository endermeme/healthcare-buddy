import { useState } from 'react';
import { useHealthData, TimeRange } from '../hooks/useHealthData';
import { HealthStats } from '@/components/HealthStats';
import { HealthChart } from '@/components/HealthChart';
import { WaterIntakeProgress } from '@/components/WaterIntakeProgress';
import { WaterIntakeTimeline } from '@/components/WaterIntakeTimeline';

const Index = ({ onBack }: { onBack: () => void }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('5m');
  const { currentData, history, averages } = useHealthData(timeRange);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <HealthStats
            data={currentData}
            averages={averages}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          <WaterIntakeProgress
            heartRate={currentData?.heartRate || null}
            bloodOxygen={currentData?.bloodOxygen || null}
          />
        </div>
        <WaterIntakeTimeline />
      </div>
      <div className="bg-white rounded-2xl shadow-sm">
        <HealthChart data={history} />
      </div>
    </div>
  );
};

export default Index;
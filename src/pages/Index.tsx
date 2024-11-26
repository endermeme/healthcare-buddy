import { useHealthData } from '@/hooks/useHealthData';
import { HealthStats } from '@/components/HealthStats';
import { WaterIntakeProgress } from '@/components/WaterIntakeProgress';

const Index = () => {
  const { currentData } = useHealthData('5m');

  return (
    <div className="min-h-screen bg-white px-4 py-2">
      {/* Header with emojis */}
      <div className="overflow-x-auto whitespace-nowrap mb-2">
        <div className="flex gap-1">
          {"❤️🏃💪🧘‍♀️🫀🏊‍♂️❤️🏃💪🧘‍♀️🫀🏊‍♂️❤️"}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-left mb-6">Nhịp đập số</h1>

      {/* Health Stats */}
      <div className="space-y-6">
        <HealthStats 
          data={currentData} 
          averages={{avgHeartRate: 0, avgBloodOxygen: 0}}
          timeRange="5m"
          onTimeRangeChange={() => {}}
        />
      </div>

      {/* Water Intake Section */}
      <div className="mt-6">
        <WaterIntakeProgress
          heartRate={currentData?.heartRate ?? null}
          bloodOxygen={currentData?.bloodOxygen ?? null}
        />
      </div>
    </div>
  );
};

export default Index;
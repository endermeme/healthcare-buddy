import { useState } from 'react';
import { useHealthData, TimeRange } from '../hooks/useHealthData';
import { LineChart } from 'react-native-chart-kit';
import { Button } from '@/components/ui/button';

const Index = ({ onBack }: { onBack: () => void }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('5m');
  const { currentData, history, averages } = useHealthData(timeRange);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Health Monitor</h1>
        <Button onClick={onBack} variant="outline">
          Back to Scan
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-medium mb-2">Heart Rate</h2>
          <div className="text-2xl font-bold">
            {currentData?.heartRate || '--'} BPM
          </div>
          <div className="text-sm text-gray-500">
            Avg: {averages.avgHeartRate}
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-medium mb-2">SpO2</h2>
          <div className="text-2xl font-bold">
            {currentData?.bloodOxygen || '--'}%
          </div>
          <div className="text-sm text-gray-500">
            Avg: {averages.avgBloodOxygen}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
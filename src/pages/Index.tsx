import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useHealthData, TimeRange } from '@/hooks/useHealthData';
import { HealthChart } from '@/components/HealthChart';

const Index = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('60s');
  const { currentData, history, averages } = useHealthData(timeRange);

  const timeRanges = [
    { value: '60s' as TimeRange, label: '1 Minute' },
    { value: '1h' as TimeRange, label: '1 Hour' },
    { value: '6h' as TimeRange, label: '6 Hours' },
    { value: '24h' as TimeRange, label: '24 Hours' },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <span className="text-lg font-medium">Jillian Hanson</span>
        </div>
      </header>

      <main className="p-4">
        <h1 className="text-2xl font-bold mb-1">Health Monitoring</h1>
        <p className="text-gray-600 mb-4">Real-time Heart Rate Data</p>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {timeRanges.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTimeRange(value)}
              className={`px-4 py-2 rounded-lg border ${
                timeRange === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="text-red-500" size={24} />
            <span className="text-lg font-semibold">Heart Rate</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-3xl font-bold">
              {currentData?.heartRate || '--'}
              <span className="text-base text-gray-600 ml-1">BPM</span>
            </div>
            <div className="text-sm text-gray-600">
              Avg: {averages.avgHeartRate} BPM
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <HealthChart data={history} />
        </div>
      </main>
    </div>
  );
};

export default Index;
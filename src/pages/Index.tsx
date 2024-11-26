import { useState, useEffect } from 'react';
import { HealthChart } from '@/components/HealthChart';
import { HealthStats } from '@/components/HealthStats';
import { calculateAverages, type HealthData } from '@/services/healthData';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Index = () => {
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const averages = calculateAverages(healthData);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-6">
            <HealthStats 
              data={healthData[healthData.length - 1]} 
              averages={averages}
              timeRange="1m"
              onTimeRangeChange={() => {}}
            />
            <HealthChart data={healthData} />
            
            <div className="space-y-4">
              <h3 className="font-medium">Chi tiết đo trong 1 phút</h3>
              <div className="grid gap-2">
                {healthData.map((data) => (
                  <div 
                    key={data.timestamp}
                    className="p-3 bg-gray-50 rounded-lg text-sm grid grid-cols-3 gap-4"
                  >
                    <span className="font-medium">
                      {format(new Date(data.timestamp), 'HH:mm:ss', { locale: vi })}
                    </span>
                    <span className="text-red-500">
                      Nhịp tim: {data.heartRate} BPM
                    </span>
                    <span className="text-blue-500">
                      SpO2: {data.bloodOxygen}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
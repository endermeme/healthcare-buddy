import { Card } from '@/components/ui/card';
import { Clock, Activity, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { type HourLog } from '@/services/logService';
import { HealthChart } from './HealthChart';

interface LogCardProps {
  log: HourLog;
  onClick: () => void;
}

export const LogCard = ({ log, onClick }: LogCardProps) => {
  const hourTime = new Date(log.timestamp);
  
  // Calculate minute-by-minute averages for the chart
  const minuteAverages = log.minuteLogs.map(minute => {
    const avgHeartRate = minute.secondsData.reduce((sum, data) => sum + data.heartRate, 0) / minute.secondsData.length;
    const avgBloodOxygen = minute.secondsData.reduce((sum, data) => sum + data.bloodOxygen, 0) / minute.secondsData.length;
    return {
      timestamp: minute.minute,
      heartRate: Math.round(avgHeartRate),
      bloodOxygen: Math.round(avgBloodOxygen)
    };
  });

  // Get latest readings
  const lastMinute = log.minuteLogs[log.minuteLogs.length - 1];
  const lastReading = lastMinute?.secondsData[lastMinute.secondsData.length - 1];

  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {format(hourTime, 'HH:mm', { locale: vi })}
            </span>
          </div>
          <div className="text-sm">
            {lastMinute?.isRecording ? (
              <span className="text-blue-500">Đang ghi...</span>
            ) : (
              <span className="text-green-500">Đã hoàn tất</span>
            )}
          </div>
        </div>

        <div className="h-[200px] w-full">
          <HealthChart data={minuteAverages} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-600">
              {lastReading?.heartRate || 0} BPM
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              {lastReading?.bloodOxygen || 0}%
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {log.minuteLogs.length} phút đã ghi
        </div>
      </div>
    </Card>
  );
};
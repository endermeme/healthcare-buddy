import { Card } from '@/components/ui/card';
import { Clock, Activity, Heart } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { vi } from 'date-fns/locale';
import { HourlyLog } from '@/services/healthData';
import { sendLogCompletionNotification } from '@/services/firebase';
import { useEffect } from 'react';

interface LogCardProps {
  log: HourlyLog;
  onClick: () => void;
}

export const LogCard = ({ log, onClick }: LogCardProps) => {
  const hourTime = new Date(log.hour);
  const currentTime = new Date();
  const isComplete = isAfter(currentTime, new Date(log.hour));
  
  useEffect(() => {
    if (isComplete) {
      sendLogCompletionNotification(log);
    }
  }, [isComplete, log]);

  // Format time in Vietnam timezone
  const formattedTime = formatInTimeZone(
    hourTime,
    'Asia/Ho_Chi_Minh',
    'HH:00',
    { locale: vi }
  );

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (isComplete) return 100;
    
    const currentMinute = currentTime.getMinutes();
    return Math.min(Math.round((currentMinute / 60) * 100), 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{formattedTime}</span>
          </div>
          <div className="text-sm">
            {isComplete ? (
              <span className="text-green-500">Đã hoàn tất</span>
            ) : (
              <span className="text-blue-500">{completionPercentage}%</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-600">
              {log.averageHeartRate} BPM
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              {log.averageBloodOxygen}%
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {log.secondsData.length} lần đo
        </div>
      </div>
    </Card>
  );
};

import { Card } from '@/components/ui/card';
import { Clock, Activity, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SecondData {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

export interface MinuteLog {
  minute: string;
  isRecording: boolean;
  secondsData: SecondData[];
  avgHeartRate: number;
  avgBloodOxygen: number;
}

interface LogCardProps {
  log: MinuteLog;
  onClick: () => void;
}

export const LogCard = ({ log, onClick }: LogCardProps) => {
  const minuteTime = new Date(log.minute);

  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {format(minuteTime, 'HH:mm', { locale: vi })}
            </span>
          </div>
          <div className="text-sm">
            {log.isRecording ? (
              <span className="text-blue-500">Đang ghi...</span>
            ) : (
              <span className="text-green-500">Đã hoàn tất</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-600">
              {log.avgHeartRate} BPM
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              {log.avgBloodOxygen}%
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {log.secondsData.length} giây đã ghi
        </div>
      </div>
    </Card>
  );
};
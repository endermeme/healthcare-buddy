import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type HourLog } from '@/services/logService';
import { HealthChart } from './HealthChart';
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface LogDetailProps {
  log: HourLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogDetail = ({ log, open, onOpenChange }: LogDetailProps) => {
  if (!log) return null;

  // Calculate minute averages for the chart
  const minuteAverages = log.minuteLogs.map(minute => {
    const avgHeartRate = minute.secondsData.reduce((sum, data) => sum + data.heartRate, 0) / minute.secondsData.length;
    const avgBloodOxygen = minute.secondsData.reduce((sum, data) => sum + data.bloodOxygen, 0) / minute.secondsData.length;
    return {
      timestamp: minute.minute,
      heartRate: Math.round(avgHeartRate),
      bloodOxygen: Math.round(avgBloodOxygen)
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Chi tiết giờ {format(new Date(log.timestamp), 'HH:mm', { locale: vi })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <HealthChart data={minuteAverages} />
          
          <ScrollArea className="h-[300px] rounded-md border">
            <div className="p-4 space-y-4">
              {log.minuteLogs.map((minute) => (
                <div key={minute.minute} className="space-y-2">
                  <h3 className="font-medium">
                    Phút {format(new Date(minute.minute), 'HH:mm', { locale: vi })}
                  </h3>
                  <div className="space-y-2">
                    {minute.secondsData.map((data) => (
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
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
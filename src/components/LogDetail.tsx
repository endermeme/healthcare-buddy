import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HealthChart } from './HealthChart';
import { HourlyLog } from '@/services/healthData';

interface LogDetailProps {
  log: HourlyLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogDetail = ({ log, open, onOpenChange }: LogDetailProps) => {
  if (!log) return null;

  const chartData = log.secondsData.map(data => ({
    timestamp: data.timestamp,
    heartRate: data.heartRate,
    bloodOxygen: data.bloodOxygen,
    heartRates: [data.heartRate], // Add single reading as array
    oxygenLevels: [data.bloodOxygen], // Add single reading as array
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Chi tiết {new Date(log.hour).toLocaleTimeString('vi-VN', {
              hour: '2-digit'
            })}:00
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <HealthChart data={chartData} />
          
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="p-4 space-y-2">
              {log.secondsData.map((data, index) => (
                <div 
                  key={data.timestamp}
                  className="p-3 bg-gray-50 rounded-lg text-sm grid grid-cols-2 gap-4"
                >
                  <span className="text-red-500">
                    Nhịp tim: {data.heartRate} BPM
                  </span>
                  <span className="text-blue-500">
                    SpO2: {data.bloodOxygen}%
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MinuteLog } from './LogCard';
import { HealthChart } from './HealthChart';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface LogDetailProps {
  log: MinuteLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogDetail = ({ log, open, onOpenChange }: LogDetailProps) => {
  if (!log) return null;

  const chartData = log.secondsData.map(data => ({
    timestamp: data.timestamp,
    heartRate: data.heartRate,
    bloodOxygen: data.bloodOxygen,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Chi tiết phút {format(new Date(log.minute), 'HH:mm', { locale: vi })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="relative">
            <HealthChart 
              data={chartData} 
              showTooltip={true}
              tooltipFormatter={(value, name) => {
                if (name === "heartRate") return `${value} BPM`;
                if (name === "bloodOxygen") return `${value}%`;
                return value;
              }}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Dữ liệu theo giây:</h3>
            <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
              {log.secondsData.map((data, index) => (
                <div 
                  key={data.timestamp}
                  className="p-3 bg-gray-50 rounded-lg text-sm grid grid-cols-3 gap-4"
                >
                  <span className="text-gray-600">
                    {format(new Date(data.timestamp), 'HH:mm:ss', { locale: vi })}
                  </span>
                  <span className="text-red-600">
                    Nhịp tim: {data.heartRate} BPM
                  </span>
                  <span className="text-blue-600">
                    SpO2: {data.bloodOxygen}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
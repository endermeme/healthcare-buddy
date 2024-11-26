import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HealthChart } from './HealthChart';
import { HourlyLog } from '@/services/healthData';
import { calculate10MinuteAverages } from '@/utils/healthDataUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LogDetailProps {
  log: HourlyLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LogDetail = ({ log, open, onOpenChange }: LogDetailProps) => {
  if (!log) return null;

  const validData = log.secondsData.filter(data => data.bloodOxygen > 0);
  
  const rawChartData = validData.map(data => ({
    timestamp: data.timestamp,
    heartRate: data.heartRate,
    bloodOxygen: data.bloodOxygen,
  }));

  const averageChartData = calculate10MinuteAverages(validData);

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
          <Tabs defaultValue="raw" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="raw">Số liệu gốc</TabsTrigger>
              <TabsTrigger value="average">Trung bình 10 phút</TabsTrigger>
            </TabsList>
            <TabsContent value="raw" className="mt-4">
              <HealthChart data={rawChartData} />
            </TabsContent>
            <TabsContent value="average" className="mt-4">
              <HealthChart data={averageChartData} />
            </TabsContent>
          </Tabs>
          
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="p-4 space-y-2">
              {validData.map((data, index) => (
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
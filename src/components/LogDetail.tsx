import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HealthChart } from './HealthChart';
import { HourlyLog } from '@/services/healthData';
import { calculate10MinuteAverages } from '@/utils/healthDataUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useMemo } from "react";
import { messaging } from "@/config/firebase";
import { toast } from "@/components/ui/use-toast";

interface LogDetailProps {
  log: HourlyLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ABNORMAL_THRESHOLD = 3;
const MIN_HEART_RATE = 60;
const MAX_HEART_RATE = 100;
const MIN_BLOOD_OXYGEN = 95;

export const LogDetail = ({ log, open, onOpenChange }: LogDetailProps) => {
  if (!log) return null;

  const validData = log.secondsData.filter(data => data.bloodOxygen > 0);
  
  const abnormalReadings = useMemo(() => {
    let consecutiveAbnormal = 0;
    const abnormal: number[] = [];

    validData.forEach((data, index) => {
      const isAbnormal = 
        data.heartRate < MIN_HEART_RATE || 
        data.heartRate > MAX_HEART_RATE ||
        data.bloodOxygen < MIN_BLOOD_OXYGEN;

      if (isAbnormal) {
        consecutiveAbnormal++;
        if (consecutiveAbnormal >= ABNORMAL_THRESHOLD) {
          abnormal.push(index - 2, index - 1, index);
        }
      } else {
        consecutiveAbnormal = 0;
      }
    });

    return new Set(abnormal);
  }, [validData]);

  useEffect(() => {
    if (abnormalReadings.size > 0) {
      toast({
        title: "Cảnh báo chỉ số sức khỏe",
        description: "Phát hiện các chỉ số bất thường. Vui lòng kiểm tra chi tiết.",
        variant: "destructive",
      });
    }
  }, [abnormalReadings.size]);

  const rawChartData = validData.map(data => ({
    timestamp: data.timestamp,
    heartRate: data.heartRate,
    bloodOxygen: data.bloodOxygen,
    heartRates: [data.heartRate],
    oxygenLevels: [data.bloodOxygen]
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
                  className={`p-3 rounded-lg text-sm grid grid-cols-2 gap-4 ${
                    abnormalReadings.has(index) 
                      ? 'bg-red-50 border-2 border-red-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <span className={`${
                    data.heartRate < MIN_HEART_RATE || data.heartRate > MAX_HEART_RATE 
                      ? 'text-red-600 font-medium' 
                      : 'text-red-500'
                  }`}>
                    Nhịp tim: {data.heartRate} BPM
                  </span>
                  <span className={`${
                    data.bloodOxygen < MIN_BLOOD_OXYGEN 
                      ? 'text-red-600 font-medium' 
                      : 'text-blue-500'
                  }`}>
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
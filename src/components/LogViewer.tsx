import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Download, Clock, ChevronDown } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HealthChart } from '@/components/HealthChart';
import {
  fetchDailyLogs,
  cleanOldLogs,
  addToFavorites,
  downloadLogs,
  getDailyLogs,
  type DailyLog,
  type HourlyLog
} from '@/services/logApiService';

export const LogViewer = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [currentDayLogs, setCurrentDayLogs] = useState<HourlyLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<HourlyLog | null>(null);
  const { toast } = useToast();

  // Generate last 7 days
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      value: date,
      label: format(date, 'dd/MM/yyyy', { locale: vi })
    };
  });

  useEffect(() => {
    const loadLogs = async () => {
      const logs = await fetchDailyLogs(selectedDate);
      setCurrentDayLogs(logs);
      cleanOldLogs();
    };

    loadLogs();
  }, [selectedDate]);

  const handleAddToFavorites = () => {
    const logToSave: DailyLog = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      hourlyLogs: currentDayLogs
    };
    addToFavorites(logToSave);
    toast({
      title: "Đã lưu vào mục yêu thích",
      description: `Log ngày ${format(selectedDate, 'dd/MM/yyyy')} đã được lưu`,
    });
  };

  const handleDownload = () => {
    const logs = getDailyLogs();
    downloadLogs(logs);
    toast({
      title: "Tải log thành công",
      description: "File log đã được tải về máy của bạn",
    });
  };

  // Convert hourly log data to chart format
  const getChartData = (log: HourlyLog) => {
    const baseTime = new Date(log.timestamp);
    const startTime = new Date(baseTime.setMinutes(0));
    const endTime = new Date(baseTime.setHours(baseTime.getHours() + 1));
    
    // Generate data points for the hour
    return Array.from({ length: 12 }, (_, i) => {
      const timestamp = new Date(startTime.getTime() + (i * 5 * 60 * 1000));
      return {
        timestamp: timestamp.toISOString(),
        heartRate: log.avgHeartRate + Math.random() * 5 - 2.5, // Simulate variation
        bloodOxygen: log.avgBloodOxygen + Math.random() * 2 - 1, // Simulate variation
      };
    });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {format(selectedDate, 'dd/MM/yyyy', { locale: vi })}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {dateOptions.map((option) => (
              <DropdownMenuItem
                key={option.label}
                onClick={() => setSelectedDate(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleAddToFavorites}>
            <Star className="h-4 w-4 mr-2" />
            Lưu yêu thích
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Tải về
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="space-y-4 p-4">
          {currentDayLogs.map((log) => (
            <Card 
              key={log.hour} 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{log.hour}:00</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    Nhịp tim TB: {log.avgHeartRate} BPM
                  </div>
                  <div className="text-sm text-gray-600">
                    SpO2 TB: {log.avgBloodOxygen}%
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Chi tiết sức khỏe {selectedLog?.hour}:00
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <HealthChart data={getChartData(selectedLog)} />
              
              <div className="space-y-4">
                <h3 className="font-medium">Phân tích của AI:</h3>
                {selectedLog.aiResponses.map((response, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700"
                  >
                    {response}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
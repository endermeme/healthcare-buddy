import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Download, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
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
  const { toast } = useToast();

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

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
          locale={vi}
        />
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
            <Card key={log.hour} className="p-4">
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
              {log.aiResponses.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <div className="font-medium">Phản hồi AI:</div>
                  {log.aiResponses.map((response, index) => (
                    <div key={index} className="ml-2">
                      • {response}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HealthChart } from '@/components/HealthChart';
import {
  fetchAndStoreLogs,
  getStoredLogs,
  type LogEntry,
  downloadLog,
} from '@/services/logApiService';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LogViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const fetchedLogs = await fetchAndStoreLogs();
        console.log('Fetched logs:', fetchedLogs);
        setLogs(fetchedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
        toast({
          title: "Lỗi khi lấy dữ liệu",
          description: "Không thể kết nối đến máy chủ",
          variant: "destructive",
        });
      }
    };

    loadLogs();
    const interval = setInterval(loadLogs, 60000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const handleDownload = (format: 'txt' | 'csv') => {
    downloadLog(selectedDate, format);
    toast({
      title: "Đã tải xuống",
      description: `Log đã được tải xuống ở định dạng ${format.toUpperCase()}`,
    });
  };

  // Generate date options for the last 7 days
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có dữ liệu log nào. Dữ liệu sẽ xuất hiện sau khi bạn nhấn "Lấy log ngay".
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn ngày" />
          </SelectTrigger>
          <SelectContent>
            {dateOptions.map(date => (
              <SelectItem key={date} value={date}>
                {new Date(date).toLocaleDateString('vi-VN')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleDownload('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload('txt')}>
            <Download className="h-4 w-4 mr-2" />
            TXT
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {logs.map((log) => (
          <Card 
            key={log.timestamp} 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => handleLogClick(log)}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium text-lg">{log.timestamp}</span>
                {log.isComplete && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Hoàn tất
                  </span>
                )}
              </div>
              {log.analysis && (
                <div className="text-sm text-gray-600 mt-2">
                  <p className="font-medium">Phân tích:</p>
                  <p>{log.analysis.analysis.health_summary}</p>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số lượng ghi:</span>
                  <span className="font-medium">{log.logs.length} lần</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Chi tiết log {selectedLog?.timestamp}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <HealthChart data={selectedLog.logs} />
              {selectedLog.analysis && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium">Phân tích AI</h3>
                  <div className="space-y-2">
                    <p>{selectedLog.analysis.analysis.health_summary}</p>
                    <p className="text-primary">{selectedLog.analysis.analysis.recommendation}</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Nhịp tim TB:</span>
                        <span className="font-medium ml-2">
                          {selectedLog.analysis.analysis.detailed_insights.average_heart_rate} BPM
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">SpO2 TB:</span>
                        <span className="font-medium ml-2">
                          {selectedLog.analysis.analysis.detailed_insights.average_oxygen_level}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
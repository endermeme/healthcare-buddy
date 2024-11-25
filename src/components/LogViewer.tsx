import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock } from 'lucide-react';
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
} from '@/services/logApiService';
import { toast } from '@/components/ui/use-toast';

export const LogViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const fetchedLogs = await fetchAndStoreLogs();
        console.log('Fetched logs:', fetchedLogs); // Debug log
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
    // Tự động cập nhật logs mỗi phút
    const interval = setInterval(loadLogs, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  // Hiển thị thông báo nếu không có logs
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có dữ liệu log nào. Dữ liệu sẽ xuất hiện sau khi bạn nhấn "Lấy log ngay".
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {logs.map((log) => (
        <Card 
          key={log.minute} 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleLogClick(log)}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium text-lg">{log.minute}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nhịp tim TB:</span>
                <span className="font-medium">{log.avgHeartRate} BPM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SpO2 TB:</span>
                <span className="font-medium">{log.avgBloodOxygen}%</span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Chi tiết sức khỏe {selectedLog?.minute}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <HealthChart data={selectedLog.logs} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
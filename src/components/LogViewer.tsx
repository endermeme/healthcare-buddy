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

export const LogViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadLogs = async () => {
      const fetchedLogs = await fetchAndStoreLogs();
      setLogs(fetchedLogs);
    };

    loadLogs();
    const interval = setInterval(loadLogs, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="space-y-4 p-4">
          {logs.map((log) => (
            <Card 
              key={log.minute} 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleLogClick(log)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{log.minute}</span>
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
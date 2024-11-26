import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { LogCard } from '@/components/LogCard';
import { useToast } from '@/components/ui/use-toast';
import { getDailyLogs } from '@/services/logApiService';
import { type HourLog } from '@/services/logService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const History = () => {
  const [logs, setLogs] = useState<HourLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load logs when component mounts
    const today = format(new Date(), 'yyyy-MM-dd');
    const dailyLogs = getDailyLogs();
    const todayLogs = dailyLogs.find(log => log.date === today)?.minuteLogs || [];
    
    // Group logs by hour
    const hourlyLogs: { [hour: string]: HourLog } = {};
    
    todayLogs.forEach(minuteLog => {
      const hourTime = new Date(minuteLog.minute);
      const hourKey = format(hourTime, 'HH:00');
      
      if (!hourlyLogs[hourKey]) {
        hourlyLogs[hourKey] = {
          hour: hourKey,
          timestamp: format(hourTime, "yyyy-MM-dd'T'HH:00:00"),
          minuteLogs: []
        };
      }
      
      hourlyLogs[hourKey].minuteLogs.push(minuteLog);
    });

    setLogs(Object.values(hourlyLogs));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Lịch sử theo dõi</h1>
      
      <div className="grid gap-4">
        {logs.map((log) => (
          <LogCard
            key={log.timestamp}
            log={log}
            onClick={() => {
              toast({
                title: `Chi tiết giờ ${format(new Date(log.timestamp), 'HH:00', { locale: vi })}`,
                description: `${log.minuteLogs.length} phút đã ghi`,
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default History;
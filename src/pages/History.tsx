import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { vi } from 'date-fns/locale';
import { Heart, Activity } from 'lucide-react';
import { loadLogs, HourlyLog } from '@/services/healthData';

const History = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<HourlyLog[]>([]);

  useEffect(() => {
    // Load initial logs
    const storedLogs = loadLogs();
    setLogs(storedLogs);

    // Update logs every minute
    const interval = setInterval(() => {
      setLogs(loadLogs());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Group logs by date
  const groupedLogs = logs.reduce((groups: { [key: string]: HourlyLog[] }, log) => {
    const date = formatInTimeZone(
      new Date(log.hour),
      'Asia/Ho_Chi_Minh',
      'yyyy-MM-dd'
    );
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {});
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Lịch sử theo dõi</h1>
      
      <div className="space-y-6">
        {Object.entries(groupedLogs)
          .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
          .map(([date, dayLogs]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">
                {formatInTimeZone(
                  new Date(date),
                  'Asia/Ho_Chi_Minh',
                  'EEEE, dd/MM/yyyy',
                  { locale: vi }
                )}
              </h2>
              
              <div className="grid gap-4">
                {dayLogs
                  .sort((a, b) => new Date(b.hour).getTime() - new Date(a.hour).getTime())
                  .map((log) => (
                    <Card 
                      key={log.hour}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/detail/${encodeURIComponent(log.hour)}`)}
                    >
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg flex justify-between items-center">
                          <span>
                            {formatInTimeZone(
                              new Date(log.hour),
                              'Asia/Ho_Chi_Minh',
                              'HH:00',
                              { locale: vi }
                            )}
                          </span>
                          <span className="text-sm font-normal">
                            {isSameDay(new Date(log.hour), new Date()) ? (
                              log.isRecording ? (
                                <span className="text-blue-500">Đang ghi...</span>
                              ) : (
                                <span className="text-green-500">Đã hoàn tất</span>
                              )
                            ) : (
                              <span className="text-green-500">Đã hoàn tất</span>
                            )}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-red-500" />
                            <span>{log.averageHeartRate} BPM</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <span>{log.averageBloodOxygen}%</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {log.secondsData.length} lần đo
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
          
        {Object.keys(groupedLogs).length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Chưa có dữ liệu nào được ghi lại
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
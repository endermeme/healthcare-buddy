import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Lịch sử theo dõi</h1>
      
      <div className="grid gap-4">
        {logs.map((log) => (
          <Card 
            key={log.hour}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/detail/${encodeURIComponent(log.hour)}`)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>
                  {format(new Date(log.hour), 'HH:00')}
                </span>
                <span className="text-sm font-normal">
                  {log.isRecording ? (
                    <span className="text-blue-500">Đang ghi...</span>
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
        
        {logs.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Chưa có dữ liệu nào được ghi lại
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
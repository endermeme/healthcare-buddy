import { useState } from 'react';
import { Menu, History, RefreshCw } from 'lucide-react';
import { useHealthData, TimeRange } from '@/hooks/useHealthData';
import { HealthChart } from '@/components/HealthChart';
import { HealthStats } from '@/components/HealthStats';
import { WaterIntakeProgress } from '@/components/WaterIntakeProgress';
import { LogViewer } from '@/components/LogViewer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { getDailyLogs } from '@/services/logService';
import axios from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('10m');
  const { currentData, history, averages } = useHealthData(timeRange);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    toast({
      title: "Đã thay đổi khoảng thời gian",
      description: `Hiển thị dữ liệu trong ${range}`,
    });
  };

  const handleGetLogsNow = async () => {
    try {
      const response = await axios.get('http://192.168.1.15/logdemo');
      toast({
        title: "Đã lấy log thành công",
        description: `Số lượng log: ${response.data.length}`,
      });
    } catch (error) {
      toast({
        title: "Lỗi khi lấy log",
        description: "Không thể kết nối đến máy chủ",
        variant: "destructive",
      });
    }
  };

  const showLogs = () => {
    const logs = getDailyLogs();
    const dates = Object.keys(logs).sort().reverse();
    
    if (dates.length === 0) {
      toast({
        title: "Chưa có log nào",
        description: "Dữ liệu sẽ được tự động ghi log khi có",
      });
      return;
    }

    const recentLogs = dates.slice(0, 7);
    const logMessages = recentLogs.map(date => {
      const dayLogs = logs[date];
      const logCount = dayLogs.length;
      const lastLog = dayLogs[dayLogs.length - 1];
      return `${date} (${logCount} logs):\nLast: ${new Date(lastLog.timestamp).toLocaleTimeString()} - ${lastLog.heartRate}BPM, ${lastLog.bloodOxygen}%`;
    }).join('\n\n');

    toast({
      title: "Lịch sử log 7 ngày gần nhất",
      description: logMessages,
      duration: 7000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10"></div>
              <span className="text-sm font-medium">Health Monitor</span>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {timeRange === '10m' ? '10 phút' : 
                     timeRange === '1h' ? '1 giờ' : '1 ngày'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleTimeRangeChange('10m')}>
                    10 phút
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTimeRangeChange('1h')}>
                    1 giờ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTimeRangeChange('1d')}>
                    1 ngày
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={showLogs}>
                <History className="h-4 w-4 mr-2" />
                Lịch sử
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Health Stats and Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
              <div className="space-y-6">
                <HealthStats 
                  data={currentData} 
                  averages={averages}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
                <HealthChart data={history} timeRange={timeRange} />
              </div>
            </div>
          </div>

          {/* Water Intake Section */}
          <div className="lg:col-span-1">
            <WaterIntakeProgress
              heartRate={currentData?.heartRate ?? null}
              bloodOxygen={currentData?.bloodOxygen ?? null}
            />
          </div>
        </div>

        {/* Log Viewer Section with Get Logs Now Button */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Nhật ký theo dõi</h2>
            <Button variant="outline" size="sm" onClick={handleGetLogsNow}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Lấy log ngay
            </Button>
          </div>
          <LogViewer />
        </div>
      </main>
    </div>
  );
};

export default Index;

import { useState } from 'react';
import { Menu, History } from 'lucide-react';
import { useHealthData, TimeRange } from '@/hooks/useHealthData';
import { HealthChart } from '@/components/HealthChart';
import { HealthStats } from '@/components/HealthStats';
import { WaterIntakeProgress } from '@/components/WaterIntakeProgress';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { getDailyLogs } from '@/services/logService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('5m');
  const { currentData, history, averages } = useHealthData(timeRange);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    toast({
      title: "Đã thay đổi khoảng thời gian",
      description: `Hiển thị dữ liệu trong ${range}`,
    });
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
                    {timeRange}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleTimeRangeChange('5m')}>
                    5 phút
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTimeRangeChange('15m')}>
                    15 phút
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTimeRangeChange('30m')}>
                    30 phút
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTimeRangeChange('1h')}>
                    1 giờ
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
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Health Stats and Chart Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
              <div className="space-y-6">
                <HealthStats 
                  data={currentData} 
                  averages={averages}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                />
                
                {/* Chart */}
                <div className="mt-6">
                  <HealthChart data={history} />
                </div>
              </div>
            </div>
          </div>

          {/* Water Intake Section */}
          <div className="lg:col-span-1">
            {currentData && (
              <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
                <WaterIntakeProgress
                  heartRate={currentData.heartRate}
                  bloodOxygen={currentData.bloodOxygen}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
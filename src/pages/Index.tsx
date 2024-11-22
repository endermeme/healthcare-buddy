import { useState } from 'react';
import { Menu, Home, Plus, BookOpen, User } from 'lucide-react';
import { useHealthData, TimeRange } from '@/hooks/useHealthData';
import { HealthChart } from '@/components/HealthChart';
import { HealthStats } from '@/components/HealthStats';
import { WaterIntakeProgress } from '@/components/WaterIntakeProgress';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('60s');
  const { currentData, history, averages } = useHealthData(timeRange);

  const handleClick = (section: string) => {
    toast({
      title: `Đang chuyển tới ${section}`,
      description: "Tính năng này sẽ sớm ra mắt!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10"></div>
              <span className="text-sm font-medium">Health Monitor</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-lg space-y-6 p-6">
        {/* Health Stats with Time Range Controls */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <HealthStats 
              data={currentData} 
              averages={averages}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
            
            {/* Time Range Controls */}
            <div className="flex justify-center gap-2">
              <Button
                variant={timeRange === '60s' ? 'default' : 'outline'}
                onClick={() => setTimeRange('60s')}
                className="text-sm"
              >
                60s
              </Button>
              <Button
                variant={timeRange === '1h' ? 'default' : 'outline'}
                onClick={() => setTimeRange('1h')}
                className="text-sm"
              >
                1h
              </Button>
              <Button
                variant={timeRange === '6h' ? 'default' : 'outline'}
                onClick={() => setTimeRange('6h')}
                className="text-sm"
              >
                6h
              </Button>
              <Button
                variant={timeRange === '24h' ? 'default' : 'outline'}
                onClick={() => setTimeRange('24h')}
                className="text-sm"
              >
                24h
              </Button>
            </div>
            
            {/* Chart */}
            <div className="mt-4">
              <HealthChart data={history} />
            </div>
          </div>
        </div>

        {/* Water Intake Progress */}
        {currentData && (
          <div className="rounded-xl">
            <WaterIntakeProgress
              heartRate={currentData.heartRate}
              bloodOxygen={currentData.bloodOxygen}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="mx-auto flex items-center justify-around px-4 py-2">
          <Button variant="ghost" size="icon" className="text-primary" onClick={() => handleClick("Trang chủ")}>
            <Home className="h-5 w-5" />
          </Button>
          <Button 
            className="rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover"
            size="icon"
            onClick={() => handleClick("Thêm")}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleClick("Bài viết")}>
            <BookOpen className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleClick("Hồ sơ")}>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
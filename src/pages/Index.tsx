import { useState } from 'react';
import { Menu, Home, Plus, BookOpen, User } from 'lucide-react';
import { useHealthData, TimeRange } from '@/hooks/useHealthData';
import { HealthChart } from '@/components/HealthChart';
import { HealthStats } from '@/components/HealthStats';
import { WaterIntakeProgress } from '@/components/WaterIntakeProgress';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              <span className="text-sm font-medium">Jillian Hanson</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">Theo dõi sức khoẻ</h1>
            <p className="text-xs text-gray-500">Dữ liệu theo thời gian thực</p>
          </div>
          <Select
            value={timeRange}
            onValueChange={(value: TimeRange) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60s">1 phút</SelectItem>
              <SelectItem value="1h">1 giờ</SelectItem>
              <SelectItem value="6h">6 giờ</SelectItem>
              <SelectItem value="24h">24 giờ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Combined Stats Container */}
        <div className="rounded-lg bg-white p-4">
          {/* Health Stats */}
          <HealthStats data={currentData} averages={averages} />
          
          {/* Chart */}
          <div className="mt-6">
            <HealthChart data={history} />
          </div>

          {/* Water Intake Progress */}
          {currentData && (
            <div className="mt-6">
              <WaterIntakeProgress
                heartRate={currentData.heartRate}
                bloodOxygen={currentData.bloodOxygen}
              />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-around px-4 py-2 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" onClick={() => handleClick("Trang chủ")}>
            <Home className="h-5 w-5" />
          </Button>
          <Button 
            className="rounded-full bg-primary text-white shadow-lg"
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
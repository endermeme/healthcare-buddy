import { useState } from 'react';
import { useHealthData, TimeRange } from '@/hooks/useHealthData';
import { HealthChart } from '@/components/HealthChart';
import { HealthStats } from '@/components/HealthStats';
import { WaterIntakeProgress } from '@/components/WaterIntakeProgress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const EMOJIS = ["❤️", "🏃", "💪", "🧘‍♀️", "🫀", "🏊‍♂️", "🚴‍♂️", "🎯", "❤️", "🏃", "💪", "🧘‍♀️", "🫀", "🏊‍♂️", "🚴‍♂️", "🎯"];

const Index = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('5m');
  const { currentData, history, averages } = useHealthData(timeRange);

  // Kiểm tra lỗi cảm biến và hiển thị toast
  if (currentData?.error) {
    toast("Lỗi cảm biến", {
      position: "bottom-center",
      duration: 3000,
      className: "bg-red-500 text-white border-none shadow-lg",
      style: {
        backgroundColor: "#ef4444",
        color: "white",
        border: "none",
      },
    });
  }

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    toast(`Hiển thị dữ liệu trong ${range}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Health Banner */}
      <div className="relative overflow-hidden rounded-xl mx-4 mt-4 h-32 bg-gradient-to-r from-[#4FACFE] to-[#00F2FE] shadow-lg">
        <div className="absolute inset-0 overflow-hidden">
          {EMOJIS.map((emoji, index) => (
            <span
              key={index}
              className="absolute animate-emoji-fall opacity-0"
              style={{
                left: `${(index / EMOJIS.length) * 100}%`,
                animationDelay: `${index * 0.3}s`
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white text-center z-10">
            Nhịp đập số
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
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
                <HealthChart data={history} />
                
                {/* Time Range Selector */}
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant={timeRange === '5m' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeRangeChange('5m')}
                  >
                    5 phút
                  </Button>
                  <Button
                    variant={timeRange === '15m' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeRangeChange('15m')}
                  >
                    15 phút
                  </Button>
                  <Button
                    variant={timeRange === '30m' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeRangeChange('30m')}
                  >
                    30 phút
                  </Button>
                  <Button
                    variant={timeRange === '1h' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeRangeChange('1h')}
                  >
                    1 giờ
                  </Button>
                </div>
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
      </main>
    </div>
  );
};

export default Index;

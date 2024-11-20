import { useState } from 'react';
import { Heart, Activity, Menu, Home, Plus, BookOpen, User } from 'lucide-react';
import { useHealthData, TimeRange } from '@/hooks/useHealthData';
import { HealthChart } from '@/components/HealthChart';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('60s');
  const { currentData, history, averages } = useHealthData(timeRange);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '60s', label: '1 Minute' },
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' },
  ];

  const handleClick = (section: string) => {
    toast({
      title: `Navigating to ${section}`,
      description: "This feature is coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <span className="font-medium">Jillian Hanson</span>
        </div>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Health Monitoring</h1>
          <p className="text-gray-500 text-sm">Real-time Health Data</p>
        </div>

        <div className="grid gap-4">
          {/* Stats and Chart Container */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            {/* Time Range Selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {timeRanges.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={timeRange === value ? "default" : "outline"}
                  onClick={() => setTimeRange(value)}
                  className="whitespace-nowrap"
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-stats-health p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="text-red-500" />
                  <h2 className="text-lg font-semibold">Heart Rate</h2>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-bold">{currentData?.heartRate || '--'}</span>
                    <span className="text-gray-500 ml-2">BPM</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Avg: {averages.avgHeartRate} BPM
                  </div>
                </div>
              </div>

              <div className="bg-stats-water p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-blue-500" />
                  <h2 className="text-lg font-semibold">Oxygen Level</h2>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-bold">{currentData?.oxygenLevel || '--'}</span>
                    <span className="text-gray-500 ml-2">%</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Avg: {averages.avgOxygenLevel}%
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-4">
              <HealthChart data={history} />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center p-3">
        <Button variant="ghost" size="icon" onClick={() => handleClick("Home")}>
          <Home className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleClick("Activity")}>
          <Activity className="h-6 w-6" />
        </Button>
        <Button 
          className="rounded-full bg-primary text-white -mt-8 p-4 shadow-lg"
          size="icon"
          onClick={() => handleClick("Add")}
        >
          <Plus className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleClick("Health Articles")}>
          <BookOpen className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleClick("Profile")}>
          <User className="h-6 w-6" />
        </Button>
      </nav>
    </div>
  );
};

export default Index;
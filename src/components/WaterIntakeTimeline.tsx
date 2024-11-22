import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

interface TimelinePoint {
  time: string;
  target: number;
  actual: number;
  isCompleted: boolean;
}

export const WaterIntakeTimeline = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timelinePoints, setTimelinePoints] = useState<TimelinePoint[]>([]);

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getCurrentTimeInVN = () => {
      return formatInTimeZone(currentTime, 'Asia/Ho_Chi_Minh', 'HH:mm');
    };

    const getActualWaterIntake = (time: string) => {
      // Giả lập dữ liệu nước uống (sẽ được thay thế bằng dữ liệu thực tế)
      const mockData: Record<string, number> = {
        '06:00': 0,
        '09:00': 250,
        '12:00': 500,
        '15:00': 750,
        '18:00': 1000,
        '21:00': 1250,
      };
      return mockData[time] || 0;
    };

    const points: TimelinePoint[] = [
      { time: '06:00', target: 500 },
      { time: '09:00', target: 1000 },
      { time: '12:00', target: 1500 },
      { time: '15:00', target: 2000 },
      { time: '18:00', target: 2500 },
      { time: '21:00', target: 3000 },
    ].map(point => {
      const currentVNTime = getCurrentTimeInVN();
      const actual = getActualWaterIntake(point.time);
      return {
        ...point,
        actual,
        isCompleted: currentVNTime >= point.time
      };
    });

    setTimelinePoints(points);
  }, [currentTime]);

  return (
    <div className="relative p-4">
      <div className="absolute left-2.5 top-3 h-[calc(100%-24px)] w-0.5 bg-gray-200" />
      <div className="space-y-8">
        {timelinePoints.map((point, index) => (
          <div key={point.time} className="flex items-start gap-4">
            {point.isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 z-10 bg-white" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300 z-10 bg-white" />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">{point.time}</span>
                <span className="text-sm text-gray-500">
                  {point.actual}/{point.target} ml
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (point.actual / point.target) * 100)}%` }}
                />
              </div>
              {point.isCompleted && (
                <p className="text-sm text-gray-600 mt-1">
                  {point.actual >= point.target 
                    ? 'Đã đạt mục tiêu!' 
                    : `Còn thiếu ${point.target - point.actual}ml`}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
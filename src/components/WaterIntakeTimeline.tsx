import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

interface TimelinePoint {
  time: string;
  target: number;
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
    const points: TimelinePoint[] = [
      { time: '06:00', target: 2 },
      { time: '09:00', target: 4 },
      { time: '12:00', target: 6 },
      { time: '15:00', target: 8 },
      { time: '18:00', target: 10 },
      { time: '21:00', target: 12 },
    ].map(point => {
      const currentVNTime = formatInTimeZone(currentTime, 'Asia/Ho_Chi_Minh', 'HH:mm');
      return {
        ...point,
        isCompleted: currentVNTime >= point.time
      };
    });

    setTimelinePoints(points);
  }, [currentTime]);

  return (
    <div className="relative">
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
                  Target: {point.target} glasses
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {point.isCompleted 
                  ? `Great job! You've reached ${point.target} glasses`
                  : `Aim to drink ${point.target} glasses by this time`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
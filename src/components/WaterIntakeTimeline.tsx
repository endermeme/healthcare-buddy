import { CheckCircle2, Circle } from 'lucide-react';

interface TimelinePoint {
  time: string;
  target: number;
  isCompleted: boolean;
}

export const WaterIntakeTimeline = () => {
  const timelinePoints: TimelinePoint[] = [
    { time: '06:00', target: 2, isCompleted: true },
    { time: '09:00', target: 4, isCompleted: true },
    { time: '12:00', target: 6, isCompleted: false },
    { time: '15:00', target: 8, isCompleted: false },
    { time: '18:00', target: 10, isCompleted: false },
    { time: '21:00', target: 12, isCompleted: false },
  ];

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-2.5 top-3 h-[calc(100%-24px)] w-0.5 bg-gray-200" />

      {/* Timeline points */}
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
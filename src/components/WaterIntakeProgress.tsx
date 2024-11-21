import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { getWaterRecommendation } from '@/services/healthData';
import { Droplet } from 'lucide-react';

interface WaterIntakeProgressProps {
  heartRate: number | null;
  bloodOxygen: number | null;
}

export const WaterIntakeProgress = ({ heartRate, bloodOxygen }: WaterIntakeProgressProps) => {
  const [recommendation, setRecommendation] = useState('');
  const [progress, setProgress] = useState(0);
  const [targetGlasses, setTargetGlasses] = useState(8);

  useEffect(() => {
    const fetchRecommendation = async () => {
      if (heartRate && bloodOxygen) {
        const result = await getWaterRecommendation(heartRate, bloodOxygen);
        setRecommendation(result.recommendation);
        setTargetGlasses(Math.max(8, result.glassesCount));
      }
    };

    fetchRecommendation();
  }, [heartRate, bloodOxygen]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Droplet className="text-blue-500" />
        <h3 className="font-semibold">Daily Water Intake</h3>
      </div>
      
      <Progress value={progress} className="mb-4" />
      
      <div className="flex justify-between text-sm text-gray-600">
        <span>{progress}%</span>
        <span>Target: {targetGlasses} glasses</span>
      </div>
      
      {recommendation && (
        <p className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          💧 {recommendation}
        </p>
      )}
    </div>
  );
};
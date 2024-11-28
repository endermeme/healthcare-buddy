import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { getWaterRecommendation } from '@/services/healthData';
import { Droplet, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WaterIntakeProgressProps {
  heartRate: number | null;
  bloodOxygen: number | null;
}

export const WaterIntakeProgress = ({ heartRate, bloodOxygen }: WaterIntakeProgressProps) => {
  const [recommendation, setRecommendation] = useState('');
  const [currentGlasses, setCurrentGlasses] = useState(0);
  const [targetGlasses, setTargetGlasses] = useState(8);
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    setProgress(Math.min(100, (currentGlasses / targetGlasses) * 100));
  }, [currentGlasses, targetGlasses]);

  const addGlass = () => {
    setCurrentGlasses(prev => Math.min(prev + 1, targetGlasses));
  };

  const removeGlass = () => {
    setCurrentGlasses(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Droplet className="text-blue-500" />
        <h3 className="font-semibold">Lượng nước uống trong ngày</h3>
      </div>
      
      <Progress value={progress} className="mb-4 h-4" />
      
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>{currentGlasses} / {targetGlasses} cốc</span>
        <span>{Math.round(progress)}%</span>
      </div>

      <div className="flex gap-4 justify-center mb-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={removeGlass}
          disabled={currentGlasses === 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={addGlass}
          disabled={currentGlasses === targetGlasses}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {recommendation && (
        <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          💧 {recommendation}
        </p>
      )}
    </div>
  );
};
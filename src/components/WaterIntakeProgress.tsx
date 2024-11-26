import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { getWaterRecommendation } from '@/services/healthData';
import { Droplet, Plus, Minus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface WaterIntakeProgressProps {
  heartRate: number | null;
  bloodOxygen: number | null;
}

const getRecommendedIntakeByAge = (age: number, gender: string): { liters: number, glasses: number } => {
  if (age >= 1 && age <= 3) return { liters: 1.3, glasses: 5 };
  if (age >= 4 && age <= 8) return { liters: 1.7, glasses: 7 };
  if (age >= 9 && age <= 13) {
    return gender === "male" ? { liters: 2.4, glasses: 10 } : { liters: 2.1, glasses: 9 };
  }
  if (age >= 14 && age <= 18) {
    return gender === "male" ? { liters: 3.3, glasses: 13 } : { liters: 2.3, glasses: 9 };
  }
  if (age >= 19 && age <= 50) {
    return gender === "male" ? { liters: 3.7, glasses: 15 } : { liters: 2.7, glasses: 11 };
  }
  return { liters: 2.5, glasses: 10 }; // Default for 50+
};

const getAdviceByAge = (age: number): string => {
  if (age >= 1 && age <= 8) {
    return "Chia nhỏ lượng nước uống trong ngày. Khuyến khích uống nước thường xuyên và bổ sung qua trái cây.";
  }
  if (age >= 9 && age <= 18) {
    return "Uống nước trước, trong và sau khi vận động. Hạn chế nước ngọt, ưu tiên nước lọc.";
  }
  if (age >= 19 && age <= 50) {
    return "Uống nước đều đặn kể cả khi không khát. Bắt đầu ngày mới với một ly nước.";
  }
  return "Duy trì uống nước đều đặn, uống từng ngụm nhỏ nếu cần. Bổ sung nước qua thực phẩm mềm.";
};

export const WaterIntakeProgress = ({ heartRate, bloodOxygen }: WaterIntakeProgressProps) => {
  const [recommendation, setRecommendation] = useState('');
  const [currentGlasses, setCurrentGlasses] = useState(0);
  const [targetGlasses, setTargetGlasses] = useState(8);
  const [progress, setProgress] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
      const recommended = getRecommendedIntakeByAge(profile.age || 25, profile.gender || "male");
      setTargetGlasses(recommended.glasses);
    }
  }, []);

  useEffect(() => {
    const fetchRecommendation = async () => {
      if (heartRate && bloodOxygen) {
        const result = await getWaterRecommendation(heartRate, bloodOxygen);
        setRecommendation(result.recommendation);
        if (userProfile?.age) {
          const recommended = getRecommendedIntakeByAge(userProfile.age, userProfile.gender || "male");
          setTargetGlasses(Math.max(recommended.glasses, result.glassesCount));
        } else {
          setTargetGlasses(Math.max(8, result.glassesCount));
        }
      }
    };

    fetchRecommendation();
  }, [heartRate, bloodOxygen, userProfile]);

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="text-blue-500" />
          <h3 className="font-semibold">Lượng nước uống trong ngày</h3>
        </div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">Lời khuyên cho bạn</h4>
              <p className="text-sm text-muted-foreground">
                {userProfile?.age ? getAdviceByAge(userProfile.age) : "Hãy uống nước đều đặn trong ngày để đảm bảo sức khỏe."}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
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
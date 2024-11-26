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

const calculateExpectedProgress = (): number => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(6, 0, 0, 0); // Bắt đầu tính từ 6 giờ sáng
  
  const endOfDay = new Date(now);
  endOfDay.setHours(22, 0, 0, 0); // Kết thúc lúc 10 giờ tối
  
  if (now < startOfDay || now > endOfDay) return 0;
  
  const totalMinutes = (endOfDay.getTime() - startOfDay.getTime()) / (1000 * 60);
  const elapsedMinutes = (now.getTime() - startOfDay.getTime()) / (1000 * 60);
  
  return Math.min(100, (elapsedMinutes / totalMinutes) * 100);
};

export const WaterIntakeProgress = ({ heartRate, bloodOxygen }: WaterIntakeProgressProps) => {
  const [recommendation, setRecommendation] = useState('');
  const [currentGlasses, setCurrentGlasses] = useState(0);
  const [targetGlasses, setTargetGlasses] = useState(8);
  const [progress, setProgress] = useState(0);
  const [expectedProgress, setExpectedProgress] = useState(0);
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
    const updateExpectedProgress = () => {
      setExpectedProgress(calculateExpectedProgress());
    };

    // Cập nhật ngay lập tức
    updateExpectedProgress();

    // Cập nhật mỗi phút
    const interval = setInterval(updateExpectedProgress, 60000);

    return () => clearInterval(interval);
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
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-left">Lượng nước uống trong ngày</h3>
      
      <div className="flex items-center justify-between text-sm">
        <span>{currentGlasses} / {targetGlasses} cốc</span>
        <span>{Math.round(progress)}%</span>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="text-sm text-gray-600">Tiến độ theo thời gian</div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>6:00</span>
          <span>22:00</span>
        </div>
      </div>

      <div className="flex gap-4 justify-center mt-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={removeGlass}
          disabled={currentGlasses === 0}
          className="border-gray-300"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={addGlass}
          disabled={currentGlasses === targetGlasses}
          className="border-gray-300"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

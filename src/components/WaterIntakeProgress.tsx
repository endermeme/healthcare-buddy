import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { getWaterRecommendation } from '@/services/healthData';
import { Droplet, Plus, Minus, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from '@/components/ui/use-toast';

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

const getTimeBasedRecommendation = (currentHour: number): string => {
  if (currentHour >= 6 && currentHour < 9) {
    return "Buổi sáng: Uống 1-2 cốc nước ngay khi thức dậy để kích hoạt cơ thể";
  } else if (currentHour >= 9 && currentHour < 12) {
    return "Giữa sáng: Duy trì uống nước đều đặn, tránh để cơ thể khát";
  } else if (currentHour >= 12 && currentHour < 14) {
    return "Buổi trưa: Uống nước trước và sau bữa ăn để hỗ trợ tiêu hóa";
  } else if (currentHour >= 14 && currentHour < 17) {
    return "Buổi chiều: Bổ sung nước để duy trì năng lượng làm việc";
  } else if (currentHour >= 17 && currentHour < 20) {
    return "Chiều tối: Uống nước sau khi tập thể dục hoặc vận động";
  } else {
    return "Buổi tối: Uống vừa đủ, tránh uống quá nhiều trước khi đi ngủ";
  }
};

export const WaterIntakeProgress = ({ heartRate, bloodOxygen }: WaterIntakeProgressProps) => {
  const [recommendation, setRecommendation] = useState('');
  const [currentGlasses, setCurrentGlasses] = useState(0);
  const [targetGlasses, setTargetGlasses] = useState(8);
  const [progress, setProgress] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

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
    const newValue = currentGlasses + 1;
    setCurrentGlasses(Math.min(newValue, targetGlasses));
    if (newValue >= targetGlasses) {
      toast({
        title: "Chúc mừng! 🎉",
        description: "Bạn đã đạt mục tiêu uống nước trong ngày!",
      });
    }
  };

  const removeGlass = () => {
    setCurrentGlasses(prev => Math.max(0, prev - 1));
  };

  const currentHour = currentTime.getHours();
  const timeRecommendation = getTimeBasedRecommendation(currentHour);
  const currentTimeString = formatInTimeZone(currentTime, 'Asia/Ho_Chi_Minh', 'HH:mm');

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="text-blue-500" />
          <h3 className="font-semibold">Lượng nước uống trong ngày</h3>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">{currentTimeString}</span>
        </div>
      </div>
      
      <Progress value={progress} className="h-4" />
      
      <div className="flex justify-between text-sm text-gray-600">
        <span>{currentGlasses} / {targetGlasses} cốc</span>
        <span>{Math.round(progress)}%</span>
      </div>

      <div className="flex gap-4 justify-center">
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

      <div className="bg-blue-50 p-3 rounded-lg space-y-2">
        <p className="text-sm text-blue-600">
          <Clock className="h-4 w-4 inline mr-2" />
          {timeRecommendation}
        </p>
        {recommendation && (
          <p className="text-sm text-blue-600">
            💧 {recommendation}
          </p>
        )}
      </div>

      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full">
            <Info className="h-4 w-4 mr-2" />
            Xem gợi ý theo độ tuổi
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-semibold">Lời khuyên cho bạn</h4>
            <p className="text-sm text-muted-foreground">
              {userProfile?.age ? getAdviceByAge(userProfile.age) : "Hãy cập nhật thông tin cá nhân để nhận gợi ý phù hợp hơn."}
            </p>
            {userProfile?.age && userProfile?.gender && (
              <p className="text-sm text-muted-foreground mt-2">
                Theo độ tuổi và giới tính của bạn, bạn nên uống khoảng {getRecommendedIntakeByAge(userProfile.age, userProfile.gender).liters} lít nước mỗi ngày.
              </p>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
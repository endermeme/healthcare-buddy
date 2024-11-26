import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

export interface HealthData {
  heartRate: number;
  bloodOxygen: number;
  timestamp: string;
}

interface ApiResponse {
  heartRate: number;
  spo2: number;
}

let isRecording = false;
let lastRecordTime: string | null = null;

export const startRecording = () => {
  isRecording = true;
  toast({
    title: "Đang ghi dữ liệu",
    description: "Hệ thống đang thu thập dữ liệu sức khỏe của bạn.",
  });
};

export const stopRecording = () => {
  isRecording = false;
  lastRecordTime = new Date().toISOString();
  toast({
    title: "Đã hoàn thành ghi",
    description: `Lần ghi cuối: ${new Date(lastRecordTime).toLocaleTimeString('vi-VN')}`,
  });
};

export const getRecordingStatus = () => ({
  isRecording,
  lastRecordTime,
});

const API_ENDPOINT = 'http://192.168.1.15/data';

export const fetchHealthData = async (): Promise<HealthData | null> => {
  try {
    const response = await axios.get<ApiResponse>(API_ENDPOINT);
    
    if (!response.data || typeof response.data.heartRate !== 'number') {
      throw new Error('Invalid data format received');
    }

    const data: HealthData = {
      heartRate: response.data.heartRate,
      bloodOxygen: response.data.spo2,
      timestamp: new Date().toISOString(),
    };

    return data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    toast({
      title: "Lỗi kết nối",
      description: "Không thể kết nối với cảm biến. Vui lòng kiểm tra thiết bị.",
      variant: "destructive",
    });
    return null;
  }
};

interface WaterRecommendation {
  recommendation: string;
  glassesCount: number;
}

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 9) return 'morning';
  if (hour >= 12 && hour < 14) return 'noon';
  if (hour >= 16 && hour < 18) return 'afternoon';
  if (hour >= 20 && hour < 22) return 'evening';
  return 'other';
};

const getWaterAmount = (bloodOxygen: number, timeOfDay: string): { min: number; max: number } => {
  if (bloodOxygen > 95) {
    switch (timeOfDay) {
      case 'morning': return { min: 300, max: 500 };
      case 'noon': return { min: 250, max: 400 };
      case 'afternoon': return { min: 300, max: 500 };
      case 'evening': return { min: 200, max: 300 };
      default: return { min: 250, max: 400 };
    }
  } else if (bloodOxygen >= 90) {
    switch (timeOfDay) {
      case 'morning': return { min: 400, max: 600 };
      case 'noon': return { min: 350, max: 500 };
      case 'afternoon': return { min: 400, max: 600 };
      case 'evening': return { min: 300, max: 400 };
      default: return { min: 350, max: 500 };
    }
  } else {
    switch (timeOfDay) {
      case 'morning': return { min: 500, max: 700 };
      case 'noon': return { min: 450, max: 600 };
      case 'afternoon': return { min: 500, max: 700 };
      case 'evening': return { min: 350, max: 500 };
      default: return { min: 450, max: 600 };
    }
  }
};

const getAdditionalAdvice = (bloodOxygen: number, timeOfDay: string): string => {
  if (bloodOxygen > 95) {
    switch (timeOfDay) {
      case 'morning': return 'Uống sau khi thức dậy để bù nước sau giấc ngủ.';
      case 'noon': return 'Uống sau bữa ăn để hỗ trợ tiêu hóa.';
      case 'afternoon': return 'Uống sau khi vận động hoặc làm việc.';
      case 'evening': return 'Uống trước khi ngủ, tránh uống quá nhiều.';
      default: return 'Duy trì uống nước đều đặn.';
    }
  } else if (bloodOxygen >= 90) {
    switch (timeOfDay) {
      case 'morning': return 'Kết hợp hít thở sâu, vận động nhẹ nhàng.';
      case 'noon': return 'Nghỉ ngơi và tránh căng thẳng.';
      case 'afternoon': return 'Tăng cường hít thở sâu hoặc tập thể dục nhẹ.';
      case 'evening': return 'Kết hợp thư giãn và cải thiện giấc ngủ.';
      default: return 'Tập các bài tập thở và thư giãn.';
    }
  } else {
    switch (timeOfDay) {
      case 'morning': return 'Thêm liệu pháp thở oxy nếu cần (theo bác sĩ).';
      case 'noon': return 'Kiểm tra môi trường sống (độ cao, không khí).';
      case 'afternoon': return 'Nghỉ ngơi và theo dõi SpO2 thường xuyên.';
      case 'evening': return 'Đảm bảo thông gió tốt, sử dụng thiết bị hỗ trợ.';
      default: return 'Cần theo dõi sát chỉ số SpO2 và tham khảo ý kiến bác sĩ.';
    }
  }
};

export const getWaterRecommendation = async (
  heartRate: number, 
  bloodOxygen: number
): Promise<WaterRecommendation> => {
  const timeOfDay = getTimeOfDay();
  const waterAmount = getWaterAmount(bloodOxygen, timeOfDay);
  const advice = getAdditionalAdvice(bloodOxygen, timeOfDay);
  
  const recommendation = `${advice} Nên uống từ ${waterAmount.min}ml đến ${waterAmount.max}ml nước.`;
  const glassesCount = Math.ceil(waterAmount.max / 250); // Assuming 1 glass = 250ml

  return {
    recommendation,
    glassesCount,
  };
};

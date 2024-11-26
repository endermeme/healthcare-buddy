import { toast } from 'sonner';

export interface HealthData {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
  heartRates?: number[];
  oxygenLevels?: number[];
}

export interface HourlyLog {
  hour: string;
  averageHeartRate: number;
  averageBloodOxygen: number;
  isRecording: boolean;
  secondsData: HealthData[];
}

export const LOGS_STORAGE_KEY = 'health_logs';

export const loadLogs = (): HourlyLog[] => {
  const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  return storedLogs ? JSON.parse(storedLogs) : [];
};

export const saveChatMessage = (message: any) => {
  const messages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
  messages.push(message);
  localStorage.setItem('chat_messages', JSON.stringify(messages));
};

export const getWaterRecommendation = async (heartRate: number, bloodOxygen: number) => {
  // Simple recommendation logic based on heart rate and blood oxygen
  let glassesCount = 8; // Base recommendation
  let recommendation = 'Hãy uống nước đều đặn trong ngày.';

  if (heartRate > 100) {
    glassesCount += 2;
    recommendation = 'Nhịp tim cao, hãy uống nhiều nước hơn để giữ đủ nước cho cơ thể.';
  } else if (heartRate < 60) {
    recommendation = 'Nhịp tim thấp, hãy uống nước ấm và vận động nhẹ nhàng.';
  }

  if (bloodOxygen < 95) {
    glassesCount += 1;
    recommendation += ' SpO2 thấp, cần bổ sung nước để cải thiện tuần hoàn máu.';
  }

  return {
    glassesCount,
    recommendation
  };
};

export const fetchHealthData = async (): Promise<HealthData> => {
  try {
    const response = await fetch('http://localhost:3001/api/health-data', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include', // Include credentials if needed
    });

    if (response.status === 429) {
      toast('Quá nhiều yêu cầu, vui lòng thử lại sau ít phút', {
        duration: 3000,
      });
      throw new Error('Rate limit exceeded');
    }

    if (!response.ok) {
      throw new Error('Lỗi kết nối với cảm biến');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (window.location.pathname === '/') {
      if (error instanceof Error) {
        toast(error.message, {
          duration: 3000,
        });
      } else {
        toast('Lỗi kết nối với cảm biến', {
          duration: 3000,
        });
      }
    }
    throw error;
  }
};
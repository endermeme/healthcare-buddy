import { toast } from '@/components/ui/use-toast';

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

export interface ChatMessage {
  id: string;
  timestamp: string;
  content: string;
  role: 'user' | 'assistant';
  audioUrl?: string;
  transcription?: string;
}

export const LOGS_STORAGE_KEY = 'health_logs';

const generateMockData = (): HealthData => {
  return {
    timestamp: new Date().toISOString(),
    heartRate: Math.floor(Math.random() * (100 - 60) + 60),
    bloodOxygen: Math.floor(Math.random() * (100 - 95) + 95),
  };
};

export const fetchHealthData = async (): Promise<HealthData> => {
  try {
    const response = await fetch('http://localhost:3001/api/health-data');
    if (!response.ok) {
      throw new Error('Lỗi kết nối với cảm biến');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (window.location.pathname === '/') {
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối với cảm biến",
        variant: "destructive"
      });
    }
    return generateMockData();
  }
};

export const loadLogs = (): HourlyLog[] => {
  const savedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  if (!savedLogs) return [];
  try {
    return JSON.parse(savedLogs);
  } catch {
    return [];
  }
};

export const saveChatMessage = (message: ChatMessage): void => {
  const messages = loadChatMessages();
  messages.push(message);
  localStorage.setItem('chat_messages', JSON.stringify(messages));
};

export const loadChatMessages = (): ChatMessage[] => {
  const saved = localStorage.getItem('chat_messages');
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const getWaterRecommendation = async (heartRate: number, bloodOxygen: number) => {
  // Mock recommendation logic based on heart rate and blood oxygen
  let glassesCount = 8; // Base recommendation
  let recommendation = 'Hãy uống đủ nước trong ngày để duy trì sức khỏe.';

  if (heartRate > 90) {
    glassesCount += 2;
    recommendation = 'Nhịp tim cao, hãy uống nhiều nước hơn để giữ đủ nước cho cơ thể.';
  }

  if (bloodOxygen < 95) {
    glassesCount += 1;
    recommendation = 'Nồng độ oxy trong máu thấp, hãy nghỉ ngơi và uống đủ nước.';
  }

  return {
    glassesCount,
    recommendation
  };
};
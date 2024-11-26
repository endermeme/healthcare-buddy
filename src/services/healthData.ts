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
        variant: "destructive",
      });
    }
    throw error;
  }
};

export const loadLogs = (): HourlyLog[] => {
  const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  return storedLogs ? JSON.parse(storedLogs) : [];
};

export const saveChatMessage = (message: ChatMessage): void => {
  const messages = loadChatMessages();
  messages.push(message);
  localStorage.setItem('chat_messages', JSON.stringify(messages));
};

export const loadChatMessages = (): ChatMessage[] => {
  const stored = localStorage.getItem('chat_messages');
  return stored ? JSON.parse(stored) : [];
};

export const getWaterRecommendation = async (
  heartRate: number,
  bloodOxygen: number
): Promise<{ recommendation: string; glassesCount: number }> => {
  // Simplified recommendation logic
  let glassesCount = 8; // Default recommendation
  let recommendation = "Hãy uống đủ nước trong ngày để đảm bảo sức khỏe.";

  if (heartRate > 100) {
    glassesCount = 10;
    recommendation = "Nhịp tim cao, hãy uống nhiều nước hơn để giữ đủ nước cho cơ thể.";
  } else if (bloodOxygen < 95) {
    glassesCount = 9;
    recommendation = "Nồng độ oxy trong máu thấp, uống đủ nước sẽ giúp cải thiện.";
  }

  return { recommendation, glassesCount };
};
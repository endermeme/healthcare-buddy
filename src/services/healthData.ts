import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { checkHealthMetrics } from '@/services/notificationService';

export interface HealthData {
  heartRate: number;
  bloodOxygen: number;
  timestamp: string;
  heartRates: number[];
  oxygenLevels: number[];
}

interface ApiResponse {
  heartRate: number;
  spo2: number;
}

export interface HourlyLog {
  hour: string;
  isRecording: boolean;
  lastRecordTime: string | null;
  averageHeartRate: number;
  averageBloodOxygen: number;
  secondsData: HealthData[];
}

interface WaterRecommendation {
  recommendation: string;
  glassesCount: number;
}

const API_ENDPOINT = 'http://192.168.1.15/data';
export const LOGS_STORAGE_KEY = 'health_logs';
const CHAT_STORAGE_KEY = 'chat_messages';
const CURRENT_RECORDING_KEY = 'current_recording';

const isValidReading = (heartRate: number, bloodOxygen: number): boolean => {
  return heartRate > 0 && heartRate < 220 && bloodOxygen > 0 && bloodOxygen <= 100;
};

export const loadLogs = (): HourlyLog[] => {
  const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  return storedLogs ? JSON.parse(storedLogs) : [];
};

export const saveLogs = (logs: HourlyLog[]) => {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
};

export const getCurrentRecording = (): { isRecording: boolean; currentHour: string | null } => {
  const stored = localStorage.getItem(CURRENT_RECORDING_KEY);
  return stored ? JSON.parse(stored) : { isRecording: false, currentHour: null };
};

export const setCurrentRecording = (isRecording: boolean, currentHour: string | null) => {
  localStorage.setItem(CURRENT_RECORDING_KEY, JSON.stringify({ isRecording, currentHour }));
};

const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Math.round(sum / numbers.length);
};

const updateCurrentHourLog = (logs: HourlyLog[], newData: HealthData): HourlyLog[] => {
  const currentHour = new Date().setMinutes(0, 0, 0);
  const hourString = new Date(currentHour).toISOString();
  
  const existingLogIndex = logs.findIndex(log => log.hour === hourString);
  
  if (existingLogIndex >= 0) {
    const updatedLog = { ...logs[existingLogIndex] };
    updatedLog.secondsData.push(newData);
    updatedLog.lastRecordTime = new Date().toISOString();
    
    const validHeartRates = updatedLog.secondsData.map(d => d.heartRate).filter(rate => rate > 0);
    const validOxygenLevels = updatedLog.secondsData.map(d => d.bloodOxygen).filter(level => level > 0);
    
    updatedLog.averageHeartRate = calculateAverage(validHeartRates);
    updatedLog.averageBloodOxygen = calculateAverage(validOxygenLevels);
    
    const newLogs = [...logs];
    newLogs[existingLogIndex] = updatedLog;
    return newLogs;
  } else {
    const newLog: HourlyLog = {
      hour: hourString,
      isRecording: true,
      lastRecordTime: new Date().toISOString(),
      averageHeartRate: newData.heartRate,
      averageBloodOxygen: newData.bloodOxygen,
      secondsData: [newData]
    };
    return [...logs, newLog];
  }
};

export const saveChatMessage = (message: any) => {
  try {
    const messages = loadChatMessages();
    if (!messages.some(m => m.id === message.id)) {
      messages.push(message);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
};

export const loadChatMessages = () => {
  const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
  return storedMessages ? JSON.parse(storedMessages) : [];
};

export const fetchHealthData = async (): Promise<HealthData[]> => {
  try {
    const response = await axios.get<ApiResponse>(API_ENDPOINT);
    
    if (!response.data || typeof response.data.heartRate !== 'number') {
      throw new Error('Invalid data format received');
    }

    const { heartRate, spo2: bloodOxygen } = response.data;

    const alerts = checkHealthMetrics(heartRate, bloodOxygen);
    if (alerts.length > 0) {
      toast({
        title: "Cảnh báo sức khỏe",
        description: alerts.join('. ') + '. Vui lòng kiểm tra lại tình trạng sức khỏe hoặc liên hệ bác sĩ.',
        variant: "destructive",
      });
    }

    if (isValidReading(heartRate, bloodOxygen)) {
      const data: HealthData = {
        heartRate,
        bloodOxygen,
        timestamp: new Date().toISOString(),
        heartRates: Array(10).fill(heartRate),
        oxygenLevels: Array(10).fill(bloodOxygen),
      };

      const currentLogs = loadLogs();
      const updatedLogs = updateCurrentHourLog(currentLogs, data);
      saveLogs(updatedLogs);

      const currentHour = new Date().setMinutes(0, 0, 0);
      const hourString = new Date(currentHour).toISOString();
      const currentHourLog = updatedLogs.find(log => log.hour === hourString);
      
      if (currentHourLog && currentHourLog.secondsData.length >= 3600) {
        toast({
          title: "Hoàn thành ghi dữ liệu",
          description: "Đã hoàn thành ghi dữ liệu sức khỏe trong 1 giờ.",
        });
      }

      return [data];
    } else {
      console.warn('Invalid reading detected:', { heartRate, bloodOxygen });
      return [];
    }
  } catch (error) {
    console.error('Error fetching health data:', error);
    toast({
      title: "Lỗi kết nối",
      description: "Không thể kết nối với cảm biến. Vui lòng kiểm tra thiết bị.",
      variant: "destructive",
    });
    return [];
  }
};

export const getWaterRecommendation = async (
  heartRate: number,
  bloodOxygen: number
): Promise<WaterRecommendation> => {
  let baseGlasses = 8;
  
  if (heartRate > 100) {
    baseGlasses += 2;
  } else if (heartRate < 60) {
    baseGlasses -= 1;
  }
  
  if (bloodOxygen < 95) {
    baseGlasses += 1;
  }

  let recommendation = "Hãy uống đủ nước để duy trì sức khỏe tốt.";
  if (heartRate > 100 || bloodOxygen < 95) {
    recommendation = "Bạn nên uống nhiều nước hơn để cải thiện các chỉ số sức khỏe.";
  }

  return {
    recommendation,
    glassesCount: baseGlasses
  };
};
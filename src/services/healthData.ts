import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { 
  API_ENDPOINT, 
  LOGS_STORAGE_KEY, 
  CURRENT_RECORDING_KEY,
  ABNORMAL_THRESHOLD,
  MIN_HEART_RATE,
  MAX_HEART_RATE,
  MIN_BLOOD_OXYGEN 
} from './constants';
import type { 
  HealthData, 
  ApiResponse, 
  HourlyLog, 
  WaterRecommendation 
} from './types';

// Validation functions
const isValidReading = (heartRate: number, bloodOxygen: number): boolean => {
  return heartRate > 0 && heartRate < 220 && bloodOxygen > 0 && bloodOxygen <= 100;
};

export const isAbnormalReading = (data: HealthData): boolean => {
  return data.heartRate < MIN_HEART_RATE || 
         data.heartRate > MAX_HEART_RATE || 
         data.bloodOxygen < MIN_BLOOD_OXYGEN;
};

// Storage functions
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

// Utility functions
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
  }

  return [...logs, {
    hour: hourString,
    isRecording: true,
    lastRecordTime: new Date().toISOString(),
    averageHeartRate: newData.heartRate,
    averageBloodOxygen: newData.bloodOxygen,
    secondsData: [newData]
  }];
};

// Main functions
export const checkForAbnormalReadings = (data: HealthData[]) => {
  let abnormalCount = 0;
  const lastReadings = data.slice(-5);

  lastReadings.forEach(reading => {
    if (isAbnormalReading(reading)) {
      abnormalCount++;
    }
  });

  return abnormalCount >= ABNORMAL_THRESHOLD;
};

export const fetchHealthData = async (): Promise<HealthData[]> => {
  try {
    const response = await axios.get<ApiResponse>(API_ENDPOINT);
    
    if (!response.data || typeof response.data.heartRate !== 'number') {
      throw new Error('Invalid data format received');
    }

    const { heartRate, spo2: bloodOxygen } = response.data;

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

      if (checkForAbnormalReadings([...currentLogs.flatMap(log => log.secondsData), data])) {
        new Notification("Cảnh báo sức khỏe", {
          body: "Phát hiện các chỉ số bất thường trong thời gian gần đây. Vui lòng kiểm tra chi tiết.",
          icon: "/favicon.ico"
        });
      }

      return [data];
    }
    return [];
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

export { saveChatMessage, getChatMessages } from './chatStorage';
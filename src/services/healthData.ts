import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { generateIpAddresses } from './networkUtils';
import { 
  loadLogs, 
  saveLogs, 
  getCurrentRecording, 
  setCurrentRecording,
  saveChatMessage,
  loadChatMessages,
  LOGS_STORAGE_KEY
} from './storageUtils';

export interface HealthData {
  heartRate: number;
  bloodOxygen: number;
  timestamp: string;
  heartRates: number[];
  oxygenLevels: number[];
}

export interface ApiResponse {
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

let currentSensorUrl: string | null = null;

async function pingAddress(ip: string): Promise<boolean> {
  try {
    const response = await axios.get(`http://${ip}/data`, { timeout: 1000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

export async function findSensorUrl(): Promise<string | null> {
  if (currentSensorUrl) {
    try {
      await axios.get(`http://${currentSensorUrl}/data`, { timeout: 1000 });
      return currentSensorUrl;
    } catch {
      currentSensorUrl = null;
    }
  }

  const ipGenerator = generateIpAddresses();
  for (const ip of ipGenerator) {
    if (await pingAddress(ip)) {
      currentSensorUrl = ip;
      toast({
        title: "Kết nối thành công",
        description: `Đã tìm thấy thiết bị tại địa chỉ ${ip}`
      });
      return ip;
    }
  }

  toast({
    variant: "destructive", 
    title: "Không tìm thấy thiết bị",
    description: "Không tìm thấy thiết bị trong mạng"
  });
  return null;
}

export const getWaterRecommendation = async (heartRate: number, bloodOxygen: number) => {
  // Simple recommendation logic based on heart rate and blood oxygen
  let glassesCount = 8; // Base recommendation
  let recommendation = "Hãy uống nước đều đặn trong ngày.";

  if (heartRate > 100) {
    glassesCount += 2;
    recommendation = "Nhịp tim cao, hãy uống thêm nước để giữ đủ nước cho cơ thể.";
  } else if (heartRate < 60) {
    glassesCount -= 1;
    recommendation = "Nhịp tim thấp, uống nước vừa phải và theo dõi sức khỏe.";
  }

  if (bloodOxygen < 95) {
    glassesCount += 1;
    recommendation += " SpO2 thấp, cần bổ sung nước để hỗ trợ quá trình trao đổi oxy.";
  }

  return {
    glassesCount: Math.max(6, Math.min(glassesCount, 15)), // Keep between 6-15 glasses
    recommendation
  };
};

const isValidReading = (heartRate: number, bloodOxygen: number): boolean => {
  return heartRate > 0 && heartRate < 220 && bloodOxygen > 0 && bloodOxygen <= 100;
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

export const fetchHealthData = async (): Promise<HealthData[]> => {
  try {
    const sensorIp = await findSensorUrl();
    if (!sensorIp) {
      throw new Error('Không tìm thấy cảm biến');
    }

    const response = await axios.get<ApiResponse>(`http://${sensorIp}/data`);
    
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

      return [data];
    } else {
      console.warn('Invalid reading detected:', { heartRate, bloodOxygen });
      return [];
    }
  } catch (error) {
    console.error('Error fetching health data:', error);
    throw error;
  }
};

export {
  loadLogs,
  saveLogs,
  getCurrentRecording,
  setCurrentRecording,
  saveChatMessage,
  loadChatMessages,
  LOGS_STORAGE_KEY
};

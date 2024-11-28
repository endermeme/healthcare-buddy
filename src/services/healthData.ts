import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { HealthData, ApiResponse, HourlyLog } from './types';
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

let currentSensorUrl: string | null = null;

async function pingAddress(ip: string): Promise<boolean> {
  try {
    const response = await axios.get(`http://${ip}/data`, { timeout: 1000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function findSensorUrl(): Promise<string | null> {
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
        description: "Đã khôi phục kết nối với cảm biến"
      });
      return ip;
    }
  }
  return null;
}

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
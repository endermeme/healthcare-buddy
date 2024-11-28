import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

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

let currentSensorUrl: string | null = null;

const generateIpAddresses = function* () {
  const networks = ['192.168.1', '192.168.0', '10.10.0'];
  for (const network of networks) {
    yield `${network}.15`;
  }
};

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
      toast.success("Đã khôi phục kết nối với cảm biến");
      return ip;
    }
  }
  return null;
}

const isValidReading = (heartRate: number, bloodOxygen: number): boolean => {
  return heartRate > 0 && heartRate < 220 && bloodOxygen > 0 && bloodOxygen <= 100;
};

export const loadLogs = (): HourlyLog[] => {
  const storedLogs = localStorage.getItem('health_logs');
  return storedLogs ? JSON.parse(storedLogs) : [];
};

export const saveLogs = (logs: HourlyLog[]) => {
  localStorage.setItem('health_logs', JSON.stringify(logs));
};

export const getCurrentRecording = (): { isRecording: boolean; currentHour: string | null } => {
  const stored = localStorage.getItem('current_recording');
  return stored ? JSON.parse(stored) : { isRecording: false, currentHour: null };
};

export const setCurrentRecording = (isRecording: boolean, currentHour: string | null) => {
  localStorage.setItem('current_recording', JSON.stringify({ isRecording, currentHour }));
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
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
};

export const loadChatMessages = () => {
  const storedMessages = localStorage.getItem('chat_messages');
  return storedMessages ? JSON.parse(storedMessages) : [];
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

const getWaterRecommendation = async (
  heartRate: number,
  bloodOxygen: number
): Promise<{ recommendation: string; glassesCount: number }> => {
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

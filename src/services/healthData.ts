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

// Local storage keys
const LOGS_STORAGE_KEY = 'health_logs';
const CURRENT_RECORDING_KEY = 'current_recording';

// Load logs from local storage
export const loadLogs = (): HourlyLog[] => {
  const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  return storedLogs ? JSON.parse(storedLogs) : [];
};

// Save logs to local storage
export const saveLogs = (logs: HourlyLog[]) => {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
};

// Get current recording status
export const getCurrentRecording = (): { isRecording: boolean; currentHour: string | null } => {
  const stored = localStorage.getItem(CURRENT_RECORDING_KEY);
  return stored ? JSON.parse(stored) : { isRecording: false, currentHour: null };
};

// Set current recording status
export const setCurrentRecording = (isRecording: boolean, currentHour: string | null) => {
  localStorage.setItem(CURRENT_RECORDING_KEY, JSON.stringify({ isRecording, currentHour }));
};

// Calculate averages for an hour
const calculateAverages = (data: HealthData[]) => {
  if (data.length === 0) return { heartRate: 0, bloodOxygen: 0 };
  
  const sum = data.reduce((acc, curr) => ({
    heartRate: acc.heartRate + curr.heartRate,
    bloodOxygen: acc.bloodOxygen + curr.bloodOxygen
  }), { heartRate: 0, bloodOxygen: 0 });

  return {
    heartRate: Math.round(sum.heartRate / data.length),
    bloodOxygen: Math.round(sum.bloodOxygen / data.length)
  };
};

// Fetch health data from the sensor
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

    // Update logs
    const currentHour = new Date().setMinutes(0, 0, 0);
    const hourString = new Date(currentHour).toISOString();
    
    const logs = loadLogs();
    let currentLog = logs.find(log => log.hour === hourString);
    
    if (!currentLog) {
      currentLog = {
        hour: hourString,
        isRecording: true,
        lastRecordTime: null,
        averageHeartRate: 0,
        averageBloodOxygen: 0,
        secondsData: []
      };
      logs.push(currentLog);
    }

    currentLog.secondsData.push(data);
    currentLog.lastRecordTime = data.timestamp;
    
    const averages = calculateAverages(currentLog.secondsData);
    currentLog.averageHeartRate = averages.heartRate;
    currentLog.averageBloodOxygen = averages.bloodOxygen;

    // Check if hour is complete
    const now = new Date();
    const logHour = new Date(currentLog.hour);
    if (now.getHours() !== logHour.getHours()) {
      currentLog.isRecording = false;
    }

    saveLogs(logs);
    setCurrentRecording(currentLog.isRecording, currentLog.isRecording ? hourString : null);

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

export const getWaterRecommendation = async (
  heartRate: number,
  bloodOxygen: number
): Promise<WaterRecommendation> => {
  // Calculate recommended glasses based on heart rate and blood oxygen
  let baseGlasses = 8; // Default recommendation
  
  // Adjust based on heart rate
  if (heartRate > 100) {
    baseGlasses += 2; // Add more water if heart rate is elevated
  } else if (heartRate < 60) {
    baseGlasses -= 1; // Slightly reduce if heart rate is low
  }
  
  // Adjust based on blood oxygen
  if (bloodOxygen < 95) {
    baseGlasses += 1; // Add more water if blood oxygen is low
  }

  // Generate recommendation message
  let recommendation = "Hãy uống đủ nước để duy trì sức khỏe tốt.";
  if (heartRate > 100 || bloodOxygen < 95) {
    recommendation = "Bạn nên uống nhiều nước hơn để cải thiện các chỉ số sức khỏe.";
  }

  return {
    recommendation,
    glassesCount: baseGlasses
  };
};

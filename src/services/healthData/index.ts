import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { ApiResponse, HealthData, WaterRecommendation } from './types';
import { isValidFirstFiveReading, isValidLaterReading, calculateAverage } from './validation';
import { loadLogs, saveLogs } from './storage';

export * from './types';
export * from './validation';
export * from './storage';

const API_ENDPOINT = 'http://192.168.1.15/data';

// Update current hour log
const updateCurrentHourLog = (logs: HourlyLog[], newData: HealthData): HourlyLog[] => {
  const currentHour = new Date().setMinutes(0, 0, 0);
  const hourString = new Date(currentHour).toISOString();
  
  const existingLogIndex = logs.findIndex(log => log.hour === hourString);
  
  if (existingLogIndex >= 0) {
    const updatedLog = { ...logs[existingLogIndex] };
    
    const validFirstFive = updatedLog.secondsData
      .slice(0, 5)
      .filter(data => isValidFirstFiveReading(data.heartRate, data.bloodOxygen));

    if (validFirstFive.length < 5) {
      if (isValidFirstFiveReading(newData.heartRate, newData.bloodOxygen)) {
        updatedLog.secondsData.push(newData);
      }
    } else {
      if (isValidLaterReading(newData.heartRate, newData.bloodOxygen)) {
        updatedLog.secondsData.push(newData);
      }
    }
    
    updatedLog.lastRecordTime = new Date().toISOString();
    
    const validFirstFiveData = updatedLog.secondsData
      .slice(0, 5)
      .filter(data => isValidFirstFiveReading(data.heartRate, data.bloodOxygen));
      
    const validRemainingData = updatedLog.secondsData
      .slice(5)
      .filter(data => isValidLaterReading(data.heartRate, data.bloodOxygen));

    const allValidData = [...validFirstFiveData, ...validRemainingData];
    
    updatedLog.averageHeartRate = calculateAverage(allValidData.map(d => d.heartRate));
    updatedLog.averageBloodOxygen = calculateAverage(allValidData.map(d => d.bloodOxygen));
    
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

// Fetch health data từ sensor
export const fetchHealthData = async (): Promise<HealthData[]> => {
  try {
    const response = await axios.get<ApiResponse>(API_ENDPOINT);
    
    if (!response.data || typeof response.data.heartRate !== 'number') {
      throw new Error('Invalid data format received');
    }

    const { heartRate, spo2: bloodOxygen } = response.data;

    if (isValidFirstFiveReading(heartRate, bloodOxygen) || isValidLaterReading(heartRate, bloodOxygen)) {
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
    }
    
    console.warn('Invalid reading detected:', { heartRate, bloodOxygen });
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
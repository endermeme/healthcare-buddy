import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

export interface HealthData {
  heartRate: number;
  bloodOxygen: number;
  timestamp: string;
  heartRates: number[];
  oxygenLevels: number[];
}

export interface HourlyLog {
  hour: string;
  isRecording: boolean;
  lastRecordTime: string | null;
  averageHeartRate: number;
  averageBloodOxygen: number;
  secondsData: HealthData[];
}

const LOGS_STORAGE_KEY = 'health_logs';
const CURRENT_RECORDING_KEY = 'current_recording';

// Kiểm tra tính hợp lệ của dữ liệu
const isValidReading = (heartRate: number, bloodOxygen: number): boolean => {
  return (
    heartRate >= 40 && heartRate <= 200 &&
    bloodOxygen >= 80 && bloodOxygen <= 100
  );
};

// Tính trung bình
const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Math.round(sum / numbers.length);
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
  localStorage.setItem(
    CURRENT_RECORDING_KEY,
    JSON.stringify({ isRecording, currentHour })
  );
};

export const fetchHealthData = async (): Promise<HealthData | null> => {
  try {
    const response = await axios.get('http://192.168.1.15/data');
    const { heartRate, spo2: bloodOxygen } = response.data;

    // Kiểm tra tính hợp lệ của dữ liệu
    if (!isValidReading(heartRate, bloodOxygen)) {
      return null;
    }

    const data: HealthData = {
      heartRate,
      bloodOxygen,
      timestamp: new Date().toISOString(),
      heartRates: [heartRate],
      oxygenLevels: [bloodOxygen],
    };

    // Cập nhật log hiện tại
    const currentTime = new Date();
    const currentHour = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate(),
      currentTime.getHours()
    ).toISOString();

    const logs = loadLogs();
    let currentLog = logs.find(log => log.hour === currentHour);

    if (!currentLog) {
      currentLog = {
        hour: currentHour,
        isRecording: true,
        lastRecordTime: null,
        averageHeartRate: 0,
        averageBloodOxygen: 0,
        secondsData: [],
      };
      logs.push(currentLog);
    }

    // Thêm dữ liệu mới vào log
    currentLog.secondsData.push(data);
    currentLog.lastRecordTime = data.timestamp;
    
    // Cập nhật trung bình
    const allHeartRates = currentLog.secondsData.map(d => d.heartRate);
    const allBloodOxygen = currentLog.secondsData.map(d => d.bloodOxygen);
    currentLog.averageHeartRate = calculateAverage(allHeartRates);
    currentLog.averageBloodOxygen = calculateAverage(allBloodOxygen);

    // Kiểm tra xem đã hết giờ chưa
    const logEndTime = new Date(currentHour);
    logEndTime.setHours(logEndTime.getHours() + 1);
    if (currentTime >= logEndTime) {
      currentLog.isRecording = false;
      setCurrentRecording(false, null);
    }

    saveLogs(logs);
    return data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    // Nếu không có tín hiệu, dừng ghi
    const { currentHour } = getCurrentRecording();
    if (currentHour) {
      const logs = loadLogs();
      const currentLog = logs.find(log => log.hour === currentHour);
      if (currentLog) {
        currentLog.isRecording = false;
        saveLogs(logs);
        setCurrentRecording(false, null);
        
        toast({
          title: "Mất kết nối",
          description: "Không thể kết nối với thiết bị. Đã dừng ghi.",
          variant: "destructive",
        });
      }
    }
    return null;
  }
};

export const getWaterRecommendation = async (
  heartRate: number,
  bloodOxygen: number
): Promise<{ recommendation: string; glassesCount: number }> => {
  let baseGlasses = 8; // Default recommendation
  
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

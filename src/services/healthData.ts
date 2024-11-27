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

interface WaterRecommendation {
  recommendation: string;
  glassesCount: number;
}

const API_ENDPOINT = 'http://192.168.1.15/data';
export const LOGS_STORAGE_KEY = 'health_logs';
const CHAT_STORAGE_KEY = 'chat_messages';
const CURRENT_RECORDING_KEY = 'current_recording';

// Kiểm tra tính hợp lệ của dữ liệu cho 5 lần ghi đầu tiên
const isValidFirstFiveReading = (heartRate: number, bloodOxygen: number): boolean => {
  return (
    heartRate > 0 && 
    heartRate <= 100 && // Chỉ lấy BPM <= 100 cho 5 lần đầu
    bloodOxygen > 0 && 
    bloodOxygen <= 100
  );
};

// Kiểm tra tính hợp lệ của dữ liệu cho các lần ghi sau
const isValidLaterReading = (heartRate: number, bloodOxygen: number): boolean => {
  return (
    heartRate > 0 && 
    bloodOxygen > 0 && 
    bloodOxygen <= 100 // Chỉ kiểm tra SpO2 <= 100 cho các lần sau
  );
};

// Load logs từ local storage
export const loadLogs = (): HourlyLog[] => {
  const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  const logs = storedLogs ? JSON.parse(storedLogs) : [];
  
  // Lọc lại dữ liệu hợp lệ cho mỗi log
  return logs.map((log: HourlyLog) => {
    // Tách ra 5 bản ghi đầu và các bản ghi còn lại
    const firstFive = log.secondsData.slice(0, 5);
    const remaining = log.secondsData.slice(5);

    // Lọc 5 bản ghi đầu với điều kiện nghiêm ngặt hơn
    const validFirstFive = firstFive
      .filter(data => isValidFirstFiveReading(data.heartRate, data.bloodOxygen));

    // Lọc các bản ghi còn lại với điều kiện chỉ kiểm tra SpO2
    const validRemaining = remaining
      .filter(data => isValidLaterReading(data.heartRate, data.bloodOxygen));

    // Kết hợp lại
    const validData = [...validFirstFive, ...validRemaining];

    // Tính lại trung bình dựa trên dữ liệu hợp lệ
    const avgHeartRate = validData.length > 0
      ? Math.round(validData.reduce((sum, data) => sum + data.heartRate, 0) / validData.length)
      : 0;
    
    const avgBloodOxygen = validData.length > 0
      ? Math.round(validData.reduce((sum, data) => sum + data.bloodOxygen, 0) / validData.length)
      : 0;

    return {
      ...log,
      secondsData: validData,
      averageHeartRate: avgHeartRate,
      averageBloodOxygen: avgBloodOxygen
    };
  });
};

export const saveLogs = (logs: HourlyLog[]) => {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
};

// Lấy trạng thái ghi hiện tại
export const getCurrentRecording = (): { isRecording: boolean; currentHour: string | null } => {
  const stored = localStorage.getItem(CURRENT_RECORDING_KEY);
  return stored ? JSON.parse(stored) : { isRecording: false, currentHour: null };
};

// Cập nhật trạng thái ghi
export const setCurrentRecording = (isRecording: boolean, currentHour: string | null) => {
  localStorage.setItem(CURRENT_RECORDING_KEY, JSON.stringify({ isRecording, currentHour }));
};

// Tính trung bình của một mảng số
const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Math.round(sum / numbers.length);
};

// Cập nhật log cho giờ hiện tại
const updateCurrentHourLog = (logs: HourlyLog[], newData: HealthData): HourlyLog[] => {
  const currentHour = new Date().setMinutes(0, 0, 0);
  const hourString = new Date(currentHour).toISOString();
  
  const existingLogIndex = logs.findIndex(log => log.hour === hourString);
  
  if (existingLogIndex >= 0) {
    const updatedLog = { ...logs[existingLogIndex] };
    
    // Kiểm tra số lượng bản ghi hợp lệ hiện tại
    const validFirstFive = updatedLog.secondsData
      .slice(0, 5)
      .filter(data => isValidFirstFiveReading(data.heartRate, data.bloodOxygen));

    // Nếu chưa đủ 5 bản ghi hợp lệ đầu tiên, áp dụng điều kiện nghiêm ngặt
    if (validFirstFive.length < 5) {
      if (isValidFirstFiveReading(newData.heartRate, newData.bloodOxygen)) {
        updatedLog.secondsData.push(newData);
      }
    } else {
      // Nếu đã đủ 5 bản ghi đầu, chỉ kiểm tra SpO2
      if (isValidLaterReading(newData.heartRate, newData.bloodOxygen)) {
        updatedLog.secondsData.push(newData);
      }
    }
    
    updatedLog.lastRecordTime = new Date().toISOString();
    
    // Tính lại trung bình với tất cả dữ liệu hợp lệ
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
  } else {
    // Tạo log mới cho giờ hiện tại
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

// Fetch health data từ sensor
export const fetchHealthData = async (): Promise<HealthData[]> => {
  try {
    const response = await axios.get<ApiResponse>(API_ENDPOINT);
    
    if (!response.data || typeof response.data.heartRate !== 'number') {
      throw new Error('Invalid data format received');
    }

    const { heartRate, spo2: bloodOxygen } = response.data;

    // Chỉ xử lý dữ liệu hợp lệ
    if (isValidFirstFiveReading(heartRate, bloodOxygen) || isValidLaterReading(heartRate, bloodOxygen)) {
      const data: HealthData = {
        heartRate,
        bloodOxygen,
        timestamp: new Date().toISOString(),
        heartRates: Array(10).fill(heartRate),
        oxygenLevels: Array(10).fill(bloodOxygen),
      };

      // Cập nhật logs
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

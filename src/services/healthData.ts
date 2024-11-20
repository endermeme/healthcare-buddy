import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';

export interface HealthData {
  heartRate: number;
  timestamp: string;
}

const logHealthData = (data: HealthData) => {
  const vietnamTime = formatInTimeZone(new Date(data.timestamp), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
  const logEntry = `${vietnamTime} - Heart Rate: ${data.heartRate}\n`;
  
  // Send log to server
  axios.post('http://192.168.1.15/log', {
    timestamp: vietnamTime,
    data: logEntry
  }).catch(error => {
    console.error('Failed to log health data:', error);
  });
};

export const fetchHealthData = async (): Promise<HealthData> => {
  const response = await axios.get('http://192.168.1.15/data');
  const data = {
    heartRate: response.data.heartRate,
    timestamp: new Date().toISOString(),
  };

  // Log the data
  logHealthData(data);

  return data;
};
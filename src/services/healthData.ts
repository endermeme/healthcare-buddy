import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from '@/components/ui/use-toast';

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
  try {
    console.log('Attempting to fetch data from http://192.168.1.15/data');
    const response = await axios.get('http://192.168.1.15/data');
    console.log('Received response:', response.data);
    
    if (!response.data || typeof response.data.heartRate !== 'number') {
      throw new Error('Invalid data format received');
    }

    const data = {
      heartRate: response.data.heartRate,
      timestamp: new Date().toISOString(),
    };

    // Log the data
    logHealthData(data);
    return data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    toast({
      title: "Connection Error",
      description: "Could not connect to the heart rate sensor. Please check if the device is online.",
      variant: "destructive",
    });
    throw error;
  }
};
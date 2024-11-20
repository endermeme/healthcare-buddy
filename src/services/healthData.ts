import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export interface HealthData {
  heartRate: number;
  timestamp: string;
}

const logHealthData = async (data: HealthData) => {
  const vietnamTime = formatInTimeZone(
    new Date(data.timestamp),
    'Asia/Ho_Chi_Minh',
    'yyyy-MM-dd HH:mm:ss'
  );
  const logEntry = `${vietnamTime} - Heart Rate: ${data.heartRate}\n`;
  
  try {
    await axios.post('http://192.168.1.15/log', {
      timestamp: vietnamTime,
      data: logEntry
    });
  } catch (error) {
    console.error('Failed to log health data:', error);
  }
};

export const fetchHealthData = async (): Promise<HealthData> => {
  const netInfo = await NetInfo.fetch();
  
  if (!netInfo.isConnected) {
    Alert.alert(
      'No Internet Connection',
      'Please check your internet connection and try again.'
    );
    throw new Error('No internet connection');
  }

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

    await logHealthData(data);
    return data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    Alert.alert(
      'Connection Error',
      'Could not connect to the heart rate sensor. Please check if the device is online.'
    );
    throw error;
  }
};
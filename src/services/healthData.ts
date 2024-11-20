import axios from 'axios';

export interface HealthData {
  heartRate: number;
  oxygenLevel: number;
  timestamp: string;
}

export const fetchHealthData = async (): Promise<HealthData> => {
  const response = await axios.get('http://192.168.1.15/data');
  return {
    heartRate: response.data.heartRate,
    oxygenLevel: response.data.oxygenLevel,
    timestamp: new Date().toISOString(),
  };
};
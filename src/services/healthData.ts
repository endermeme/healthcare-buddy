import axios from 'axios';
import { format, addMinutes } from 'date-fns';
import { vi } from 'date-fns/locale';

export interface HealthData {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

export interface HealthLogPayload {
  bpm: number[];
  oxy: number[];
}

const API_URL = 'http://localhost:3001/api/health-log';

export const postHealthLog = async (data: HealthLogPayload): Promise<HealthData[]> => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const calculateAverages = (data: HealthData[]) => {
  if (data.length === 0) return { avgHeartRate: 0, avgBloodOxygen: 0 };
  
  const sum = data.reduce((acc, curr) => ({
    heartRate: acc.heartRate + curr.heartRate,
    bloodOxygen: acc.bloodOxygen + curr.bloodOxygen
  }), { heartRate: 0, bloodOxygen: 0 });

  return {
    avgHeartRate: Math.round(sum.heartRate / data.length),
    avgBloodOxygen: Math.round(sum.bloodOxygen / data.length)
  };
};
import axios from 'axios';
import { format, addDays, isBefore } from 'date-fns';

export interface MinuteLog {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

export interface LogEntry {
  minute: string;
  logs: MinuteLog[];
  avgHeartRate: number;
  avgBloodOxygen: number;
}

const API_URL = 'http://192.168.1.15/logdemo';
const LOG_STORAGE_KEY = 'health_minute_logs';

export const fetchAndStoreLogs = async (): Promise<LogEntry[]> => {
  try {
    const response = await axios.get<MinuteLog[]>(API_URL);
    const validLogs = response.data.filter((log: MinuteLog) => log.bloodOxygen > 60);
    
    // Group logs by minute
    const groupedLogs = validLogs.reduce<Record<string, MinuteLog[]>>((acc, log) => {
      const minute = new Date(log.timestamp).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      if (!acc[minute]) {
        acc[minute] = [];
      }
      acc[minute].push(log);
      return acc;
    }, {});

    // Calculate averages and format entries
    const entries: LogEntry[] = Object.entries(groupedLogs).map(([minute, logs]): LogEntry => {
      const avgHeartRate = Math.round(
        logs.reduce((sum, log) => sum + log.heartRate, 0) / logs.length
      );
      const avgBloodOxygen = Math.round(
        logs.reduce((sum, log) => sum + log.bloodOxygen, 0) / logs.length
      );

      return {
        minute,
        logs,
        avgHeartRate,
        avgBloodOxygen
      };
    });

    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries));
    return entries;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

export const getStoredLogs = (): LogEntry[] => {
  const stored = localStorage.getItem(LOG_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};
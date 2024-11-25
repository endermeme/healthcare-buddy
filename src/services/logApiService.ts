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
    // Get new logs from API
    const response = await axios.get<MinuteLog[]>(API_URL);
    const validLogs = response.data.filter((log: MinuteLog) => log.bloodOxygen > 60);
    
    // Get existing stored logs
    const existingEntries = getStoredLogs();
    
    // Group new logs by minute
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

    // Merge with existing logs
    Object.entries(groupedLogs).forEach(([minute, logs]) => {
      const existingEntry = existingEntries.find(entry => entry.minute === minute);
      
      if (existingEntry) {
        // Merge new logs with existing ones
        existingEntry.logs = [...existingEntry.logs, ...logs];
        // Recalculate averages
        existingEntry.avgHeartRate = Math.round(
          existingEntry.logs.reduce((sum, log) => sum + log.heartRate, 0) / existingEntry.logs.length
        );
        existingEntry.avgBloodOxygen = Math.round(
          existingEntry.logs.reduce((sum, log) => sum + log.bloodOxygen, 0) / existingEntry.logs.length
        );
      } else {
        // Create new entry
        existingEntries.push({
          minute,
          logs,
          avgHeartRate: Math.round(
            logs.reduce((sum, log) => sum + log.heartRate, 0) / logs.length
          ),
          avgBloodOxygen: Math.round(
            logs.reduce((sum, log) => sum + log.bloodOxygen, 0) / logs.length
          )
        });
      }
    });

    // Sort entries by time (newest first)
    const sortedEntries = existingEntries.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.minute}`);
      const timeB = new Date(`1970/01/01 ${b.minute}`);
      return timeB.getTime() - timeA.getTime();
    });

    // Store updated logs
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(sortedEntries));
    return sortedEntries;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return getStoredLogs(); // Return existing logs if fetch fails
  }
};

export const getStoredLogs = (): LogEntry[] => {
  const stored = localStorage.getItem(LOG_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};
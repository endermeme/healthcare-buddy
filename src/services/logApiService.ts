import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { analyzeHealthData } from './geminiService';

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
  analysis?: any;
  isComplete?: boolean;
}

const API_URL = 'http://192.168.1.15/logdemo';
const LOG_STORAGE_KEY = 'health_minute_logs';

export const fetchAndStoreLogs = async (): Promise<LogEntry[]> => {
  try {
    const response = await axios.get<MinuteLog[]>(API_URL);
    console.log('API Response:', response.data);
    
    const validLogs = response.data.filter(log => 
      log.heartRate > 0 && log.bloodOxygen > 0
    );
    
    const existingEntries = getStoredLogs();
    
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

    const entries: LogEntry[] = await Promise.all(
      Object.entries(groupedLogs).map(async ([minute, logs]) => {
        const existingEntry = existingEntries.find(entry => entry.minute === minute);
        
        if (existingEntry) {
          existingEntry.logs = [...existingEntry.logs, ...logs];
          const avgHeartRate = Math.round(
            existingEntry.logs.reduce((sum, log) => sum + log.heartRate, 0) / existingEntry.logs.length
          );
          const avgBloodOxygen = Math.round(
            existingEntry.logs.reduce((sum, log) => sum + log.bloodOxygen, 0) / existingEntry.logs.length
          );
          
          if (!existingEntry.analysis && existingEntry.logs.length >= 10) {
            try {
              const analysis = await analyzeHealthData(
                existingEntry.logs.map(l => l.heartRate),
                existingEntry.logs.map(l => l.bloodOxygen),
                minute
              );
              existingEntry.analysis = analysis;
              existingEntry.isComplete = true;
            } catch (error) {
              console.error('Error analyzing health data:', error);
            }
          }
          
          return {
            ...existingEntry,
            avgHeartRate,
            avgBloodOxygen,
          };
        }
        
        return {
          minute,
          logs,
          avgHeartRate: Math.round(
            logs.reduce((sum, log) => sum + log.heartRate, 0) / logs.length
          ),
          avgBloodOxygen: Math.round(
            logs.reduce((sum, log) => sum + log.bloodOxygen, 0) / logs.length
          ),
          isComplete: false,
        };
      })
    );

    const sortedEntries = entries.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.minute}`);
      const timeB = new Date(`1970/01/01 ${b.minute}`);
      return timeB.getTime() - timeA.getTime();
    });

    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(sortedEntries));
    return sortedEntries;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return getStoredLogs();
  }
};

export const getStoredLogs = (): LogEntry[] => {
  const stored = localStorage.getItem(LOG_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};
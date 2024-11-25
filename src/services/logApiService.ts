import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { analyzeHealthData } from './geminiService';

export interface MinuteLog {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

export interface LogEntry {
  timestamp: string;
  minute: string;
  logs: MinuteLog[];
  avgHeartRate: number;
  avgBloodOxygen: number;
  heartRate: number;
  bloodOxygen: number;
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
            timestamp: logs[0].timestamp,
            heartRate: logs[0].heartRate,
            bloodOxygen: logs[0].bloodOxygen
          };
        }
        
        return {
          minute,
          timestamp: logs[0].timestamp,
          logs,
          avgHeartRate: Math.round(
            logs.reduce((sum, log) => sum + log.heartRate, 0) / logs.length
          ),
          avgBloodOxygen: Math.round(
            logs.reduce((sum, log) => sum + log.bloodOxygen, 0) / logs.length
          ),
          heartRate: logs[0].heartRate,
          bloodOxygen: logs[0].bloodOxygen,
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

export const downloadLog = (date: string, format: 'txt' | 'csv' = 'csv') => {
  const logs = getStoredLogs();
  let content = '';
  
  if (format === 'csv') {
    content = 'Timestamp,Heart Rate,Blood Oxygen,Analysis\n';
    logs.forEach(hourLog => {
      hourLog.logs.forEach(log => {
        content += `${log.timestamp},${log.heartRate},${log.bloodOxygen},${hourLog.analysis?.analysis.health_summary || ''}\n`;
      });
    });
  } else {
    logs.forEach(hourLog => {
      content += `=== ${hourLog.timestamp} ===\n`;
      hourLog.logs.forEach(log => {
        content += `Time: ${new Date(log.timestamp).toLocaleTimeString()}\n`;
        content += `Heart Rate: ${log.heartRate} BPM\n`;
        content += `Blood Oxygen: ${log.bloodOxygen}%\n\n`;
      });
      if (hourLog.analysis) {
        content += `Analysis:\n${hourLog.analysis.analysis.health_summary}\n`;
        content += `Recommendation: ${hourLog.analysis.analysis.recommendation}\n\n`;
      }
    });
  }

  const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `health_log_${date}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
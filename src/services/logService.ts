import { History } from 'lucide-react';
import { analyzeHealthData, type GeminiAnalysis } from './geminiService';

interface HealthLog {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

export interface LogEntry {
  timestamp: string;
  logs: HealthLog[];
  analysis?: GeminiAnalysis;
  isComplete: boolean;
}

interface DailyLogs {
  [date: string]: LogEntry[];
}

const LOG_STORAGE_KEY = 'health_logs';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const getHourString = (date: Date) => {
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getDailyLogs = (): DailyLogs => {
  try {
    const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
    return storedLogs ? JSON.parse(storedLogs) : {};
  } catch (error) {
    console.error('Error reading logs:', error);
    return {};
  }
};

export const getLogsForDate = (date: string): LogEntry[] => {
  const allLogs = getDailyLogs();
  return allLogs[date] || [];
};

export const addHealthLog = async (heartRate: number, bloodOxygen: number): Promise<string | undefined> => {
  if (heartRate < 50 || heartRate > 120 || bloodOxygen < 80 || bloodOxygen > 100) {
    return undefined;
  }

  const now = new Date();
  const dateStr = getDateString(now);
  const hourStr = getHourString(now);
  
  const currentLogs = getDailyLogs();
  const todayLogs = currentLogs[dateStr] || [];

  // Find or create the current hour's log entry
  let currentHourEntry = todayLogs.find(entry => entry.timestamp === hourStr);
  
  if (!currentHourEntry) {
    currentHourEntry = {
      timestamp: hourStr,
      logs: [],
      isComplete: false
    };
    todayLogs.push(currentHourEntry);
  }

  // Add new log
  const newLog: HealthLog = {
    timestamp: now.toISOString(),
    heartRate,
    bloodOxygen,
  };
  
  currentHourEntry.logs.push(newLog);

  // Check if hour is complete and analyze if needed
  const hourEnd = new Date(now);
  hourEnd.setMinutes(59, 59, 999);
  if (now >= hourEnd && !currentHourEntry.isComplete) {
    currentHourEntry.isComplete = true;
    try {
      const heartRates = currentHourEntry.logs.map(log => log.heartRate);
      const oxygenLevels = currentHourEntry.logs.map(log => log.bloodOxygen);
      const analysis = await analyzeHealthData(heartRates, oxygenLevels, hourStr);
      currentHourEntry.analysis = analysis;
    } catch (error) {
      console.error('Error analyzing health data:', error);
    }
  }

  currentLogs[dateStr] = todayLogs;
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(currentLogs));

  return dateStr;
};

export const clearOldLogs = () => {
  const allLogs = getDailyLogs();
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - ONE_WEEK_MS);
  
  const filteredLogs = Object.entries(allLogs)
    .filter(([dateStr]) => new Date(dateStr) >= cutoffDate)
    .reduce((acc: DailyLogs, [date, logs]) => {
      acc[date] = logs;
      return acc;
    }, {});

  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(filteredLogs));
};

export const LogHistoryIcon = History;

export const downloadLog = (date: string, format: 'txt' | 'csv' = 'csv') => {
  const logs = getLogsForDate(date);
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
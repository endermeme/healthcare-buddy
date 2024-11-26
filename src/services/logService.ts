import { History } from 'lucide-react';

export interface HourlyHealthLog {
  time: string; // Format: "HH:00"
  heartRateReadings: number[];
  oxygenReadings: number[];
  timestamp: string;
}

interface DailyLogs {
  [date: string]: HourlyHealthLog[];
}

const LOG_STORAGE_KEY = 'health_logs';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const getHourString = (date: Date) => {
  return `${date.getHours()}:00`;
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

export const getLogsForDate = (date: string): HourlyHealthLog[] => {
  const allLogs = getDailyLogs();
  return allLogs[date] || [];
};

export const addHealthLog = (heartRate: number, bloodOxygen: number): string | undefined => {
  const now = new Date();
  // Round down to the nearest hour
  now.setMinutes(0, 0, 0);
  
  const dateStr = getDateString(now);
  const hourStr = getHourString(now);
  
  const currentLogs = getDailyLogs();
  const todayLogs = currentLogs[dateStr] || [];

  let currentHourLog = todayLogs.find(log => log.time === hourStr);

  if (!currentHourLog) {
    currentHourLog = {
      time: hourStr,
      heartRateReadings: [],
      oxygenReadings: [],
      timestamp: now.toISOString()
    };
    todayLogs.push(currentHourLog);
  }

  currentHourLog.heartRateReadings.push(heartRate);
  currentHourLog.oxygenReadings.push(bloodOxygen);

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
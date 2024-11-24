import axios from 'axios';
import { format, addDays, isBefore } from 'date-fns';

export interface HourlyLog {
  hour: number;
  avgHeartRate: number;
  avgBloodOxygen: number;
  aiResponses: string[];
  timestamp: string;
}

export interface DailyLog {
  date: string;
  hourlyLogs: HourlyLog[];
}

const LOG_STORAGE_KEY = 'health_daily_logs';
const FAVORITE_LOGS_KEY = 'favorite_logs';
const API_URL = 'http://192.168.1.15/log';

export const fetchDailyLogs = async (date: Date): Promise<HourlyLog[]> => {
  try {
    const response = await axios.get(`${API_URL}?date=${format(date, 'yyyy-MM-dd')}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

export const saveDailyLogs = (logs: DailyLog[]) => {
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
};

export const getDailyLogs = (): DailyLog[] => {
  const logs = localStorage.getItem(LOG_STORAGE_KEY);
  return logs ? JSON.parse(logs) : [];
};

export const cleanOldLogs = () => {
  const logs = getDailyLogs();
  const sevenDaysAgo = addDays(new Date(), -7);
  
  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.date);
    return isBefore(sevenDaysAgo, logDate);
  });

  saveDailyLogs(filteredLogs);
};

export const addToFavorites = (log: DailyLog) => {
  const favorites = getFavoriteLogs();
  if (!favorites.some(f => f.date === log.date)) {
    favorites.push(log);
    localStorage.setItem(FAVORITE_LOGS_KEY, JSON.stringify(favorites));
  }
};

export const getFavoriteLogs = (): DailyLog[] => {
  const logs = localStorage.getItem(FAVORITE_LOGS_KEY);
  return logs ? JSON.parse(logs) : [];
};

export const downloadLogs = (logs: DailyLog[]) => {
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `health_logs_${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
import { format } from 'date-fns';
import { type MinuteLog } from '@/services/logService';

export interface DailyLog {
  date: string;
  minuteLogs: MinuteLog[];
}

const LOG_STORAGE_KEY = 'health_daily_logs';
const FAVORITE_LOGS_KEY = 'favorite_logs';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const fetchDailyLogs = async (date: Date): Promise<MinuteLog[]> => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
  if (!storedLogs) return [];
  
  const logs: DailyLog[] = JSON.parse(storedLogs);
  const dayLog = logs.find(log => log.date === dateStr);
  return dayLog?.minuteLogs || [];
};

export const saveDailyLogs = (logs: DailyLog[]) => {
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
};

export const getDailyLogs = (): DailyLog[] => {
  const logs = localStorage.getItem(LOG_STORAGE_KEY);
  return logs ? JSON.parse(logs) : [];
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

export const cleanOldLogs = () => {
  const allLogs = getDailyLogs();
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - ONE_WEEK_MS);
  
  const filteredLogs = allLogs.filter(log => new Date(log.date) >= cutoffDate);
  saveDailyLogs(filteredLogs);
};
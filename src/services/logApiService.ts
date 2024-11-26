import { format } from 'date-fns';
import { HourlyHealthLog } from './logService';

export interface DailyLog {
  date: string;
  hourlyLogs: HourlyHealthLog[];
}

const LOG_STORAGE_KEY = 'health_daily_logs';
const FAVORITE_LOGS_KEY = 'favorite_logs';

export const fetchDailyLogs = async (date: Date): Promise<HourlyHealthLog[]> => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
  if (!storedLogs) return [];
  
  const logs: DailyLog[] = JSON.parse(storedLogs);
  const dayLog = logs.find(log => log.date === dateStr);
  return dayLog?.hourlyLogs || [];
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
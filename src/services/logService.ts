import { History } from 'lucide-react';

export interface SecondData {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

export interface MinuteLog {
  minute: string;
  isRecording: boolean;
  secondsData: SecondData[];
}

export interface HourLog {
  hour: string;
  minuteLogs: MinuteLog[];
  timestamp: string;
}

interface DailyLogs {
  [date: string]: HourLog[];
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

export const getLogsForDate = (date: string): HourLog[] => {
  const allLogs = getDailyLogs();
  return allLogs[date] || [];
};

export const addHealthLog = (heartRate: number, bloodOxygen: number): string | undefined => {
  const now = new Date();
  const dateStr = getDateString(now);
  const hourStr = getHourString(now);
  const minuteStr = now.toISOString();
  
  const currentLogs = getDailyLogs();
  const todayLogs = currentLogs[dateStr] || [];

  // Tìm log của giờ hiện tại
  let currentHourLog = todayLogs.find(log => log.hour === hourStr);

  if (!currentHourLog) {
    // Tạo log mới cho giờ hiện tại
    currentHourLog = {
      hour: hourStr,
      minuteLogs: [],
      timestamp: now.toISOString()
    };
    todayLogs.push(currentHourLog);
  }

  // Tìm log của phút hiện tại
  let currentMinuteLog = currentHourLog.minuteLogs.find(
    log => new Date(log.minute).getMinutes() === now.getMinutes()
  );

  if (!currentMinuteLog) {
    // Tạo log mới cho phút hiện tại
    currentMinuteLog = {
      minute: minuteStr,
      isRecording: true,
      secondsData: []
    };
    currentHourLog.minuteLogs.push(currentMinuteLog);
  }

  // Thêm dữ liệu mới
  currentMinuteLog.secondsData.push({
    timestamp: now.toISOString(),
    heartRate,
    bloodOxygen
  });

  // Cập nhật logs
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

export const deleteLog = (date: string, hourIndex: number) => {
  const allLogs = getDailyLogs();
  if (allLogs[date]) {
    allLogs[date].splice(hourIndex, 1);
    if (allLogs[date].length === 0) {
      delete allLogs[date];
    }
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(allLogs));
  }
};

export const LogHistoryIcon = History;
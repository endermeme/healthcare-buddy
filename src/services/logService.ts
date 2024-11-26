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

// Helper để lấy chuỗi ngày dạng YYYY-MM-DD
const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const getHourString = (date: Date) => {
  return `${date.getHours()}:00`;
};

// Lấy tất cả log theo ngày
export const getDailyLogs = (): DailyLogs => {
  try {
    const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
    return storedLogs ? JSON.parse(storedLogs) : {};
  } catch (error) {
    console.error('Error reading logs:', error);
    return {};
  }
};

// Lấy log cho một ngày cụ thể
export const getLogsForDate = (date: string): HourlyHealthLog[] => {
  const allLogs = getDailyLogs();
  return allLogs[date] || [];
};

// Thêm log mới
export const addHealthLog = (heartRate: number, bloodOxygen: number): string | undefined => {
  const now = new Date();
  const dateStr = getDateString(now);
  const hourStr = getHourString(now);
  
  const currentLogs = getDailyLogs();
  const todayLogs = currentLogs[dateStr] || [];

  // Tìm log của giờ hiện tại
  let currentHourLog = todayLogs.find(log => log.time === hourStr);

  if (!currentHourLog) {
    // Tạo log mới cho giờ hiện tại
    currentHourLog = {
      time: hourStr,
      heartRateReadings: [],
      oxygenReadings: [],
      timestamp: now.toISOString()
    };
    todayLogs.push(currentHourLog);
  }

  // Thêm các chỉ số mới
  currentHourLog.heartRateReadings.push(heartRate);
  currentHourLog.oxygenReadings.push(bloodOxygen);

  // Cập nhật logs
  currentLogs[dateStr] = todayLogs;
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(currentLogs));

  return dateStr;
};

// Xóa log cũ hơn 1 tuần
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

// Lấy thống kê cho một giờ
export const getHourlyStats = (logs: HourlyHealthLog) => {
  const heartRateStats = {
    avg: Math.round(logs.heartRateReadings.reduce((a, b) => a + b, 0) / logs.heartRateReadings.length),
    min: Math.min(...logs.heartRateReadings),
    max: Math.max(...logs.heartRateReadings)
  };

  const oxygenStats = {
    avg: Math.round(logs.oxygenReadings.reduce((a, b) => a + b, 0) / logs.oxygenReadings.length),
    min: Math.min(...logs.oxygenReadings),
    max: Math.max(...logs.oxygenReadings)
  };

  return {
    time: logs.time,
    heartRate: heartRateStats,
    oxygen: oxygenStats,
    readings: logs.heartRateReadings.length
  };
};

export const LogHistoryIcon = History;
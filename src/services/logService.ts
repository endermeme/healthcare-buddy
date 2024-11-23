import { History } from 'lucide-react';

interface HealthLog {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

interface DailyLogs {
  [date: string]: HealthLog[];
}

const LOG_STORAGE_KEY = 'health_logs';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Helper để lấy chuỗi ngày dạng YYYY-MM-DD
const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Lấy tất cả log theo ngày
export const getDailyLogs = (): DailyLogs => {
  try {
    const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
    if (!storedLogs) return {};
    
    const logs: HealthLog[] = JSON.parse(storedLogs);
    return logs.reduce((acc: DailyLogs, log) => {
      const dateStr = getDateString(new Date(log.timestamp));
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(log);
      return acc;
    }, {});
  } catch (error) {
    console.error('Error reading logs:', error);
    return {};
  }
};

// Lấy log cho một ngày cụ thể
export const getLogsForDate = (date: string): HealthLog[] => {
  const allLogs = getDailyLogs();
  return allLogs[date] || [];
};

// Thêm log mới
export const addHealthLog = (heartRate: number, bloodOxygen: number): string | undefined => {
  // Chỉ ghi log nếu giá trị hợp lệ
  if (heartRate < 50 || heartRate > 120 || bloodOxygen < 80 || bloodOxygen > 100) {
    return undefined;
  }

  const now = new Date();
  const dateStr = getDateString(now);
  
  const currentLogs = getDailyLogs();
  const todayLogs = currentLogs[dateStr] || [];

  // Thêm log mới
  const newLog: HealthLog = {
    timestamp: now.toISOString(),
    heartRate,
    bloodOxygen,
  };

  // Cập nhật log cho ngày hiện tại
  todayLogs.push(newLog);
  currentLogs[dateStr] = todayLogs;

  // Chuyển về dạng mảng để lưu trữ
  const allLogs = Object.values(currentLogs).flat();
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(allLogs));

  return dateStr;
};

// Xóa log cũ hơn 1 tuần
export const clearOldLogs = () => {
  const allLogs = getDailyLogs();
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - ONE_WEEK_MS);
  
  // Lọc bỏ log cũ
  const filteredLogs = Object.entries(allLogs)
    .filter(([dateStr]) => new Date(dateStr) >= cutoffDate)
    .reduce((acc: DailyLogs, [date, logs]) => {
      acc[date] = logs;
      return acc;
    }, {});

  // Chuyển về dạng mảng và lưu
  const logsArray = Object.values(filteredLogs).flat();
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logsArray));
};

// Biểu tượng lịch sử
export const LogHistoryIcon = History;

// Lấy thống kê cho một ngày
export const getDailyStats = (date: string) => {
  const logs = getLogsForDate(date);
  
  if (logs.length === 0) {
    return null;
  }

  const stats = logs.reduce((acc, log) => ({
    totalHeartRate: acc.totalHeartRate + log.heartRate,
    totalBloodOxygen: acc.totalBloodOxygen + log.bloodOxygen,
    count: acc.count + 1,
    minHeartRate: Math.min(acc.minHeartRate, log.heartRate),
    maxHeartRate: Math.max(acc.maxHeartRate, log.heartRate),
    minBloodOxygen: Math.min(acc.minBloodOxygen, log.bloodOxygen),
    maxBloodOxygen: Math.max(acc.maxBloodOxygen, log.bloodOxygen),
  }), {
    totalHeartRate: 0,
    totalBloodOxygen: 0,
    count: 0,
    minHeartRate: Infinity,
    maxHeartRate: -Infinity,
    minBloodOxygen: Infinity,
    maxBloodOxygen: -Infinity
  });

  return {
    date,
    avgHeartRate: Math.round(stats.totalHeartRate / stats.count),
    avgBloodOxygen: Math.round(stats.totalBloodOxygen / stats.count),
    minHeartRate: stats.minHeartRate,
    maxHeartRate: stats.maxHeartRate,
    minBloodOxygen: stats.minBloodOxygen,
    maxBloodOxygen: stats.maxBloodOxygen,
    readingsCount: stats.count
  };
};
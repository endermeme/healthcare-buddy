interface HealthLog {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

interface DailyLogs {
  [date: string]: HealthLog[];
}

const LOG_STORAGE_KEY = 'health_logs';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Helper to get date string in YYYY-MM-DD format
const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Get all logs grouped by date
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

// Get logs for a specific date
export const getLogsForDate = (date: string): HealthLog[] => {
  const allLogs = getDailyLogs();
  return allLogs[date] || [];
};

// Add new health log
export const addHealthLog = (heartRate: number, bloodOxygen: number): string | undefined => {
  // Only log if values are within valid ranges
  if (heartRate < 50 || heartRate > 120 || bloodOxygen < 80 || bloodOxygen > 100) {
    return undefined;
  }

  const now = new Date();
  const dateStr = getDateString(now);
  
  const currentLogs = getDailyLogs();
  const todayLogs = currentLogs[dateStr] || [];

  // Add new log
  const newLog: HealthLog = {
    timestamp: now.toISOString(),
    heartRate,
    bloodOxygen,
  };

  // Update today's logs
  todayLogs.push(newLog);
  currentLogs[dateStr] = todayLogs;

  // Convert back to array format for storage
  const allLogs = Object.values(currentLogs).flat();
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(allLogs));

  // Create shareable link with date
  const baseUrl = window.location.origin;
  return `${baseUrl}/health-logs?date=${dateStr}`;
};

// Clear logs older than specified days
export const clearOldLogs = (daysToKeep: number = 30) => {
  const allLogs = getDailyLogs();
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - (daysToKeep * ONE_DAY_MS));
  
  // Filter out old logs
  const filteredLogs = Object.entries(allLogs)
    .filter(([dateStr]) => new Date(dateStr) >= cutoffDate)
    .reduce((acc: DailyLogs, [date, logs]) => {
      acc[date] = logs;
      return acc;
    }, {});

  // Convert back to array format and save
  const logsArray = Object.values(filteredLogs).flat();
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logsArray));
};

// Get statistics for a specific date
export const getDailyStats = (date: string) => {
  const logs = getLogsForDate(date);
  
  if (logs.length === 0) {
    return null;
  }

  const stats = logs.reduce((acc, log) => {
    acc.totalHeartRate += log.heartRate;
    acc.totalBloodOxygen += log.bloodOxygen;
    acc.count += 1;
    acc.minHeartRate = Math.min(acc.minHeartRate, log.heartRate);
    acc.maxHeartRate = Math.max(acc.maxHeartRate, log.heartRate);
    acc.minBloodOxygen = Math.min(acc.minBloodOxygen, log.bloodOxygen);
    acc.maxBloodOxygen = Math.max(acc.maxBloodOxygen, log.bloodOxygen);
    return acc;
  }, {
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
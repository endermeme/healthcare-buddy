interface HealthLog {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

const LOG_STORAGE_KEY = 'health_logs';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const addHealthLog = (heartRate: number, bloodOxygen: number) => {
  // Only log if values are within valid ranges
  if (heartRate < 50 || heartRate > 120 || bloodOxygen < 80 || bloodOxygen > 100) {
    return;
  }

  const currentLogs = getHealthLogs();
  const now = new Date();

  // Remove logs older than 24 hours
  const recentLogs = currentLogs.filter(log => {
    const logTime = new Date(log.timestamp);
    return now.getTime() - logTime.getTime() < ONE_DAY_MS;
  });

  // Add new log
  const newLog: HealthLog = {
    timestamp: now.toISOString(),
    heartRate,
    bloodOxygen,
  };

  const updatedLogs = [...recentLogs, newLog];
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));

  // Create shareable link
  const baseUrl = window.location.origin;
  return `${baseUrl}/health-logs?date=${now.toISOString().split('T')[0]}`;
};

export const getHealthLogs = (): HealthLog[] => {
  try {
    const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
    if (!storedLogs) return [];
    return JSON.parse(storedLogs);
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
};

export const clearOldLogs = () => {
  const currentLogs = getHealthLogs();
  const now = new Date();
  
  const recentLogs = currentLogs.filter(log => {
    const logTime = new Date(log.timestamp);
    return now.getTime() - logTime.getTime() < ONE_DAY_MS;
  });

  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(recentLogs));
};
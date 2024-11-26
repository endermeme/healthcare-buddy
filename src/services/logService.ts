import { format } from 'date-fns';

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

const LOG_STORAGE_KEY = 'health_logs';

export const addHealthLog = (heartRate: number, bloodOxygen: number): string | undefined => {
  const now = new Date();
  const dateStr = format(now, 'yyyy-MM-dd');
  const hourStr = format(now, 'HH:00');
  const minuteStr = now.toISOString();

  try {
    const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
    const dailyLogs = storedLogs ? JSON.parse(storedLogs) : {};
    
    if (!dailyLogs[dateStr]) {
      dailyLogs[dateStr] = [];
    }

    // Find or create hour log
    let hourLog = dailyLogs[dateStr].find((log: HourLog) => log.hour === hourStr);
    
    if (!hourLog) {
      hourLog = {
        hour: hourStr,
        minuteLogs: [],
        timestamp: format(now, "yyyy-MM-dd'T'HH:00:00")
      };
      dailyLogs[dateStr].push(hourLog);
    }

    // Find or create minute log
    let minuteLog = hourLog.minuteLogs.find(
      (log: MinuteLog) => format(new Date(log.minute), 'HH:mm') === format(now, 'HH:mm')
    );

    if (!minuteLog) {
      minuteLog = {
        minute: minuteStr,
        isRecording: true,
        secondsData: []
      };
      hourLog.minuteLogs.push(minuteLog);
    }

    // Add new reading
    minuteLog.secondsData.push({
      timestamp: minuteStr,
      heartRate,
      bloodOxygen
    });

    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(dailyLogs));
    return dateStr;
  } catch (error) {
    console.error('Error saving health log:', error);
    return undefined;
  }
};

export const getLogsForDate = (date: string): HourLog[] => {
  try {
    const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
    if (!storedLogs) return [];
    
    const dailyLogs = JSON.parse(storedLogs);
    return dailyLogs[date] || [];
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
};

export const deleteLog = (date: string, hourIndex: number) => {
  try {
    const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
    if (!storedLogs) return;
    
    const dailyLogs = JSON.parse(storedLogs);
    if (dailyLogs[date]) {
      dailyLogs[date].splice(hourIndex, 1);
      if (dailyLogs[date].length === 0) {
        delete dailyLogs[date];
      }
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(dailyLogs));
    }
  } catch (error) {
    console.error('Error deleting log:', error);
  }
};

export const LogHistoryIcon = History;
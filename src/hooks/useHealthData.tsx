import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthData, HealthData } from '@/services/healthData';
import { addHealthLog, clearOldLogs, LogHistoryIcon } from '@/services/logService';
import { toast } from '@/components/ui/use-toast';

export type TimeRange = '10m' | '1h' | '1d';

type HistoryMap = {
  '10m': HealthData[];
  '1h': HealthData[];
  '1d': HealthData[];
};

export const useHealthData = (timeRange: TimeRange) => {
  const [historyMap, setHistoryMap] = useState<HistoryMap>({
    '10m': [],
    '1h': [],
    '1d': [],
  });

  const { data: currentData } = useQuery({
    queryKey: ['healthData'],
    queryFn: fetchHealthData,
    refetchInterval: 5000,
    staleTime: 4000,
    meta: {
      onSuccess: (data: HealthData | null) => {
        if (data) {
          const logDate = addHealthLog(data.heartRate, data.bloodOxygen);
          if (logDate) {
            toast({
              title: "Dữ liệu đã được ghi log",
              description: `Đã ghi log cho ngày ${logDate}:\nNhịp tim: ${data.heartRate} BPM\nỐc-xy máu: ${data.bloodOxygen}%`,
              duration: 5000,
            });
          }
        }
      }
    }
  });

  useEffect(() => {
    const interval = setInterval(clearOldLogs, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentData) {
      const now = new Date();
      
      setHistoryMap(prev => {
        const newHistoryMap = { ...prev };
        const ranges: TimeRange[] = ['10m', '1h', '1d'];
        
        ranges.forEach(range => {
          const timeLimit = new Date(now.getTime() - getTimeRangeInMs(range));
          const currentHistory = prev[range];
          
          // Add new data point
          const updatedHistory = [...currentHistory, currentData]
            .filter(data => new Date(data.timestamp) > timeLimit)
            .slice(-1000); // Limit to last 1000 points
            
          newHistoryMap[range] = updatedHistory;
        });
        
        return newHistoryMap;
      });
    }
  }, [currentData]);

  const history = historyMap[timeRange];

  const getAverages = () => {
    if (history.length === 0) return { 
      avgHeartRate: 0,
      avgBloodOxygen: 0,
    };

    const sum = history.reduce(
      (acc, curr) => ({
        heartRate: acc.heartRate + curr.heartRate,
        bloodOxygen: acc.bloodOxygen + curr.bloodOxygen,
      }),
      { heartRate: 0, bloodOxygen: 0 }
    );

    return {
      avgHeartRate: Math.round(sum.heartRate / history.length),
      avgBloodOxygen: Math.round(sum.bloodOxygen / history.length),
    };
  };

  return {
    currentData,
    history,
    averages: getAverages(),
    LogHistoryIcon,
  };
};

const getTimeRangeInMs = (range: TimeRange): number => {
  switch (range) {
    case '10m':
      return 10 * 60 * 1000;
    case '1h':
      return 60 * 60 * 1000;
    case '1d':
      return 24 * 60 * 60 * 1000;
  }
};
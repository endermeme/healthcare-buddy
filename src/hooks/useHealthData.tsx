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
      onSuccess: async (data: HealthData | null) => {
        if (data && data.heartRate > 0 && data.bloodOxygen > 0) {
          try {
            const logDate = await addHealthLog(data.heartRate, data.bloodOxygen);
            if (logDate) {
              toast({
                title: "Đã ghi log mới",
                description: `Nhịp tim: ${data.heartRate} BPM\nỐc-xy máu: ${data.bloodOxygen}%`,
                duration: 3000,
              });
            }
          } catch (error) {
            console.error('Lỗi khi ghi log:', error);
            toast({
              title: "Lỗi ghi log",
              description: "Không thể ghi log dữ liệu",
              variant: "destructive",
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
          
          const updatedHistory = [...currentHistory, currentData]
            .filter(data => new Date(data.timestamp) > timeLimit)
            .slice(-1000);
            
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
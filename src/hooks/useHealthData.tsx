import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthData, HealthData } from '@/services/healthData';

export type TimeRange = '5m' | '15m' | '30m' | '1h';

export const useHealthData = (timeRange: TimeRange) => {
  const [history, setHistory] = useState<HealthData[]>([]);
  const apiKey = localStorage.getItem('apiKey');

  const { data: currentData } = useQuery({
    queryKey: ['healthData'],
    queryFn: fetchHealthData,
    refetchInterval: 5000,
    staleTime: 4000,
    enabled: !!apiKey,
  });

  useEffect(() => {
    if (currentData) {
      setHistory(prev => {
        const now = new Date();
        const timeLimit = new Date(now.getTime() - getTimeRangeInMs(timeRange));
        
        // Ensure currentData is treated as an array
        const newData = Array.isArray(currentData) ? currentData : [currentData];
        
        return [...prev, ...newData]
          .filter(data => new Date(data.timestamp) > timeLimit)
          .slice(-1000);
      });
    }
  }, [currentData, timeRange]);

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
    currentData: Array.isArray(currentData) ? currentData[0] : currentData,
    history,
    averages: getAverages(),
  };
};

const getTimeRangeInMs = (range: TimeRange): number => {
  switch (range) {
    case '5m':
      return 5 * 60 * 1000;
    case '15m':
      return 15 * 60 * 1000;
    case '30m':
      return 30 * 60 * 1000;
    case '1h':
      return 60 * 60 * 1000;
  }
};
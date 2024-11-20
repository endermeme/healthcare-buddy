import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthData, HealthData } from '@/services/healthData';

export type TimeRange = '24h' | '6h' | '1h' | '60s';

export const useHealthData = (timeRange: TimeRange) => {
  const [history, setHistory] = useState<HealthData[]>([]);

  const { data: currentData } = useQuery({
    queryKey: ['healthData'],
    queryFn: fetchHealthData,
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (currentData) {
      setHistory(prev => {
        const now = new Date();
        const timeLimit = new Date(now.getTime() - getTimeRangeInMs(timeRange));
        
        const updatedHistory = [...prev, currentData]
          .filter(data => new Date(data.timestamp) > timeLimit)
          .slice(-1000); // Keep last 1000 records max

        return updatedHistory;
      });
    }
  }, [currentData, timeRange]);

  const getAverages = () => {
    if (history.length === 0) return { avgHeartRate: 0, avgOxygenLevel: 0 };

    const sum = history.reduce(
      (acc, curr) => ({
        heartRate: acc.heartRate + curr.heartRate,
        oxygenLevel: acc.oxygenLevel + curr.oxygenLevel,
      }),
      { heartRate: 0, oxygenLevel: 0 }
    );

    return {
      avgHeartRate: Math.round(sum.heartRate / history.length),
      avgOxygenLevel: Math.round(sum.oxygenLevel / history.length),
    };
  };

  return {
    currentData,
    history,
    averages: getAverages(),
  };
};

const getTimeRangeInMs = (range: TimeRange): number => {
  switch (range) {
    case '24h':
      return 24 * 60 * 60 * 1000;
    case '6h':
      return 6 * 60 * 60 * 1000;
    case '1h':
      return 60 * 60 * 1000;
    case '60s':
      return 60 * 1000;
  }
};
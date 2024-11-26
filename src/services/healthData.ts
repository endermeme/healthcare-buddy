export interface HealthData {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

export const fetchHealthData = async (): Promise<HealthData> => {
  const response = await fetch('http://localhost:3001/api/health-log');
  if (!response.ok) {
    throw new Error('Failed to fetch health data');
  }
  return response.json();
};

export const getWaterRecommendation = (weight: number): number => {
  return Math.round(weight * 0.033 * 1000);
};
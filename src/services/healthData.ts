export interface HealthData {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
}

export const fetchHealthData = async (): Promise<HealthData> => {
  const response = await fetch('http://192.168.1.15:3001/log');
  if (!response.ok) {
    throw new Error('Failed to fetch health data');
  }
  return response.json();
};

export const calculateAverages = (data: HealthData[]) => {
  if (data.length === 0) {
    return { avgHeartRate: 0, avgBloodOxygen: 0 };
  }
  
  const sum = data.reduce((acc, curr) => ({
    heartRate: acc.heartRate + curr.heartRate,
    bloodOxygen: acc.bloodOxygen + curr.bloodOxygen
  }), { heartRate: 0, bloodOxygen: 0 });

  return {
    avgHeartRate: Math.round(sum.heartRate / data.length),
    avgBloodOxygen: Math.round(sum.bloodOxygen / data.length)
  };
};

export interface WaterRecommendation {
  recommendation: string;
  glassesCount: number;
}

export const getWaterRecommendation = async (heartRate: number, bloodOxygen: number): Promise<WaterRecommendation> => {
  // Simple logic for water recommendation based on heart rate and blood oxygen
  let glassesCount = 8; // Base recommendation
  let recommendation = "Hãy uống đủ nước trong ngày để duy trì sức khỏe.";
  
  if (heartRate > 100 || bloodOxygen < 95) {
    glassesCount = 10;
    recommendation = "Bạn nên uống nhiều nước hơn để cải thiện sức khỏe.";
  }
  
  return { recommendation, glassesCount };
};
export const isValidFirstFiveReading = (heartRate: number, bloodOxygen: number): boolean => {
  return (
    heartRate > 0 && 
    heartRate <= 100 && // Only accept BPM <= 100 for first 5 readings
    bloodOxygen > 0 && 
    bloodOxygen <= 100
  );
};

export const isValidLaterReading = (heartRate: number, bloodOxygen: number): boolean => {
  return (
    heartRate > 0 && 
    bloodOxygen > 0 && 
    bloodOxygen <= 100 // Only check SpO2 <= 100 for later readings
  );
};

export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Math.round(sum / numbers.length);
};